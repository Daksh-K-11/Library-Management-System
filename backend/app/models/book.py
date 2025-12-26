from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BookBase(BaseModel):
    isbn: str = Field(..., example="9780132350884")

    # ISBN API fields
    title: str
    authors: List[str] = []
    publisher: Optional[str] = None
    published_year: Optional[int] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    categories: List[str] = []

    # USER-CONTROLLED FIELDS
    genres: List[str] = Field(
        default=[],
        example=["Thriller", "Fantasy"]
    )
    tags: List[str] = []
    personal_notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    read_status: Optional[str] = Field(
        default="unread",
        pattern="^(unread|reading|completed)$"
    )

class BookCreate(BookBase):
    pass

class BookInDB(BookBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
