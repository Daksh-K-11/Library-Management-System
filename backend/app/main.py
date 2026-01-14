from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import books, isbn, auth, libraries, library_books, public_url
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
app.include_router(libraries.router)
app.include_router(library_books.router)
app.include_router(public_url.router)

@app.get("/")
async def health():
    return {"status": "ok"}
