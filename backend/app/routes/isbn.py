from fastapi import APIRouter, HTTPException
import httpx
from app.db.mongodb import books_collection
from app.utils.isbn import normalize_isbn
from datetime import datetime, timezone

router = APIRouter(prefix="/isbn", tags=["ISBN"])


@router.get("", dependencies=[])
async def lookup_isbn(isbn: str):
    # 1️⃣ Normalize ISBN
    try:
        isbn_13 = normalize_isbn(isbn)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ISBN format")

    # 2️⃣ Check local DB
    try:
        book = await books_collection.find_one({"isbn_13": isbn_13})
    except Exception:
        raise HTTPException(status_code=500, detail="Database error")

    if book:
        book["id"] = str(book["_id"])
        del book["_id"]
        return book

    # 3️⃣ Fetch from Google Books
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(
                "https://www.googleapis.com/books/v1/volumes",
                params={"q": f"isbn:{isbn_13}"}
            )
            res.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Google Books timeout")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=502, detail="Google Books error")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch book data")

    # 4️⃣ Parse response
    try:
        data = res.json()
        if data.get("totalItems", 0) == 0:
            raise HTTPException(status_code=404, detail="ISBN not found")

        info = data["items"][0]["volumeInfo"]
    except (KeyError, IndexError, ValueError):
        raise HTTPException(status_code=502, detail="Invalid response from Google Books")

    # 5️⃣ Build document
    book_doc = {
        "isbn_13": isbn_13,
        "isbn_10": isbn if len(isbn) == 10 else None,
        "title": info.get("title"),
        "authors": info.get("authors", []),
        "publisher": info.get("publisher"),
        "published_year": (
            int(info.get("publishedDate", "0")[:4])
            if info.get("publishedDate")
            else None
        ),
        "description": info.get("description"),
        "categories": info.get("categories", []),
        "cover_url": info.get("imageLinks", {}).get("thumbnail"),
        "created_at": datetime.now(timezone.utc),
    }

    # 6️⃣ Insert into DB
    try:
        result = await books_collection.insert_one(book_doc)
        book_doc["id"] = str(result.inserted_id)
        book_doc.pop("_id", None)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save book data. Try again later.")

    return book_doc
