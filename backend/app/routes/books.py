# from fastapi import APIRouter, HTTPException, Query, Depends
# from app.db.mongodb import books_collection
# from app.models.book import BookCreate
# from datetime import datetime
# from app.auth.deps import get_current_user

# router = APIRouter(prefix="/books", tags=["Books"])

# @router.post("")
# async def add_or_update_book(book: BookCreate, user_id: str = Depends(get_current_user),):
#     # now = datetime.utcnow()
#     now = datetime.now(datetime.timezone.utc)

#     await books_collection.update_one(
#         {"user_id": user_id, "isbn": book.isbn},
#         {
#             "$set": book.dict(),
#             "$setOnInsert": {"created_at": now},
#             "$currentDate": {"updated_at": True}
#         },
#         upsert=True
#     )
#     return {"message": "Book saved"}

# @router.get("")
# async def list_books(
#     user_id: str = Depends(get_current_user),
#     q: str | None = None,
#     genre: str | None = None,
#     read_status: str | None = None,
#     min_rating: int | None = None,

#     limit: int = Query(20, ge=1, le=50),
#     sort: str = Query("updated_at", pattern="^(updated_at|rating|title)$"),
#     order: str = Query("desc", pattern="^(asc|desc)$"),
#     cursor: str | None = None
# ):
#     query = {"user_id": user_id}

#     if q:
#         query["$text"] = {"$search": q}

#     if genre:
#         query["genres"] = genre

#     if read_status:
#         query["read_status"] = read_status

#     if min_rating:
#         query["rating"] = {"$gte": min_rating}

#     # Cursor logic
#     if cursor:
#         cursor_dt = datetime.fromisoformat(cursor)
#         query["updated_at"] = {"$lt": cursor_dt}

#     direction = -1 if order == "desc" else 1

#     cursor_db = (
#         books_collection
#         .find(query)
#         .sort([(sort, direction), ("_id", direction)])
#         .limit(limit + 1)
#     )

#     books = []
#     async for book in cursor_db:
#         book["id"] = str(book["_id"])
#         del book["_id"]
#         books.append(book)

#     next_cursor = None
#     if len(books) > limit:
#         last = books.pop()
#         next_cursor = last["updated_at"].isoformat()

#     return {
#         "items": books,
#         "next_cursor": next_cursor,
#         "limit": limit
#     }

# @router.delete("/{isbn}")
# async def delete_book(isbn: str, user_id: str = Depends(get_current_user),):
#     result = await books_collection.delete_one(
#         {"isbn": isbn, "user_id": user_id}
#     )
#     if result.deleted_count == 0:
#         raise HTTPException(404, "Book not found")
#     return {"message": "Deleted"}


from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from app.db.mongodb import books_collection, user_books_collection
from app.models.user_books import UserBookCreate
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
    
    search_blob = build_search_blob(book, data)

    await user_books_collection.update_one(
        {"user_id": user_id, "book_id": str(book["_id"])},
        {
            "$set": {
                **data.model_dump(),
                "search_blob": search_blob
                },
            "$setOnInsert": {
                "user_id": user_id,
                "book_id": str(book["_id"]),
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
    genre: str | None = None,
    limit: int = Query(20, le=50)
):
    match = {"user_id": user_id}
    if genre:
        match["genres"] = genre

    pipeline = [
        {"$match": match},
        {
            "$lookup": {
                "from": "books",
                "localField": "book_id",
                "foreignField": "_id",
                "as": "book"
            }
        },
        {"$unwind": "$book"},
        {"$limit": limit}
    ]

    cursor = user_books_collection.aggregate(pipeline)
    results = []

    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["book"]["id"] = str(doc["book"]["_id"])
        del doc["_id"], doc["book"]["_id"]
        results.append(doc)

    return results
