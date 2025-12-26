from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Library Management API")

# MongoDB connection (CREATED ONCE)
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.library
books_collection = db.books

@app.get("/")
async def health_check():
    return {"status": "Mongo + FastAPI working"}

@app.post("/test-insert")
async def test_insert():
    book = {
        "isbn": "9780132350884",
        "title": "Clean Code",
        "authors": ["Robert C. Martin"]
    }
    result = await books_collection.insert_one(book)
    return {"inserted_id": str(result.inserted_id)}

@app.get("/books")
async def list_books():
    books = []
    async for book in books_collection.find():
        book["_id"] = str(book["_id"])
        books.append(book)
    return books

