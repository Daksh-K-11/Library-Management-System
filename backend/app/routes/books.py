from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
import re
from app.db.mongodb import books_collection, user_books_collection, library_books_collection
from app.models.user_books import UserBookCreate, UserBookUpdate, UserBooksDelete
from app.auth.deps import get_current_user
from app.utils.isbn import normalize_isbn
from app.utils.search import build_search_blob

router = APIRouter(prefix="/books", tags=["Books"])

@router.post("/{isbn}")
async def add_book_to_library(
    isbn: str,
    data: UserBookCreate,
    user_id: str = Depends(get_current_user)
):
    isbn_13 = normalize_isbn(isbn)

    book = await books_collection.find_one({"isbn_13": isbn_13})
    if not book:
        raise HTTPException(404, "Book not found. Lookup ISBN first.")

    now = datetime.now(timezone.utc)
    
    search_blob = build_search_blob(book, data.model_dump())

    await user_books_collection.update_one(
        {"user_id": user_id, "book_id": book["_id"]},
        {
            "$set": {
                **data.model_dump(),
                "search_blob": search_blob
                },
            "$setOnInsert": {
                "user_id": user_id,
                "book_id": book["_id"],
                "created_at": now
            },
            "$currentDate": {"updated_at": True}
        },
        upsert=True
    )

    return {"message": "Book added to library"}


@router.get("")
async def list_user_books(
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
    match: dict = {"user_id": user_id}

    # 🔍 Search (uses search_blob)
    if q:
        escaped = re.escape(q.strip().lower())
        match["search_blob"] = {
            "$regex": escaped,
            "$options": "i"
        }

    if genre:
        match["genres"] = genre

    if read_status:
        match["read_status"] = read_status

    if min_rating is not None:
        match["rating"] = {"$gte": min_rating}

    # ⏱ Cursor pagination
    if cursor:
        cursor_dt = datetime.fromisoformat(cursor)
        match["updated_at"] = {"$lt": cursor_dt}

    direction = -1 if order == "desc" else 1

    pipeline = [
        {"$match": match},

        # Join books
        {
            "$lookup": {
                "from": "books",
                "localField": "book_id",
                "foreignField": "_id",
                "as": "book"
            }
        },
        {"$unwind": "$book"},

        # Sorting (special case for title)
        {
            "$sort": {
                "book.title" if sort == "title" else sort: direction,
                "_id": direction
            }
        },

        # Pagination
        {"$limit": limit + 1},
    ]

    cursor_db = user_books_collection.aggregate(pipeline)

    items = []
    async for doc in cursor_db:
        doc["user_book_id"] = str(doc["_id"])
        doc["book"]["id"] = str(doc["book"]["_id"])
        doc["book_id"] = str(doc["book_id"])

        del doc["_id"]
        del doc["book"]["_id"]
        del doc["user_id"]

        items.append(doc)

    next_cursor = None
    if len(items) > limit:
        last = items.pop()
        next_cursor = last["updated_at"].isoformat()

    return {
        "items": items,
        "next_cursor": next_cursor,
        "limit": limit
    }



@router.patch("/{user_book_id}")
async def update_user_book(
    user_book_id: str,
    data: UserBookUpdate,
    user_id: str = Depends(get_current_user)
):
    oid = ObjectId(user_book_id)

    # 1️⃣ Get existing user-book doc
    user_book = await user_books_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })

    if not user_book:
        raise HTTPException(404, "Book not found")

    # 2️⃣ Update user-book fields
    updates = data.model_dump(exclude_unset=True)

    if updates:
        await user_books_collection.update_one(
            {"_id": oid},
            {
                "$set": updates,
                "$currentDate": {"updated_at": True}
            }
        )

    # 3️⃣ Rebuild search_blob (IMPORTANT)
    book = await books_collection.find_one({
        "_id": ObjectId(user_book["book_id"])
    })

    if book:
        merged_data = {**user_book, **updates}
        search_blob = build_search_blob(book, merged_data)

        await user_books_collection.update_one(
            {"_id": oid},
            {"$set": {"search_blob": search_blob}}
        )

    return {"message": "Book updated"}



@router.delete("")
async def delete_books_globally(
    user_book_ids: UserBooksDelete,
    user_id: str = Depends(get_current_user)
):
    ids = [ObjectId(i) for i in user_book_ids.user_book_ids]

    await library_books_collection.delete_many(
        {"user_book_id": {"$in": ids}}
    )
    await user_books_collection.delete_many(
        {"_id": {"$in": ids}, "user_id": user_id}
    )

    return {"message": "Books deleted from all libraries"}
