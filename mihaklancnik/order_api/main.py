from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List

# MongoDB connection
MONGODB_URI = "mongodb+srv://mihaklancnik2:$MONGOGESLO@ptscluster.qfts7.mongodb.net/?retryWrites=true&w=majority&appName=PTSCLUSTER"
client = AsyncIOMotorClient(MONGODB_URI)
db = client["SOA"]
order_collection = db["orders"]

app = FastAPI(
    title="Order Management API",
    description="API for managing orders",
    version="1.0.0",
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
@app.post("/orders/", response_model=Order, status_code=status.HTTP_201_CREATED,
          summary="Create a new order", tags=["Orders"],
          responses={201: {"description": "Order created", "model": Order},
                     400: {"description": "Bad Request"}})
async def create_order(order: Order):
    """
    Create a new order in the system.

    - **order_id**: The unique ID of the order (required)
    - **book_id**: The ID of the book (required)
    - **quantity**: The quantity of the book (required, must be greater than 0)
    - **price**: The price of the book (required, must be greater than 0)
    """
    order_dict = order.dict()
    result = await order_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)
    return order_dict

# READ operation (Get an order by order_id)
@app.get("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Get an order by order_id", tags=["Orders"],
         responses={200: {"description": "Order found", "model": Order},
                    404: {"description": "Order not found"}})
async def read_order(order_id: int):
    """
    Get the details of a specific order by its ID.

    - **order_id**: The ID of the order to retrieve (required)
    """
    order = await order_collection.find_one({"order_id": order_id})
    if order:
        order["_id"] = str(order["_id"])  # Convert ObjectId to string
        return order
    raise HTTPException(status_code=404, detail="Order not found")

# UPDATE operation (Update an order by order_id)
@app.put("/orders/{order_id}", response_model=Order, status_code=status.HTTP_200_OK,
         summary="Update an existing order", tags=["Orders"],
         responses={200: {"description": "Order updated", "model": Order},
                    404: {"description": "Order not found"}})
async def update_order(order_id: int, updated_order: Order):
    """
    Update an existing order.

    - **order_id**: The ID of the order to update (required)
    - **book_id**: The ID of the book (optional)
    - **quantity**: The quantity of the book (optional, must be greater than 0)
    - **price**: The price of the book (optional, must be greater than 0)
    """
    updated_data = {key: value for key, value in updated_order.dict().items() if value is not None}
    result = await order_collection.update_one({"order_id": order_id}, {"$set": updated_data})
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
async def delete_order(order_id: int):
    """
    Delete an order by its ID.

    - **order_id**: The ID of the order to delete (required)
    """
    result = await order_collection.delete_one({"order_id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# Get all orders (Optional route)
@app.get("/orders/", response_model=List[Order], status_code=status.HTTP_200_OK,
         summary="Get all orders", tags=["Orders"],
         responses={200: {"description": "List of orders", "model": List[Order]}})
async def get_orders():
    """
    Get a list of all orders in the system.
    """
    orders = []
    async for order in order_collection.find():
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
