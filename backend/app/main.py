from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import books, isbn, auth
from app.db.mongodb import books_collection

app = FastAPI(title="Library Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # allow all origins
    allow_credentials=True,
    allow_methods=["*"],            # allow all HTTP methods
    allow_headers=["*"],            # allow all headers
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(isbn.router)

@app.get("/")
async def health():
    indexes = await books_collection.index_information()
    print(indexes)
    return {"status": "ok"}
