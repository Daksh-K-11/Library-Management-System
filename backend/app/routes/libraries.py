from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from uuid import uuid4
from slugify import slugify
from bson import ObjectId
from bson.errors import InvalidId

from app.models.library import LibraryCreate, LibraryUpdate
from app.auth.deps import get_current_user
from app.db.mongodb import libraries_collection, library_books_collection


router = APIRouter(prefix="/library", tags=["library"])

@router.post("")
async def create_library(
    data: LibraryCreate,
    user_id: str = Depends(get_current_user)
):
    slug = f"{slugify(data.name).lower()}-{uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)

    library = {
        "user_id": user_id,
        "name": data.name,
        "is_public": data.is_public,
        "is_default": False,
        "slug": slug,
        "created_at": now,
        "updated_at": now
    }

    await libraries_collection.insert_one(library)
    return {"message": "Library created", "slug": slug}


@router.get("")
async def list_libraries(user_id: str = Depends(get_current_user)):
    cursor = libraries_collection.find({"user_id": user_id})
    libs = []

    async for lib in cursor:
        lib["id"] = str(lib["_id"])
        del lib["_id"]
        libs.append(lib)

    return libs


@router.patch("/{library_id}")
async def edit_library(
    library_id: str,
    data: LibraryUpdate,
    user_id: str = Depends(get_current_user)
):
    updates = data.model_dump(exclude_unset=True)
    if data.name:
        updates['slug'] = f"{slugify(data.name).lower()}-{uuid4().hex[:6]}"
    if not updates:
        raise HTTPException(400, "No fields to update")

    result = await libraries_collection.update_one(
        {
            "_id": ObjectId(library_id),
            "user_id": user_id,
            "is_default": False
        },
        {
            "$set": {
                **updates,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Library not found or cannot edit default")

    return {"message": "Library updated"}


@router.delete("/{library_id}")
async def delete_library(
    library_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        library_oid = ObjectId(library_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid library ID")
    
    lib = await libraries_collection.find_one({
        "_id": ObjectId(library_id),
        "user_id": user_id
    })

    if not lib:
        raise HTTPException(404, "Library not found")
    if lib["is_default"]:
        raise HTTPException(400, "Default library cannot be deleted")

    await library_books_collection.delete_many({"library_id": lib["_id"]})
    await libraries_collection.delete_one({"_id": lib["_id"]})

    return {"message": "Library deleted"}
