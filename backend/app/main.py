from fastapi import FastAPI
from app.routes import books, isbn
from app.db.mongodb import books_collection

app = FastAPI(title="Library Management API")

app.include_router(books.router)
app.include_router(isbn.router)

@app.get("/")
async def health():
    indexes = await books_collection.index_information()
    print(indexes)
    return {"status": "ok"}
