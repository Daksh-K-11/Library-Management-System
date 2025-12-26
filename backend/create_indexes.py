import asyncio
from app.db.mongodb import books_collection

## ---------------------------------------------------------------------------- ##
## EXECUTE THIS SCRIPT ONCE TO CREATE NECESSARY INDEXES IN THE BOOKS COLLECTION ##
## ---------------------------------------------------------------------------- ##

async def create_indexes():
    await books_collection.create_index(
        [("user_id", 1), ("isbn", 1)],
        unique=True
    )

    # Text search index
    await books_collection.create_index([
        ("title", "text"),
        ("authors", "text"),
        ("categories", "text"),
        ("genres", "text"),
        ("tags", "text")
    ])

    # Filtering indexes
    await books_collection.create_index("genres")
    await books_collection.create_index("read_status")
    await books_collection.create_index("rating")
    await books_collection.create_index("user_id")
    await books_collection.create_index([
    ("user_id", 1),
    ("updated_at", -1),
    ("_id", -1)
])



asyncio.run(create_indexes())