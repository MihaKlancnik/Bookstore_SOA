from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx  
from datetime import datetime

app = FastAPI(
    title="Book Review API",
    description="API for managing book reviews, supporting operations like GET, POST, PUT, and DELETE.",
    version="1.0.0"
)

# MongoDB connection
MONGODB_URI = "mongodb+srv://moji_prijatelji:knjigarna@ptscluster.qfts7.mongodb.net/?retryWrites=true&w=majority&appName=PTSCLUSTER"
client = AsyncIOMotorClient(MONGODB_URI)
db = client["SOA"]
clan = db["reviews"]

BOOKS_API_BASE_URL = "http://localhost:3000/api/books"  # Base URL for books API

@app.get("/reviews/newest", tags=["Reviews"])
async def get_newest_reviews():
    """
    Get the 3 newest reviews with book titles.
    - **Path**: `/reviews/newest`
    - **Returns**: A list of the 3 newest reviews with book titles.
    - **Responses**:
        - 200: Successfully retrieved the newest reviews.
        - 500: Internal server error.
    """
    try:
        reviews_cursor = clan.find().sort("created_at", -1).limit(3)  # Get the 3 most recent reviews
        reviews = await reviews_cursor.to_list(None)
        if not reviews:
            raise HTTPException(status_code=404, detail="No reviews found")
        
        reviews_list = []
        async with httpx.AsyncClient() as client:
            for review in reviews:
                review_dict = {**review}
                review_dict["id"] = str(review_dict["_id"])
                del review_dict["_id"]

                # Fetch book details from the books API
                book_id = review_dict["book_id"]
                try:
                    book_response = await client.get(f"{BOOKS_API_BASE_URL}/{book_id}")
                    if book_response.status_code == 200:
                        book_data = book_response.json()
                        review_dict["title"] = book_data.get("title", "Unknown Title")
                    else:
                        review_dict["title"] = "Unknown Title"  # Default if book not found
                except Exception as book_error:
                    review_dict["title"] = "Unknown Title"  # Handle error gracefully

                reviews_list.append(review_dict)

        return reviews_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)