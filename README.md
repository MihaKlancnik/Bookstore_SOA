# Bookstore_SOA
Projekt treh prijateljev, ki želijo opraviti predmet SUA. Zgradili bodo aplikacijo za prodajo knjig.

# PREDVIDENA STRUKTURA PROJEKTA
# Online Bookstore Microservices Architecture

## Service Breakdown

### 1. User Management Service (Express)
- **Responsibilities:**
  - User managment
- **Database:** SQLite
- **Key APIs:**
  - GET api/users
  - GET api/users/{id}
  - POST api/users
  - POST api/users/bulk
  - PUT api/users/{id}
  - PUT api/users/{id}/password 
  - DELETE api/users/{id}
  - DELETE api/users/{id}/deactivate
- **Port:** 4001

### 1. User Management Service (Express)
- **Responsibilities:**
  - Inventory managment
- **Database:** SQLite
- **Key APIs:**
  - GET api/inventory
  - GET api/inventory/{id}
  - POST api/inventory
  - POST api/inventory/bulk
  - PUT api/inventory/{id}
  - PUT api/inventory/{id}/increment 
  - DELETE api/inventory/{id}
  - DELETE api/inventory/book/{bookid}
- **Port:** 4001

### 2. Book Catalog Service (FastAPI)
- **Responsibilities:**
  - Book inventory management
  - Category organization
  - Search and filtering
  - Author information
- **Database:** MongoDB
- **Key APIs:**
  - GET /books
  - GET /books/{id}
  - GET /categories
  - GET /authors
  - GET /books/search
- **Port:** 8000

### 3. Order Management Service (NestJS)
- **Responsibilities:**
  - Shopping cart management
  - Order processing
  - Payment integration
  - Order history
- **Database:** PostgreSQL
- **Key APIs:**
  - POST /orders
  - GET /orders/{id}
  - PUT /orders/{id}/status
  - GET /cart
  - POST /cart/items
- **Port:** 3001

### 4. Review & Rating Service (FastAPI)
- **Responsibilities:**
  - Book reviews
  - Ratings management
  - Review moderation
  - Average rating calculation
- **Database:** MongoDB
- **Key APIs:**
  - POST /books/{id}/reviews
  - GET /books/{id}/reviews
  - PUT /reviews/{id}
  - GET /users/{id}/reviews
- **Port:** 8002

### 5. Frontend (SvelteKit)
- **Features:**
  - Responsive book browsing
  - User authentication
  - Shopping cart
  - Order management
  - Review system
- **Port:** 5000

## Project Structure
```
bookstore/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   └── svelte-app/
├── user-service/
│   ├── Dockerfile
│   └── express-app/
├── inventory-service/
│   ├── Dockerfile
│   └── express-app/
├── book-service/
│   ├── Dockerfile
│   └── fastapi-app/
├── order-service/
│   ├── Dockerfile
│   └── nest-app/
└── review-service/
    ├── Dockerfile
    └── fastapi-app/
```

## Service Communication Patterns

1. **Synchronous Communication:**
   - REST APIs between services
   - API Gateway for frontend requests

2. **Asynchronous Communication:**
   - RabbitMQ for event-driven updates:
     - Order status changes
     - New book reviews
     - Inventory updates

## Database Schema Highlights

1. **User Service (SQLite)**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,                   
    email TEXT NOT NULL UNIQUE,           
    password TEXT NOT NULL,               
    phone TEXT,                           
    address TEXT,
    reviews TEXT,
    role TEXT DEFAULT 'user',                         
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
2. **Inventory Service (SQLite)**
```sql
CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
```
3. **Book Service (MongoDB)**
```javascript
{
  title: String,
  author: {
    name: String,
    bio: String
  },
  isbn: String,
  price: Number,
  stock: Number,
  categories: Array,
  description: String,
  publisher: String,
  publishDate: Date
}
```

4. **Order Service (PostgreSQL)**
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    book_id VARCHAR(255),
    quantity INTEGER,
    price DECIMAL(10,2)
);
```

5. **Review Service (MongoDB)**
```javascript
{
  book_id: String,
  user_id: Integer,
  rating: Number,
  review_text: String,
  created_at: Date,
  updated_at: Date,
  helpful_votes: Number
}
