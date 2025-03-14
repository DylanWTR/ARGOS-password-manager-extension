from pydantic import BaseModel, EmailStr
from bson import ObjectId

class UserCreate(BaseModel):
    email: EmailStr
    master_password: str

class UserDB(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
