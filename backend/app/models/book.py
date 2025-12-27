from pydantic import BaseModel, Field
from typing import List, Optional

class BookBase(BaseModel):
    isbn_13: str = Field(..., example="9780132350884")
    isbn_10: Optional[str] = Field(None, example="0132350882")

    title: str
    authors: List[str]
    publisher: Optional[str] = None
    published_year: Optional[int] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    categories: List[str] = []

class BookCreate(BookBase):
    pass

class BookInDB(BookBase):
    id: str
