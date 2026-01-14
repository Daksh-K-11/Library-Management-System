def build_search_blob(book: dict, user_data: dict) -> str:
    return " ".join([
        book.get("title", ""),
        " ".join(book.get("authors", [])),
        " ".join(book.get("categories", [])),
        " ".join(user_data.get("genres", [])),
        " ".join(user_data.get("tags", [])),
        user_data.get("personal_notes", "")
    ]).lower()
