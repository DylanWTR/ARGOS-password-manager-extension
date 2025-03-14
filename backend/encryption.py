from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os
import base64

def generate_key(master_password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = kdf.derive(master_password.encode())
    return key

def encrypt_password(master_password: str, password: str) -> str:
    salt = os.urandom(16)
    key = generate_key(master_password, salt)

    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()

    padded_password = password + (16 - len(password) % 16) * " "  # Padding
    encrypted = encryptor.update(padded_password.encode()) + encryptor.finalize()

    return base64.b64encode(salt + iv + encrypted).decode()

def decrypt_password(master_password: str, encrypted_data: str) -> str:
    encrypted_data = base64.b64decode(encrypted_data)

    salt = encrypted_data[:16]
    iv = encrypted_data[16:32]
    encrypted_password = encrypted_data[32:]

    key = generate_key(master_password, salt)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()

    decrypted_password = decryptor.update(encrypted_password) + decryptor.finalize()
    return decrypted_password.decode().strip()

if __name__ == "__main__":
    test_password = "Test1234"
    master_password = "MonMasterPassword"

    encrypted = encrypt_password(master_password, test_password)
    decrypted = decrypt_password(master_password, encrypted)
