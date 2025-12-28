from pydantic import BaseModel
from datetime import datetime

class LibraryBookInDB(BaseModel):
    id: str
    library_id: str
    user_book_id: str
    added_at: datetime
