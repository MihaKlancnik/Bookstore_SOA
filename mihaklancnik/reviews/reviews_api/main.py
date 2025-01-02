from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

geslo = os.environ.get("MihaGeslo")

class Review(BaseModel):
    book_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime

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

@app.get("/", tags=["Root"])
async def read_root():
    """
    Returns a welcome message.
    - **Path**: `/`
    - **Returns**: A simple greeting message.
    """
    return {"message": "Welcome to REVIEWS!"}

@app.get("/reviews/{review_id}", tags=["Reviews"])
async def get_review(review_id: str):
    """
    Get a review by its ID.
    - **Path**: `/reviews/{review_id}`
    - **Parameters**: review_id (str)
    - **Returns**: Review details including book_id, user_id, rating, comment, and created_at.
    - **Responses**:
        - 200: Successfully retrieved the review.
        - 404: Review not found.
        - 500: Internal server error.
    """
    try:
        review = await clan.find_one({"_id": ObjectId(review_id)})
        if review is None:
            raise HTTPException(status_code=404, detail="Review not found")
        review_dict = {**review}
        review_dict["id"] = str(review_dict["_id"])
        del review_dict["_id"]
        return review_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews", tags=["Reviews"])
async def get_reviews():
    """
    Get all reviews.
    - **Path**: `/reviews`
    - **Returns**: A list of all reviews.
    - **Responses**:
        - 200: Successfully retrieved the list of reviews.
        - 500: Internal server error.
    """
    try:
        reviews_cursor = clan.find()
        reviews = await reviews_cursor.to_list(None)
        reviews_list = []
        for review in reviews:
            review_dict = {**review}
            review_dict["id"] = str(review_dict["_id"])
            del review_dict["_id"]
            reviews_list.append(review_dict)
        return reviews_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reviews", tags=["Reviews"])
async def create_review(review: Review):
    """
    Create a new review.
    - **Path**: `/reviews`
    - **Parameters**: Review object containing book_id, user_id, rating, comment.
    - **Returns**: The ID of the created review.
    - **Responses**:
        - 201: Successfully created the review.
        - 400: Bad request (e.g., invalid input).
        - 500: Internal server error.
    """
    try:
        review_dict = review.dict()
        review_dict["created_at"] = datetime.utcnow()
        result = await clan.insert_one(review_dict)
        return {"id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/reviews/{review_id}", tags=["Reviews"])
async def update_review(review_id: str, review: Review):
    """
    Update an existing review.
    - **Path**: `/reviews/{review_id}`
    - **Parameters**: review_id (str), Review object containing book_id, user_id, rating, comment.
    - **Returns**: A message indicating success or failure.
    - **Responses**:
        - 200: Successfully updated the review.
        - 404: Review not found.
        - 500: Internal server error.
    """
    try:
        review_dict = review.dict()
        review_dict["created_at"] = datetime.utcnow()
        result = await clan.update_one({"_id": ObjectId(review_id)}, {"$set": review_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/reviews/{review_id}", tags=["Reviews"])
async def delete_review(review_id: str):
    """
    Delete a review by its ID.
    - **Path**: `/reviews/{review_id}`
    - **Parameters**: review_id (str)
    - **Returns**: A message indicating success or failure.
    - **Responses**:
        - 200: Successfully deleted the review.
        - 404: Review not found.
        - 500: Internal server error.
    """
    try:
        result = await clan.delete_one({"_id": ObjectId(review_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/reviews/user/{user_id}", tags=["Reviews"])
async def delete_reviews_by_user(user_id: int):
    """
    Delete all reviews by a user.
    - **Path**: `/reviews/user/{user_id}`
    - **Parameters**: user_id (int)
    - **Returns**: A message indicating the number of reviews deleted.
    - **Responses**:
        - 200: Successfully deleted reviews for the user.
        - 404: No reviews found for the specified user.
        - 500: Internal server error.
    """
    try:
        result = await clan.delete_many({"user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"No reviews found for user_id: {user_id}")
        return {"message": f"Deleted {result.deleted_count} reviews for user_id: {user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/reviews/book/{book_id}", tags=["Reviews"])
async def get_reviews_by_book(book_id: int):
    """
    Get all reviews for a specific book.
    - **Path**: `/reviews/book/{book_id}`
    - **Parameters**: book_id (int)
    - **Returns**: A list of reviews for the specified book.
    - **Responses**:
        - 200: Successfully retrieved reviews for the book.
        - 404: No reviews found for the specified book.
        - 500: Internal server error.
    """
    try:
        reviews_cursor = clan.find({"book_id": book_id})
        reviews = await reviews_cursor.to_list(None)
        if not reviews:
            raise HTTPException(status_code=404, detail=f"No reviews found for book_id: {book_id}")
        reviews_list = []
        for review in reviews:
            review_dict = {**review}
            review_dict["id"] = str(review_dict["_id"])
            del review_dict["_id"]
            reviews_list.append(review_dict)
        return reviews_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/reviews/bulk", tags=["Reviews"])
async def create_bulk_reviews(reviews: list[Review]):
    """
    Create multiple reviews at once.
    - **Path**: `/reviews/bulk`
    - **Parameters**: A list of Review objects.
    - **Returns**: The IDs of the created reviews.
    - **Responses**:
        - 201: Successfully created the reviews.
        - 500: Internal server error.
    """
    try:
        reviews_dict = [review.dict() for review in reviews]
        for review in reviews_dict:
            review["created_at"] = datetime.utcnow()
        result = await clan.insert_many(reviews_dict)
        return {"message": f"{len(result.inserted_ids)} reviews created successfully", "ids": [str(id) for id in result.inserted_ids]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.put("/reviews/{review_id}/rating", tags=["Reviews"])
async def update_review_rating(review_id: str, rating: int):
    """
    Update the rating of an existing review.
    - **Path**: `/reviews/{review_id}/rating`
    - **Parameters**: review_id (str), rating (int)
    - **Returns**: A message indicating success or failure.
    - **Responses**:
        - 200: Successfully updated the rating.
        - 400: Invalid rating.
        - 404: Review not found.
        - 500: Internal server error.
    """
    try:
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        result = await clan.update_one({"_id": ObjectId(review_id)}, {"$set": {"rating": rating}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Rating updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

