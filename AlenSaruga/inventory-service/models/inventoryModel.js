const db = require('../database');

exports.getAllInventory = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM inventory';
        db.all(query, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

exports.getInventoryById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM inventory WHERE id = ?';
        db.get(query, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

exports.createInventoryItem = ({ book_id, quantity }) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO inventory (book_id, quantity) VALUES (?, ?)';
        db.run(query, [book_id, quantity], function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

exports.postBulkInventoryItems = (items) => {
    return new Promise((resolve, reject) => {
        const placeholders = items.map(() => '(?, ?)').join(', ');
        const query = `INSERT INTO inventory (book_id, quantity) VALUES ${placeholders}`;
        const values = items.flatMap(({ book_id, quantity }) => [book_id, quantity]);

        db.run(query, values, function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};


exports.updateInventoryItem = (id, quantity) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE inventory SET quantity = ? WHERE id = ?';
        db.run(query, [quantity, id], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

exports.decrementInventoryQuantity = (id, decrementAmount) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE inventory
            SET quantity = quantity - ?, updated_at = datetime('now')
            WHERE id = ?
        `;
        db.run(query, [decrementAmount, id], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

exports.deleteInventoryItem = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM inventory WHERE id = ?';
        db.run(query, [id], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

exports.deleteInventoryByBookId = (bookId) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM inventory WHERE book_id = ?`;
        db.run(query, [bookId], function (err) {
            if (err) return reject(err);
            resolve(this.changes); // this.changes gives the number of deleted rows
        });
    });
};






