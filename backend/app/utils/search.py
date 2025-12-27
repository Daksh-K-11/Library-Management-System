def build_search_blob(book, user_data):
    return " ".join([
        book["title"],
        " ".join(book.get("authors", [])),
        " ".join(book.get("categories", [])),
        " ".join(user_data.genres),
        " ".join(user_data.tags)
    ]).lower()
