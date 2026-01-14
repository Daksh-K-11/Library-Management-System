# import asyncio
# from pymongo import ASCENDING, DESCENDING, TEXT

# from app.db.mongodb import user_books_collection, books_collection, users_collection

# ## ---------------------------------------------------------------------------- ##
# ## EXECUTE THIS SCRIPT ONCE TO CREATE NECESSARY INDEXES IN THE COLLECTIONS      ##
# ## ---------------------------------------------------------------------------- ##

# async def create_indexes():

#     # users
#     await users_collection.create_index(
#         [("email", ASCENDING)],
#         unique=True
#     )

#     # user_books
#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("updated_at", DESCENDING), ("_id", DESCENDING)]
#     )

#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("genres", ASCENDING)]
#     )

#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("read_status", ASCENDING)]
#     )

#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("rating", DESCENDING)]
#     )

#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("search_blob", TEXT)]
#     )

#     await user_books_collection.create_index(
#         [("user_id", ASCENDING), ("book_id", ASCENDING)],
#         unique=True
#     )

#     # books
#     await books_collection.create_index(
#         [("isbn_13", ASCENDING)],
#         unique=True
#     )

#     await books_collection.create_index(
#         [("isbn_10", ASCENDING)],
#         sparse=True
#     )

#     print("✅ All indexes created successfully")



# if __name__ == "__main__":
#     asyncio.run(create_indexes())









import asyncio
from pymongo import ASCENDING, DESCENDING, TEXT

# import your collection objects (make sure app.db.mongodb exports them)
from app.db.mongodb import (
    users_collection,
    books_collection,
    user_books_collection,
    libraries_collection,
    library_books_collection,
)


## ---------------------------------------------------------------------------- ##
## EXECUTE THIS SCRIPT ONCE TO CREATE NECESSARY INDEXES IN THE COLLECTIONS      ##
## ---------------------------------------------------------------------------- ##

async def create_indexes():

    # -------------------- users --------------------
    # Unique email (login)
    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="users_email_idx"
    )

    # Optional: created_at for listing/sorting users (admin usage)
    await users_collection.create_index([("created_at", DESCENDING)], name="users_created_at_idx")


    # -------------------- books (shared metadata) --------------------
    # Canonical ISBN-13 unique
    await books_collection.create_index(
        [("isbn_13", ASCENDING)],
        unique=True,
        name="books_isbn13_idx"
    )

    # ISBN-10 is optional/sparse (not all docs will have it)
    await books_collection.create_index(
        [("isbn_10", ASCENDING)],
        unique=True,
        sparse=True,
        name="books_isbn10_idx"
    )

    # Text search index for global book metadata (title, authors, categories)
    await books_collection.create_index(
        [
            ("title", TEXT),
            ("authors", TEXT),
            ("categories", TEXT),
        ],
        name="books_text_idx"
    )

    # Helpful single-field indexes for sorting / filtering
    await books_collection.create_index([("title", ASCENDING)], name="books_title_idx")
    await books_collection.create_index([("published_year", DESCENDING)], name="books_published_year_idx")
    await books_collection.create_index([("updated_at", DESCENDING)], name="books_updated_at_idx")


    # -------------------- user_books (per-user editable data) --------------------
    # Primary listing index: for cursor pagination by updated_at (user scope)
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("updated_at", DESCENDING), ("_id", DESCENDING)],
        name="ub_user_updated_idx"
    )

    # Filter by genre within user scope
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("genres", ASCENDING)],
        name="ub_user_genres_idx"
    )

    # Filter by read_status within user scope
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("read_status", ASCENDING)],
        name="ub_user_readstatus_idx"
    )

    # Sort by rating within user scope
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("rating", DESCENDING)],
        name="ub_user_rating_idx"
    )

    # Text search: combine user-scoped text searchable blob (search_blob)
    # Note: compound index with text is allowed; text field should be included as TEXT
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("search_blob", TEXT)],
        name="ub_user_searchblob_text_idx"
    )

    # Ensure one user_book per user per book (uniqueness of relation)
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("book_id", ASCENDING)],
        unique=True,
        name="ub_user_book_unique_idx"
    )

    # Optional: if you copy book_title into user_books for fast sorting by title
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("book_title", ASCENDING)],
        name="ub_user_booktitle_idx"
    )

    # Optional index to support deletes by _id + user (fast security check)
    await user_books_collection.create_index(
        [("_id", ASCENDING), ("user_id", ASCENDING)],
        name="ub_id_user_idx"
    )


    # -------------------- libraries --------------------
    # List libraries by user quickly
    await libraries_collection.create_index(
        [("user_id", ASCENDING)],
        name="libs_user_idx"
    )

    # Unique slug for public URLs
    await libraries_collection.create_index(
        [("slug", ASCENDING)],
        unique=True,
        name="libs_slug_unique_idx"
    )

    # Ensure one default library per user:
    # Use a partial unique index so uniqueness is enforced only when is_default == True
    await libraries_collection.create_index(
        [("user_id", ASCENDING), ("is_default", ASCENDING)],
        unique=True,
        partialFilterExpression={"is_default": True},
        name="libs_user_default_unique_idx"
    )

    # Quick lookup for public libraries (slug + is_public)
    await libraries_collection.create_index(
        [("slug", ASCENDING), ("is_public", ASCENDING)],
        name="libs_slug_public_idx"
    )

    # Sorting libraries by updated_at for quick listing
    await libraries_collection.create_index(
        [("user_id", ASCENDING), ("updated_at", DESCENDING)],
        name="libs_user_updated_idx"
    )


    # -------------------- library_books (bridge library <-> user_book) --------------------
    # Query books in a library quickly
    await library_books_collection.create_index(
        [("library_id", ASCENDING), ("added_at", DESCENDING)],
        name="lb_library_addedat_idx"
    )

    # Query libraries that contain a given user_book (fast delete or lookups)
    await library_books_collection.create_index(
        [("user_book_id", ASCENDING)],
        name="lb_userbook_idx"
    )

    # Prevent duplicate entries: a user_book should appear only once per library
    await library_books_collection.create_index(
        [("library_id", ASCENDING), ("user_book_id", ASCENDING)],
        unique=True,
        name="lb_library_userbook_unique_idx"
    )

    # If you need to support fast removal by library + user_book in bulk, keep compound:
    await library_books_collection.create_index(
        [("library_id", ASCENDING), ("user_book_id", ASCENDING), ("added_at", DESCENDING)],
        name="lb_library_userbook_added_idx"
    )


    # -------------------- helpful admin / analytics indexes --------------------
    # Count books per user quickly
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)],
        name="ub_user_created_idx"
    )

    # Track public libraries by creation time (for listing popular/new)
    await libraries_collection.create_index(
        [("is_public", ASCENDING), ("created_at", DESCENDING)],
        name="libs_public_created_idx"
    )


    print("✅ All indexes created successfully")


if __name__ == "__main__":
    asyncio.run(create_indexes())
