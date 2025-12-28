from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LibraryBase(BaseModel):
    name: str = Field(..., example="My Fantasy Library")
    is_public: bool = False

class LibraryCreate(LibraryBase):
    pass

class LibraryInDB(LibraryBase):
    id: str
    user_id: str
    is_default: bool
    slug: str
    created_at: datetime
    updated_at: datetime
