from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from datetime import datetime
import os
from dotenv import load_dotenv
from fastapi_jwt_auth import AuthJWT
from starlette.middleware.base import BaseHTTPMiddleware
#from starlette.responses import JSONResponse
#from pymongo import SON
from bson.objectid import ObjectId
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
security = HTTPBearer()

# Define JWT settings
app = FastAPI(
    title="Book Review API",
    description="API for managing book reviews, supporting operations like GET, POST, PUT, and DELETE.",
    version="1.0.0"
)
#app.config.from_object(Settings)

# MongoDB connection
MONGODB_URI = "mongodb+srv://moji_prijatelji:knjigarna@ptscluster.qfts7.mongodb.net/?retryWrites=true&w=majority&appName=PTSCLUSTER"  
client = AsyncIOMotorClient(MONGODB_URI)
db = client["SOA"]
clan = db["reviews"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)



class Review(BaseModel):
    book_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=["HS256"],
            issuer="https://soa.abm.com"
        )
        
        # Get user ID from the 'sub' claim
        user_id = str(payload.get("sub"))
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token issuer"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Could not validate credentials: {str(e)}"
        )

# Add middleware for JWT
#app.add_middleware(JWTMiddleware)

@app.get("/", tags=["Root"])
async def read_root(current_user: str = Depends(get_current_user)):
    """
    Returns a welcome message.
    - **Path**: `/`
    - **Returns**: A simple greeting message.
    """
    return {"message": "Welcome to REVIEWS!"}

@app.get("/reviews", tags=["Reviews"])
async def get_reviews(current_user: str = Depends(get_current_user)):
    """
    Get all reviews.
    """
    try:
        reviews_cursor = clan.find()  # Fetches all reviews
        reviews = await reviews_cursor.to_list(None)  # Converts cursor to list
        reviews_list = []
        for review in reviews:
            review_dict = {**review}
            review_dict["id"] = str(review_dict["_id"])  # Format MongoDB ObjectId
            del review_dict["_id"]
            reviews_list.append(review_dict)
        return reviews_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews", tags=["Reviews"])
async def get_reviews(current_user: str = Depends(get_current_user)):
    """
    Get all reviews.
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
async def create_review(review: Review, current_user: str = Depends(get_current_user)):
    """
    Create a new review.
    """
    try:
        review_dict = review.dict()
        review_dict["created_at"] = datetime.utcnow()
        result = await clan.insert_one(review_dict)
        return {"id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/reviews/{review_id}", tags=["Reviews"])
async def update_review(review_id: str, review: Review, current_user: str = Depends(get_current_user)):
    """
    Update an existing review.
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
async def delete_review(review_id: str, current_user: str = Depends(get_current_user)):
    """
    Delete a review by its ID.
    """
    try:
        result = await clan.delete_one({"_id": ObjectId(review_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"message": "Review deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/reviews/user/{user_id}", tags=["Reviews"])
async def delete_reviews_by_user(user_id: int, current_user: str = Depends(get_current_user)):
    """
    Delete all reviews by a user.
    """
    try:
        result = await clan.delete_many({"user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"No reviews found for user_id: {user_id}")
        return {"message": f"Deleted {result.deleted_count} reviews for user_id: {user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/reviews/book/{book_id}", tags=["Reviews"])
async def get_reviews_by_book(book_id: int, current_user: str = Depends(get_current_user)):
    """
    Get all reviews for a specific book.
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
async def create_bulk_reviews(reviews: list[Review], current_user: str = Depends(get_current_user)):
    """
    Create multiple reviews at once.
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
async def update_review_rating(review_id: str, rating: int, current_user: str = Depends(get_current_user)):
    """
    Update the rating of an existing review.
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

@app.get("/reviews/user/{user_id}", tags=["Reviews"])
async def get_reviews_by_user(user_id: int, current_user: str = Depends(get_current_user)):
    """
    Get all reviews by a specific user.
    """
    try:
        reviews_cursor = clan.find({"user_id": user_id})
        reviews = await reviews_cursor.to_list(None)
        if not reviews:
            raise HTTPException(status_code=404, detail=f"No reviews found for user_id: {user_id}")
        reviews_list = []
        for review in reviews:
            review_dict = {**review}
            review_dict["id"] = str(review_dict["_id"])
            del review_dict["_id"]
            reviews_list.append(review_dict)
        return reviews_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")