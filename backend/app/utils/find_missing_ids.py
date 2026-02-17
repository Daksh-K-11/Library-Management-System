from fastapi import HTTPException
from bson import ObjectId
from typing import List
from .to_object_id import to_object_ids


async def find_missing_ids(ids: List[str], doc_id: str,  collection) -> list[str]:
    input_ids = to_object_ids(ids)
    library_id = ObjectId(doc_id)

    pipeline = [
        {"$match": {"library_id": library_id}},
        {
            "$group": {
                "_id": None,
                "existingIds": {"$addToSet": "$user_book_id"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "missingIds": {
                    "$setDifference": [input_ids, "$existingIds"]
                }
            }
        }
    ]

    cursor = collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)

    # If no documents exist for this library, all IDs are missing
    if not result:
        return [str(i) for i in input_ids]

    return [str(i) for i in result[0]["missingIds"]]
