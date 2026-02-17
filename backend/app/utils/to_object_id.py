from fastapi import HTTPException
from typing import List
from bson import ObjectId

def to_object_ids(ids: List[str]) -> List[ObjectId]:
    try:
        return [ObjectId(i) for i in ids]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")