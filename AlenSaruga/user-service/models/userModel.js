const db = require('../database');

// Fetch all users
exports.getAllUsers = (callback) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        callback(err, rows);
    });
};

// Fetch a single user by ID
exports.getUserById = (id, callback) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
};

// Create a new user
exports.createUser = (user, callback) => {
    const { name, email, password } = user;
    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password],
        function (err) {
            callback(err, this?.lastID);
        }
    );
};

// Create multiple users
exports.createMultipleUsers = (users, callback) => {
    const placeholders = users.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const query = `INSERT INTO users (name, email, password, phone, address) VALUES ${placeholders}`;
    const values = users.flatMap(user => [
        user.name,
        user.email,
        user.password,
        user.phone || null,
        user.address || null
    ]);

    db.run(query, values, function (err) {
        callback(err, this?.changes);
    });
};


// Update an existing user
exports.updateUser = (id, user, callback) => {
    const { name, email, password } = user;
    db.run(
        `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
        [name, email, password, id],
        function (err) {
            callback(err, this.changes);
        }
    );
};

// Update user password
exports.updateUserPassword = (id, newPassword, callback) => {
    const query = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [newPassword, id], function (err) {
        callback(err, this.changes);
    });
};



// Delete a user by ID
exports.deleteUser = (id, callback) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        callback(err, this.changes);
    });
};

// Deactivate (soft-delete) a user
exports.deactivateUser = (id, callback) => {
    const query = `UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [id], function (err) {
        callback(err, this.changes);
    });
};
