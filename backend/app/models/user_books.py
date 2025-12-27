from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBookBase(BaseModel):

    genres: List[str] = Field(default=[], example=["Fantasy", "Thriller"])
    tags: List[str] = []
    personal_notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    read_status: str = Field(
        default="unread",
        pattern="^(unread|reading|completed)$"
    )

class UserBookCreate(UserBookBase):
    pass

class UserBookInDB(UserBookBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
