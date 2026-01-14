from fastapi import HTTPException
from bson import ObjectId

from app.db.mongodb import libraries_collection

async def get_library_owned_by_user(library_id: str, user_id: str):
    lib = await libraries_collection.find_one({
        "_id": ObjectId(library_id),
        "user_id": user_id
    })
    if not lib:
        raise HTTPException(403, "Access denied")
    return lib
