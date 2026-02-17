from fastapi import APIRouter, Depends, status, Query, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import Optional
import re

from app.models.library_books import LibraryBooksCreate, LibraryBooksRemove
from app.auth.permissions import get_library_owned_by_user
from app.auth.deps import get_current_user
from app.db.mongodb import library_books_collection, libraries_collection
from app.utils.find_missing_ids import find_missing_ids
from app.utils.to_object_id import to_object_ids

router = APIRouter(prefix="/librarybooks", tags=["library_books"])

@router.get("/missing-libraries")
async def get_missing_library_ids(
    user_book_id: str = Query(...),
    user_id: str = Depends(get_current_user)
):
    if not ObjectId.is_valid(user_book_id):
        raise HTTPException(status_code=400, detail="Invalid user_book_id")

    user_book_obj_id = ObjectId(user_book_id)

    pipeline = [
        {
            "$lookup": {
                "from": "library_books",
                "let": {"libraryId": "$_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$library_id", "$$libraryId"]},
                                    {"$eq": ["$user_book_id", user_book_obj_id]}
                                ]
                            }
                        }
                    }
                ],
                "as": "book_match"
            }
        },
        {
            "$match": {
                "user_id": user_id,
                "book_match": {"$size": 0}
            }
        },
        {
            "$project": {
                "book_match": 0
            }
        }
    ]

    missing_libraries = await libraries_collection.aggregate(pipeline).to_list(length=None)

    for lib in missing_libraries:
        lib["_id"] = str(lib["_id"])

    return {
        "count": len(missing_libraries),
        "libraries": missing_libraries
    }



@router.post("/{library_id}", status_code=status.HTTP_201_CREATED)
async def add_books_to_library(
    library_id: str,    
    data: LibraryBooksCreate,
    user_id: str = Depends(get_current_user)
):
    lib = await get_library_owned_by_user(library_id, user_id)
    ops = []
    now = datetime.utcnow()
    
    missing_books_id = await find_missing_ids(
        ids=data.user_book_ids,
        doc_id=library_id,
        collection=library_books_collection
    )

    for ub_id in missing_books_id:
        ops.append({
            "library_id": lib["_id"],
            "user_book_id": ObjectId(ub_id),
            "added_at": now
        })
    
    if ops:
        await library_books_collection.insert_many(ops, ordered=False)
    return {"message": "Books added"}


@router.get("/{library_id}")
async def view_library_books(
    library_id: str,
    user_id: str = Depends(get_current_user),
    
    # Filters
    q: Optional[str] = None,
    genre: Optional[str] = None,
    read_status: Optional[str] = None,
    min_rating: Optional[int] = None,

    # Pagination & sorting
    limit: int = Query(20, ge=1, le=50),
    sort: str = Query("updated_at", pattern="^(updated_at|rating|title)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    cursor: Optional[str] = None,
):
    lib = await get_library_owned_by_user(library_id, user_id)

    direction = -1 if order == "desc" else 1

    # Base match (library scope)
    match: dict = {
        "library_id": lib["_id"]
    }

    pipeline = [
        {"$match": match},

        # 🔗 Join user_books
        {
            "$lookup": {
                "from": "user_books",
                "localField": "user_book_id",
                "foreignField": "_id",
                "as": "user_book"
            }
        },
        {"$unwind": "$user_book"},
    ]

    # 🔍 Filters on user_books
    user_book_match = {"user_book.user_id": user_id}

    if q:
        escaped = re.escape(q.strip().lower())
        user_book_match["user_book.search_blob"] = {
            "$regex": escaped,
            "$options": "i"
        }

    if genre:
        user_book_match["user_book.genres"] = genre

    if read_status:
        user_book_match["user_book.read_status"] = read_status

    if min_rating is not None:
        user_book_match["user_book.rating"] = {"$gte": min_rating}

    # ⏱ Cursor pagination (based on user_book.updated_at)
    if cursor:
        cursor_dt = datetime.fromisoformat(cursor)
        user_book_match["user_book.updated_at"] = {"$lt": cursor_dt}

    pipeline.append({"$match": user_book_match})

    # 🔗 Join books
    pipeline.extend([
        {
            "$lookup": {
                "from": "books",
                "localField": "user_book.book_id",
                "foreignField": "_id",
                "as": "book"
            }
        },
        {"$unwind": "$book"},
    ])

    # 🔀 Sorting
    sort_field = (
        "book.title"
        if sort == "title"
        else f"user_book.{sort}"
    )

    pipeline.extend([
        {
            "$sort": {
                sort_field: direction,
                "_id": direction
            }
        },

        # 📄 Pagination
        {"$limit": limit + 1},
    ])

    cursor_db = library_books_collection.aggregate(pipeline)

    items = []
    async for doc in cursor_db:
        book = dict(doc["book"])
        book["id"] = str(book["_id"])
        del book["_id"]

        items.append({
            "user_book_id": str(doc["user_book"]["_id"]),

            # global book
            "book": book,

            # user editable
            "genres": doc["user_book"]["genres"],
            "tags": doc["user_book"]["tags"],
            "rating": doc["user_book"]["rating"],
            "read_status": doc["user_book"]["read_status"],
            "personal_notes": doc["user_book"].get("personal_notes"),
            "updated_at": doc["user_book"]["updated_at"],
        })

    next_cursor = None
    if len(items) > limit:
        last = items.pop()
        next_cursor = last["updated_at"].isoformat()

    return {
        "library": {
            "id": str(lib["_id"]),
            "name": lib["name"],
            "is_public": lib["is_public"],
            "is_default": lib["is_default"],
        },
        "books": items,
        "next_cursor": next_cursor,
        "limit": limit,
    }


@router.delete("/{library_id}")
async def remove_books_from_library(
    library_id: str,
    data: LibraryBooksRemove,
    user_id: str = Depends(get_current_user)
):
    lib = await get_library_owned_by_user(library_id, user_id)

    await library_books_collection.delete_many({
        "library_id": lib["_id"],
        "user_book_id": {"$in": [ObjectId(i) for i in data.user_book_ids]}
    })

    return {"message": "Books removed from library"}


