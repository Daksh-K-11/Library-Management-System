def isbn10_to_isbn13(isbn10: str) -> str:
    isbn10 = isbn10.replace("-", "")
    if len(isbn10) != 10:
        raise ValueError("Invalid ISBN-10")

    core = "978" + isbn10[:-1]
    total = 0

    for i, digit in enumerate(core):
        total += int(digit) * (1 if i % 2 == 0 else 3)

    check = (10 - (total % 10)) % 10
    return core + str(check)


def normalize_isbn(isbn: str) -> str:
    isbn = isbn.replace("-", "").strip()
    if len(isbn) == 10:
        return isbn10_to_isbn13(isbn)
    if len(isbn) == 13:
        return isbn
    raise ValueError("Invalid ISBN")
