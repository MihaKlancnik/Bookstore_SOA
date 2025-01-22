const express = require('express');
const db = require('../database'); 
const axios = require('axios');
const jwt = require('jsonwebtoken');


const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
};

const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
  
    if (!token) {
        return res.status(403).json({ message: 'Token is required' }); 
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => { 
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' }); 
        }
        req.user = decoded; 
        next(); 
    });
  };

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve all books
 *     description: Fetches a list of all books from the database.
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => {
    const query = 'SELECT * FROM books';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching books:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); 
    });
});


/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Retrieve a book by ID
 *     description: Fetches a single book by its unique ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: The requested book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM books WHERE id = ?';
    const bookId = req.params.id;

    db.get(query, [bookId], (err, row) => {
        if (err) {
            console.error('Error fetching book:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        res.json(row); 
    });
});




/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     description: Creates a new book in the database.
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Book successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created book
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyJWT, isAdmin,  (req, res) => {
    const { title, author, category, price, stock, description } = req.body;

    if (!title || !author || stock === undefined) {
        return res.status(400).json({ error: 'Title, author, and stock are required fields.' });
    }

    const query = `INSERT INTO books (title, author, category, price, stock, description) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(query, [title, author, category, price, stock, description], function (err) {
        if (err) {
            console.error('Error adding book:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID }); // Respond with the new book's ID
    });
});


/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     description: Updates the details of an existing book by its ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       200:
 *         description: Successfully updated the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   description: Number of updated rows
 *       400:
 *         description: Bad request, missing required fields or invalid data
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyJWT, isAdmin, (req, res) => {
    const { title, author, category, price, stock, description } = req.body;
    const bookId = req.params.id;

    const query = `UPDATE books 
                   SET title = ?, author = ?, category = ?, price = ?, stock = ?, description = ?
                   WHERE id = ?`;

    db.run(query, [title, author, category, price, stock, description, bookId], function (err) {
        if (err) {
            console.error('Error updating book:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        res.status(200).json({ updated: this.changes }); 
    });
});


/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     description: Deletes a book from the database by its ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: integer
 *                   description: Number of deleted rows
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyJWT, isAdmin, (req, res) => {
    const bookId = req.params.id;
    const query = 'DELETE FROM books WHERE id = ?';

    db.run(query, [bookId], function (err) {
        if (err) {
            console.error('Error deleting book:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        res.status(200).json({ deleted: this.changes }); 
    });
});


/**
 * @swagger
 * /books/{id}/reviews:
 *   get:
 *     summary: Retrieve reviews for a specific book
 *     description: Fetches reviews for a book by its ID by calling the Reviews service.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: A list of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user_id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Book not found or no reviews available
 *       500:
 *         description: Internal server error
 */
router.get('/:id/reviews', async (req, res) => {
    
    const bookId = req.params.id;
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ error: 'Authorization token is required for inventory request.' });
    }

    try {
        // Verify the book exists in the database
        const bookQuery = 'SELECT * FROM books WHERE id = ?';
        db.get(bookQuery, [bookId], async (err, book) => {
            if (err) {
                console.error('Error fetching book:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }

            try {
                const reviewsResponse = await axios.get(`http://reviewservice:2000/reviews/book/${bookId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                    }
                });

                const reviews = reviewsResponse.data;

                res.json({ book, reviews });
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    res.status(404).json({ error: `No reviews found for book with ID ${bookId}` });
                } else {
                    console.error('Error fetching reviews:', error.message);
                    res.status(500).json({ error: 'Unable to fetch reviews' });
                }
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



/**
 * @swagger
 * /books/{id}/inventory:
 *   get:
 *     summary: Retrieve inventory size for a specific book
 *     description: Fetches the inventory size of a book by its ID by calling the Inventory service.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: Inventory size for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book_id:
 *                   type: integer
 *                   description: The ID of the book
 *                 inventory:
 *                   type: integer
 *                   description: The available inventory size for the book
 *       404:
 *         description: Book not found or inventory data unavailable
 *       500:
 *         description: Internal server error
 */
router.get('/:id/inventory', async (req, res) => {
    const bookId = req.params.id;
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ error: 'Authorization token is required for inventory request.' });
    }

    try {
        // Verify the book exists in the database
        const bookQuery = 'SELECT * FROM books WHERE id = ?';
        db.get(bookQuery, [bookId], async (err, book) => {
            if (err) {
                console.error('Error fetching book:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }

            try {
                // Send the token in the Authorization header for the inventory service request
                const inventoryResponse = await axios.get(`http://inventoryservice:4002/api/inventory/${bookId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Sending JWT token in the request header
                    }
                });

                const inventory = inventoryResponse.data;

                // Respond with inventory quantity
                res.json({
                    book_id: bookId,
                    inventory: inventory.quantity || 0, // Use the `quantity` field from the inventory response
                });
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    res.status(404).json({ error: `No inventory data found for book with ID ${bookId}` });
                } else {
                    console.error('Error fetching inventory data:', error.message);
                    res.status(500).json({ error: 'Unable to fetch inventory data' });
                }
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the book
 *         title:
 *           type: string
 *           description: Title of the book
 *         author:
 *           type: string
 *           description: Author of the book
 *         category:
 *           type: string
 *           description: Category of the book
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the book
 *         stock:
 *           type: integer
 *           description: Stock count of the book
 *         description:
 *           type: string
 *           description: A brief description of the book
 *       example:
 *         id: 1
 *         title: "Sample Book"
 *         author: "John Doe"
 *         category: "Fiction"
 *         price: 15.99
 *         stock: 10
 *         description: "An amazing book."
 *     BookInput:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - stock
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *         description:
 *           type: string
 *       example:
 *         title: "New Book"
 *         author: "Jane Doe"
 *         category: "Science"
 *         price: 20.00
 *         stock: 15
 *         description: "An insightful book."
 */



/**
 * @swagger
 * /books/batch:
 *   post:
 *     summary: Add multiple books
 *     description: Creates multiple books in the database at once.
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Books successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created:
 *                   type: integer
 *                   description: Number of books created
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/batch', verifyJWT, isAdmin, (req, res) => {
    const books = req.body;

    if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of books.' });
    }

    const query = `INSERT INTO books (title, author, category, price, stock, description) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    const statements = books.map(book => [
        book.title, book.author, book.category, book.price, book.stock, book.description
    ]);

    const placeholders = statements.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const flattenedValues = statements.flat();

    db.run(`INSERT INTO books (title, author, category, price, stock, description) VALUES ${placeholders}`,
        flattenedValues,
        function (err) {
            if (err) {
                console.error('Error adding books in batch:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ created: this.changes }); // Respond with the number of created rows
        }
    );
});

/**
 * @swagger
 * /books/{id}/stock:
 *   put:
 *     summary: Update the stock of a book
 *     description: Updates the stock count of a book by its ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: integer
 *                 description: New stock count
 *             example:
 *               stock: 20
 *     responses:
 *       200:
 *         description: Successfully updated the stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   description: Number of updated rows
 *       400:
 *         description: Bad request, missing required fields or invalid data
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/stock', verifyJWT, isAdmin, (req, res) => {
    const { stock } = req.body;
    const bookId = req.params.id;

    if (stock === undefined || typeof stock !== 'number') {
        return res.status(400).json({ error: 'Stock is required and must be a number.' });
    }

    const query = `UPDATE books SET stock = ? WHERE id = ?`;

    db.run(query, [stock, bookId], function (err) {
        if (err) {
            console.error('Error updating stock:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Book not found' });
            return;
        }
        res.status(200).json({ updated: this.changes }); 
    });
});

/**
 * @swagger
 * /books/batch:
 *   delete:
 *     summary: Delete multiple books by IDs
 *     description: Deletes multiple books from the database based on an array of IDs.
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of book IDs to delete
 *             example:
 *               ids: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Successfully deleted the books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: integer
 *                   description: Number of deleted rows
 *       400:
 *         description: Bad request, missing or invalid IDs
 *       500:
 *         description: Internal server error
 */

router.delete('/batch', verifyJWT, isAdmin, (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Request body must contain an array of IDs.' });
    }

    const placeholders = ids.map(() => '?').join(', ');

    const query = `DELETE FROM books WHERE id IN (${placeholders})`;

    db.run(query, ids, function (err) {
        if (err) {
            console.error('Error deleting books in batch:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ deleted: this.changes }); 
    });
});

module.exports = router;
