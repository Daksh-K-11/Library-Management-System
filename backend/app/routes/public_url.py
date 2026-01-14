from fastapi import HTTPException, APIRouter

from app.db.mongodb import libraries_collection, library_books_collection

router = APIRouter(prefix="", tags=["public_library"])

@router.get("/public/library/{slug}")
async def view_public_library(slug: str):
    lib = await libraries_collection.find_one({"slug": slug, "is_public": True})
    if not lib:
        raise HTTPException(404, "Library not found")

    pipeline = [
        {"$match": {"library_id": lib["_id"]}},
        {
            "$lookup": {
                "from": "user_books",
                "localField": "user_book_id",
                "foreignField": "_id",
                "as": "user_book"
            }
        },
        {"$unwind": "$user_book"},
        {
            "$lookup": {
                "from": "books",
                "localField": "user_book.book_id",
                "foreignField": "_id",
                "as": "book"
            }
        },
        {"$unwind": "$book"}
    ]

    cursor = library_books_collection.aggregate(pipeline)
    results = []

    async for doc in cursor:
        results.append({
            "title": doc["book"]["title"],
            "authors": doc["book"]["authors"],
            "cover_url": doc["book"].get("cover_url"),
            "genres": doc["user_book"]["genres"]
        })

    return {
        "library_name": lib["name"],
        "books": results
    }
