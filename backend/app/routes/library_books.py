from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId

from app.models.library_books import LibraryBooksCreate, LibraryBooksRemove
from app.auth.permissions import get_library_owned_by_user
from app.auth.deps import get_current_user
from app.db.mongodb import libraries_collection, library_books_collection

router = APIRouter(prefix="/librarybooks", tags=["library_books"])

@router.post("/{library_id}")
async def add_books_to_library(
    library_id: str,    
    data: LibraryBooksCreate,
    user_id: str = Depends(get_current_user)
):
    lib = await get_library_owned_by_user(library_id, user_id)

    # default_lib = await libraries_collection.find_one(
    #     {"user_id": user_id, "is_default": True}
    # )

    ops = []
    now = datetime.utcnow()

    for ub_id in data.user_book_ids:
        ops.append({
            "library_id": lib["_id"],
            "user_book_id": ObjectId(ub_id),
            "added_at": now
        })

        # also add to default library
        # if not lib["is_default"]:
        #     ops.append({
        #         "library_id": default_lib["_id"],
        #         "user_book_id": ObjectId(ub_id),
        #         "added_at": now
        #     })

    await library_books_collection.insert_many(ops, ordered=False)
    return {"message": "Books added"}


@router.get("/{library_id}")
async def view_library_books(
    library_id: str,
    user_id: str = Depends(get_current_user)
):
    lib = await get_library_owned_by_user(library_id, user_id)

    pipeline = [
        {"$match": {"library_id": lib["_id"]}},

        # join user_books
        {
            "$lookup": {
                "from": "user_books",
                "localField": "user_book_id",
                "foreignField": "_id",
                "as": "user_book"
            }
        },
        {"$unwind": "$user_book"},

        # join books
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
        book = dict(doc['book'])
        book['id'] = str(book['_id'])
        del book['_id']
        results.append({
            # "library_id": str(lib["_id"]),
            "user_book_id": str(doc["user_book"]["_id"]),

            # global book
            "book": book,

            # user editable
            "genres": doc["user_book"]["genres"],
            "tags": doc["user_book"]["tags"],
            "rating": doc["user_book"]["rating"],
            "read_status": doc["user_book"]["read_status"],
            "personal_notes": doc["user_book"].get("personal_notes"),
        })

    return {
        "library": {
            "id": str(lib["_id"]),
            "name": lib["name"],
            "is_public": lib["is_public"],
            "is_default": lib["is_default"]
        },
        "books": results
    }


@router.delete("/{library_id}")
async def remove_books_from_library(
    library_id: str,
    data: LibraryBooksRemove,
    user_id: str = Depends(get_current_user)
):
    lib = await get_library_owned_by_user(library_id, user_id)

    await library_books_collection.delete_many({
        "library_id": lib["_id"],
        "user_book_id": {"$in": [ObjectId(i) for i in data.user_book_ids]}
    })

    return {"message": "Books removed from library"}