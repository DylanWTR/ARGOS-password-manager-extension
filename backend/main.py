from fastapi import FastAPI, HTTPException, Depends, Path
from config import db
from models import UserCreate, UserDB
from auth import hash_password, verify_password, create_access_token
from bson import ObjectId
from fastapi.security import OAuth2PasswordRequestForm
from auth import get_current_user
from encryption import encrypt_password, decrypt_password
from pydantic import BaseModel

app = FastAPI()

class PasswordEntry(BaseModel):
    site: str
    username: str
    password: str
    master_password: str

class PasswordUpdate(BaseModel):
    new_password: str
    master_password: str

@app.post("/register", response_model=UserDB)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.master_password)
    user_data = {"email": user.email, "hashed_password": hashed_password}

    result = await db.users.insert_one(user_data)
    return UserDB(id=str(result.inserted_id), email=user.email, hashed_password=hashed_password)

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def get_user_profile(user: dict = Depends(get_current_user)):
    return {"email": user["email"], "id": str(user["_id"])}

@app.post("/store-password")
async def store_password(entry: PasswordEntry, user: dict = Depends(get_current_user)):
    encrypted_password = encrypt_password(entry.master_password, entry.password)

    password_data = {
        "user_id": str(user["_id"]),
        "site": entry.site,
        "username": entry.username,
        "password": encrypted_password
    }

    await db.passwords.insert_one(password_data)
    return {"message": "Password stored successfully"}

@app.get("/get-passwords")
async def get_passwords(master_password: str, user: dict = Depends(get_current_user)):
    passwords = await db.passwords.find({"user_id": str(user["_id"])}).to_list(100)


    decrypted_passwords = []
    for entry in passwords:
        decrypted_password = decrypt_password(master_password, entry["password"])
        decrypted_passwords.append({
            "site": entry["site"],
            "username": entry["username"],
            "password": decrypted_password
        })

    return decrypted_passwords

@app.delete("/delete-password/{password_id}")
async def delete_password(password_id: str, user: dict = Depends(get_current_user)):
    password_entry = await db.passwords.find_one({"_id": ObjectId(password_id), "user_id": str(user["_id"])})

    if not password_entry:
        raise HTTPException(status_code=404, detail="Password not found")

    await db.passwords.delete_one({"_id": ObjectId(password_id)})
    return {"message": "Password deleted successfully"}

@app.put("/update-password/{password_id}")
async def update_password(password_id: str, update_data: PasswordUpdate, user: dict = Depends(get_current_user)):
    password_entry = await db.passwords.find_one({"_id": ObjectId(password_id), "user_id": str(user["_id"])})

    if not password_entry:
        raise HTTPException(status_code=404, detail="Password not found")

    encrypted_password = encrypt_password(update_data.master_password, update_data.new_password)

    await db.passwords.update_one(
        {"_id": ObjectId(password_id)},
        {"$set": {"password": encrypted_password}}
    )

    return {"message": "Password updated successfully"}
