const express = require('express');
const db = require('../database'); 

const router = express.Router();


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


router.post('/', (req, res) => {
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


router.put('/:id', (req, res) => {
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
        res.status(200).json({ updated: this.changes }); // Return the number of rows updated
    });
});


router.delete('/:id', (req, res) => {
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

module.exports = router;