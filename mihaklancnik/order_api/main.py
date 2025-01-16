from fastapi import FastAPI, HTTPException, Query, status, Depends
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import httpx
import os
from dotenv import load_dotenv
#from fastapi_jwt_auth import AuthJWT
from starlette.middleware.base import BaseHTTPMiddleware
load_dotenv()

geslo = os.environ.get("MihaGeslo")
class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("SECRET_KEY")
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
app.config = Settings()

def get_current_user(Authorize: AuthJWT = Depends()):
    try:
        # This will validate the token from the request headers
        Authorize.jwt_required()

        # Get the current user's information from the JWT
        current_user = Authorize.get_jwt_subject()
        return current_user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

# Add middleware for JWT
app.add_middleware(
    BaseHTTPMiddleware,
    dispatch=lambda request, call_next: call_next(request),
)

class Order(BaseModel):
    order_id: int
    book_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    price: float = Field(..., gt=0, description="Price must be greater than 0")

    class Config:
        schema_extra = {
            "example": {
                "order_id": 1,
                "book_id": "book3",
                "quantity": 3,
                "price": 15.99
                }
        }

# CREATE operation (Insert a new order)
# CREATE operation (Insert a new order)
@app.post("/orders/", response_model=Order, status_code=status.HTTP_201_CREATED,
          summary="Create a new order", tags=["Orders"],
          responses={201: {"description": "Order created", "model": Order},
                     400: {"description": "Bad Request"}})
async def create_order(order: Order, current_user: str = Depends(get_current_user)):
    """
    Create a new order in the system. 
    """
    order_dict = order.dict()
    order_dict["user_id"] = current_user  # Store the current user ID in the order
    result = await order_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)
    return order_dict

# READ operation (Get an order by order_id)
@app.get("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Get an order by order_id", tags=["Orders"],
         responses={200: {"description": "Order found", "model": Order},
                    404: {"description": "Order not found"}})
async def read_order(order_id: int, current_user: str = Depends(get_current_user)):
    """
    Get the details of a specific order by its ID.
    """
    order = await order_collection.find_one({"order_id": order_id, "user_id": current_user})
    if order:
        order["_id"] = str(order["_id"])  # Convert ObjectId to string
        return order
    raise HTTPException(status_code=404, detail="Order not found")

# UPDATE operation (Update an order by order_id)
@app.put("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Update an existing order", tags=["Orders"],
         responses={200: {"description": "Order updated", "model": Order},
                    404: {"description": "Order not found"}})
async def update_order(order_id: int, updated_order: Order, current_user: str = Depends(get_current_user)):
    """
    Update an existing order.
    """
    updated_data = {key: value for key, value in updated_order.dict().items() if value is not None}
    result = await order_collection.update_one({"order_id": order_id, "user_id": current_user}, {"$set": updated_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    updated_order_dict = updated_order.dict()
    updated_order_dict["order_id"] = order_id  # Ensure order_id is maintained
    return updated_order_dict

# DELETE operation (Delete an order by order_id)
@app.delete("/orders/{order_id}", response_model=dict, status_code=status.HTTP_200_OK,
            summary="Delete an order by order_id", tags=["Orders"],
            responses={200: {"description": "Order deleted successfully"},
                       404: {"description": "Order not found"}})
async def delete_order(order_id: int, current_user: str = Depends(get_current_user)):
    """
    Delete an order by its ID.
    """
    result = await order_collection.delete_one({"order_id": order_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# Get all orders (Optional route)
@app.get("/orders/", response_model=List[Order], status_code=status.HTTP_200_OK,
         summary="Get all orders", tags=["Orders"],
         responses={200: {"description": "List of orders", "model": List[Order]}})

async def get_orders(current_user: str = Depends(get_current_user)):
    """
    Get a list of all orders in the system.
    """
    orders = []
    async for order in order_collection.find({"user_id": current_user}):  # Filter by user_id
        order["_id"] = str(order["_id"])  
        orders.append(order)
    return orders

# Delete orders by book_id
@app.delete("/orders/book/{book_id}", response_model=dict, status_code=status.HTTP_200_OK,
            summary="Delete orders by book_id", tags=["Orders"],
            responses={200: {"description": "Orders deleted successfully"},
                       404: {"description": "No orders found with the given book_id"}})
async def delete_orders_by_book_id(book_id: str):
    """
    Delete all orders where `book_id` matches the provided book_id.

    - **book_id**: The ID of the book to delete orders for (required)
    """
    result = await order_collection.delete_many({"book_id": book_id})  # Delete all orders with the given book_id
    if result.deleted_count > 0:
        return {"message": f"{result.deleted_count} orders deleted with book_id = {book_id}"}
    else:
        raise HTTPException(status_code=404, detail=f"No orders found with book_id = {book_id}")

# Get orders with quantity greater than a specified value
@app.get("/orders/quantity/{min_quantity}", response_model=List[Order], status_code=status.HTTP_200_OK)
async def get_orders_by_quantity(min_quantity: int):
    orders = await order_collection.find({"quantity": {"$gt": min_quantity}}).to_list(100)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found with quantity greater than specified value")

    return orders



@app.post("/orders/", response_model=Order, status_code=status.HTTP_201_CREATED,
          summary="Create a new order and update inventory", tags=["Orders"],
          responses={201: {"description": "Order created", "model": Order},
                     400: {"description": "Bad Request"},
                     404: {"description": "Book not found in inventory"},
                     500: {"description": "Internal Server Error"}})
async def create_order(order: Order):
    """
    Create a new order in the system, decrement inventory, and insert the order into the database.

    - **order_id**: The unique ID of the order (required)
    - **book_id**: The ID of the book (required)
    - **quantity**: The quantity of the book (required, must be greater than 0)
    - **price**: The price of the book (required, must be greater than 0)
    """
    # Convert book_id to int for inventory API
    try:
        inventory_book_id = int(order.book_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid book_id format")

    # Define inventory API URLs
    inventory_get_url = f"http://localhost:4002/api/inventory/{inventory_book_id}"
    inventory_decrement_url = f"http://localhost:4002/api/inventory/{inventory_book_id}/decrement"

    async with httpx.AsyncClient() as client:
        # Step 1: Fetch current inventory
        inventory_response = await client.get(inventory_get_url)

        if inventory_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Book not found in inventory")
        elif inventory_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch inventory")

        inventory_data = inventory_response.json()
        available_quantity = inventory_data.get("quantity")

        if available_quantity is None:
            raise HTTPException(status_code=500, detail="Invalid inventory response")

        # Step 2: Check if there's enough inventory
        if available_quantity < order.quantity:
            raise HTTPException(status_code=400, detail="Not enough inventory available")

        # Step 3: Decrement inventory
        decrement_payload = {"decrementAmount": order.quantity}
        decrement_response = await client.put(inventory_decrement_url, json=decrement_payload)

        if decrement_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Book not found in inventory")
        elif decrement_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to decrement inventory")

    # Step 4: Create the order
    order_dict = order.dict()
    result = await order_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)

    return order_dict