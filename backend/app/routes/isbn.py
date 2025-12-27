from fastapi import APIRouter, HTTPException
import httpx
from app.db.mongodb import books_collection
from app.utils.isbn import normalize_isbn
from datetime import datetime

router = APIRouter(prefix="/isbn", tags=["ISBN"])

@router.get("", dependencies=[])
async def lookup_isbn(isbn):
    isbn_13 = normalize_isbn(isbn)

    # 1️⃣ Check local DB
    book = await books_collection.find_one({"isbn_13": isbn_13})
    if book:
        book["id"] = str(book["_id"])
        del book["_id"]
        return book

    # 2️⃣ Fetch from Google Books
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={"q": f"isbn:{isbn_13}"}
        )

    data = res.json()
    if data.get("totalItems", 0) == 0:
        raise HTTPException(404, "ISBN not found")

    info = data["items"][0]["volumeInfo"]
    now = datetime.utcnow()

    book_doc = {
        "isbn_13": isbn_13,
        "isbn_10": isbn if len(isbn) == 10 else None,
        "title": info.get("title"),
        "authors": info.get("authors", []),
        "publisher": info.get("publisher"),
        "published_year": int(info.get("publishedDate", "0")[:4] or 0) or None,
        "description": info.get("description"),
        "categories": info.get("categories", []),
        "cover_url": info.get("imageLinks", {}).get("thumbnail"),
    }

    await books_collection.insert_one(book_doc)
    book_doc.pop("_id", None)

    return book_doc
