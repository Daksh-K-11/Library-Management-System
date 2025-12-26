from fastapi import APIRouter, HTTPException
from app.db.mongodb import users_collection
from app.auth.utils import hash_password, verify_password
from app.auth.jwt import create_access_token
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(email: str, password: str):
    if await users_collection.find_one({"email": email}):
        raise HTTPException(400, "User exists")

    hashed = hash_password(password)
    await users_collection.insert_one({
        "email": email,
        "password": hashed
    })

    return {"message": "Registered"}


@router.post("/login")
async def login(email: str, password: str):
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"user_id": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}
