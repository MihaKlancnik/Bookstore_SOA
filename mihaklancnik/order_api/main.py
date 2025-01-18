from fastapi import FastAPI, HTTPException, Query, status, Depends
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import httpx
import os
from dotenv import load_dotenv
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
security = HTTPBearer()

# MongoDB connection
MONGODB_URI = "mongodb+srv://moji_prijatelji:knjigarna@ptscluster.qfts7.mongodb.net/?retryWrites=true&w=majority&appName=PTSCLUSTER"
client = AsyncIOMotorClient(MONGODB_URI)
db = client["SOA"]
order_collection = db["orders"]

app = FastAPI(
    title="Order Management API",
    description="API for managing orders",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

class Order(BaseModel):
    order_id: int
    user_id: int  # New field for user ID
    book_id: str
    quantity: int 
    price: float 

    class Config:
        schema_extra = {
            "example": {
                "order_id": 1,
                "user_id": 1, 
                "book_id": "book3",
                "quantity": 3,
                "price": 15.99
            }
        }

# Simplified JWT verification - only checks if token is valid
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=["HS256"],
            issuer="https://soa.abm.com"
        )
        return True
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

@app.get("/orders/", response_model=List[Order], status_code=status.HTTP_200_OK,
         summary="Get all orders", tags=["Orders"])
async def get_orders(_: bool = Depends(verify_token)):
    """
    Get a list of all orders in the system.
    """
    orders = []
    async for order in order_collection.find():
        order["_id"] = str(order["_id"])
        orders.append(order)
    return orders

@app.get("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Get an order by order_id", tags=["Orders"])
async def read_order(order_id: int, _: bool = Depends(verify_token)):
    """
    Get the details of a specific order by its ID.
    """
    order = await order_collection.find_one({"order_id": order_id})
    if order:
        order["_id"] = str(order["_id"])
        return order
    raise HTTPException(status_code=404, detail="Order not found")

@app.post("/orders/", response_model=Order, status_code=status.HTTP_201_CREATED,
          summary="Create a new order", tags=["Orders"])
async def create_order(order: Order, _: bool = Depends(verify_token)):
    """
    Create a new order in the system, including user_id.
    """
    order_dict = order.dict()
    result = await order_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)
    return order_dict

@app.put("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Update an existing order", tags=["Orders"])
async def update_order(order_id: int, updated_order: Order, _: bool = Depends(verify_token)):
    """
    Update an existing order.
    """
    updated_data = {key: value for key, value in updated_order.dict().items() if value is not None}
    result = await order_collection.update_one(
        {"order_id": order_id}, 
        {"$set": updated_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    updated_order_dict = updated_order.dict()
    updated_order_dict["order_id"] = order_id
    return updated_order_dict

@app.delete("/orders/{order_id}", status_code=status.HTTP_200_OK,
            summary="Delete an order by order_id", tags=["Orders"])
async def delete_order(order_id: int, _: bool = Depends(verify_token)):
    """
    Delete an order by its ID.
    """
    result = await order_collection.delete_one({"order_id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@app.delete("/orders/book/{book_id}", status_code=status.HTTP_200_OK,
            summary="Delete orders by book_id", tags=["Orders"])
async def delete_orders_by_book_id(book_id: str, _: bool = Depends(verify_token)):
    """
    Delete all orders where `book_id` matches the provided book_id.
    """
    result = await order_collection.delete_many({"book_id": book_id})
    if result.deleted_count > 0:
        return {"message": f"{result.deleted_count} orders deleted with book_id = {book_id}"}
    raise HTTPException(status_code=404, detail=f"No orders found with book_id = {book_id}")

@app.get("/orders/quantity/{min_quantity}", response_model=List[Order], status_code=status.HTTP_200_OK)
async def get_orders_by_quantity(min_quantity: int, _: bool = Depends(verify_token)):
    """
    Get orders with quantity greater than a specified value.
    """
    orders = await order_collection.find({
        "quantity": {"$gt": min_quantity}
    }).to_list(100)
    
    if not orders:
        raise HTTPException(
            status_code=404, 
            detail="No orders found with quantity greater than specified value"
        )
    return orders

@app.post("/orders-update", response_model=Order, status_code=status.HTTP_201_CREATED,
          summary="Create a new order and update inventory", tags=["Orders"])
async def create_order_with_inventory(order: Order, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Create a new order in the system and update inventory.
    """
    try:
        inventory_book_id = int(order.book_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid book_id format")

    inventory_get_url = f"http://localhost:4002/api/inventory/{inventory_book_id}"
    inventory_decrement_url = f"http://localhost:4002/api/inventory/{inventory_book_id}/decrement"

    token = credentials.credentials  # Extract the JWT from the Authorization header

    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        # Include the JWT in the headers of the outgoing request
        inventory_response = await client.get(inventory_get_url, headers=headers)

        if inventory_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Book not found in inventory")
        elif inventory_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch inventory")

        inventory_data = inventory_response.json()
        available_quantity = inventory_data.get("quantity")

        if available_quantity is None:
            raise HTTPException(status_code=500, detail="Invalid inventory response")

        if available_quantity < order.quantity:
            raise HTTPException(status_code=400, detail="Not enough inventory available")

        decrement_payload = {"decrementAmount": order.quantity}
        decrement_response = await client.put(inventory_decrement_url, json=decrement_payload, headers=headers)

        if decrement_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Book not found in inventory")
        elif decrement_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to decrement inventory")

    order_dict = order.dict()
    result = await order_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)

    return order_dict

@app.get("/orders/user/{user_id}", response_model=List[Order], status_code=status.HTTP_200_OK,
         summary="Get all orders for a specific user", tags=["Orders"])
async def get_orders_by_user(user_id: int, _: bool = Depends(verify_token)):
    """
    Get all orders made by a specific user, identified by `user_id`.
    """
    orders = await order_collection.find({"user_id": user_id}).to_list(100)
    if not orders:
        raise HTTPException(
            status_code=404,
            detail=f"No orders found for user_id = {user_id}"
        )
    for order in orders:
        order["_id"] = str(order["_id"])  # Convert MongoDB ObjectId to string
    return orders