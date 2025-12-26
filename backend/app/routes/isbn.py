from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/isbn", tags=["ISBN"])

@router.get("/{isbn}")
async def lookup_isbn(isbn: str):
    async with httpx.AsyncClient(timeout=5) as client:
        google = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={"q": f"isbn:{isbn}"}
        )

    data = google.json()
    if data.get("totalItems", 0) == 0:
        raise HTTPException(404, "ISBN not found")

    print(data)
    info = data["items"][0]["volumeInfo"]
    print()
    print("----- Book Info -----")
    print(info)

    return {
    "isbn": isbn,
    "title": info.get("title"),
    "authors": info.get("authors", []),
    "publisher": info.get("publisher"),
    "published_year": info.get("publishedDate", "")[:4],
    "description": info.get("description"),
    "categories": info.get("categories", []),
    "genres": [],  # user fills this
    "cover_url": info.get("imageLinks", {}).get("thumbnail")
}

