import requests

BASE_URL = "http://localhost:8000/books"

# 🔐 PASTE YOUR TOKEN HERE
BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjk1Mjc3MWIyY2NlOTQyMWQwYWJlZDFjIiwiZXhwIjoxNzY3MDk4NTM2fQ.683R0psSycr4Uvn2gdCOkX0v4dzpx-UvymkEJlqpjCg"

HEADERS = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json",
}

# First 10 books with ISBN-13 and custom payloads
books = [
    {
        "isbn": "9780552554107",
        "payload": {
            "genres": ["fantasy"],
            "tags": ["dragon", "magic"],
            "personal_notes": "Gifted copy",
            "rating": 4,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780439023528",
        "payload": {
            "genres": ["young adult", "fantasy"],
            "tags": ["dystopian", "survival"],
            "personal_notes": "Re-read during lockdown",
            "rating": 5,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780061120084",
        "payload": {
            "genres": ["classic", "allegory"],
            "tags": ["philosophy", "journey"],
            "personal_notes": "Recommended by a friend",
            "rating": 4,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780140449136",
        "payload": {
            "genres": ["classic", "epic"],
            "tags": ["war", "honor"],
            "personal_notes": "College reading",
            "rating": 3,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780307277671",
        "payload": {
            "genres": ["literary fiction"],
            "tags": ["history", "family"],
            "personal_notes": "Slow but rewarding",
            "rating": 4,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780743273565",
        "payload": {
            "genres": ["classic"],
            "tags": ["american dream", "tragedy"],
            "personal_notes": "High school favorite",
            "rating": 5,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780385472579",
        "payload": {
            "genres": ["fantasy"],
            "tags": ["mythology", "adventure"],
            "personal_notes": "Beautiful world building",
            "rating": 4,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780316769488",
        "payload": {
            "genres": ["classic"],
            "tags": ["coming-of-age", "identity"],
            "personal_notes": "Not my favorite",
            "rating": 3,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9780141439518",
        "payload": {
            "genres": ["romance", "classic"],
            "tags": ["society", "relationships"],
            "personal_notes": "Surprisingly engaging",
            "rating": 4,
            "read_status": "completed"
        }
    },
    {
        "isbn": "9781451673319",
        "payload": {
            "genres": ["science fiction"],
            "tags": ["time travel", "philosophy"],
            "personal_notes": "Mind-bending",
            "rating": 5,
            "read_status": "completed"
        }
    },
]

for book in books:
    url = f"{BASE_URL}/{book['isbn']}"

    try:
        response = requests.post(
            url,
            json=book["payload"],
            headers=HEADERS,
            timeout=10
        )

        print(f"\nPOST {url}")
        print(f"Status: {response.status_code}")

        if response.headers.get("content-type", "").startswith("application/json"):
            print("Response:", response.json())
        else:
            print("Response:", response.text)

    except requests.RequestException as e:
        print(f"\nPOST {url}")
        print("Request failed:", e)
