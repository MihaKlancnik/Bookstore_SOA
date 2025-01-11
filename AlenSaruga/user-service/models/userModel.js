const bcrypt = require('bcrypt');
const db = require('../database');

exports.getUserByEmail = (email, password, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error('Database query error:', err.message);
            callback(err, null);
            return;
        }

        if (!row) {
            console.warn('User not found for email:', email);
            callback(new Error('User not found'), null);
            return;
        }

        bcrypt.compare(password, row.password, (compareErr, isMatch) => {
            if (compareErr) {
                console.error('Error comparing passwords:', compareErr.message);
                callback(compareErr, null);
                return;
            }

            if (!isMatch) {
                console.warn('Invalid password for email:', email);
                callback(new Error('Invalid password'), null);
                return;
            }

            console.info('User authenticated successfully:', email);
            callback(null, row);
        });
    });
};



exports.getAllUsers = (callback) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        callback(err, rows);
    });
};

exports.getUserById = (id, callback) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        callback(err, row);
    });
};

exports.createUser = async (user, callback) => {
    try {
        const { name, email, password } = user;

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword],
            function (err) {
                callback(err, this?.lastID);
            }
        );
    } catch (err) {
        callback(err, null);
    }
};

exports.createMultipleUsers = async (users, callback) => {
    try {
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        const placeholders = hashedUsers.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const query = `INSERT INTO users (name, email, password, phone, address) VALUES ${placeholders}`;
        const values = hashedUsers.flatMap(user => [
            user.name,
            user.email,
            user.password,
            user.phone || null,
            user.address || null
        ]);

        db.run(query, values, function (err) {
            callback(err, this?.changes);
        });
    } catch (err) {
        callback(err, null);
    }
};

exports.updateUser = async (id, user, callback) => {
    try {
        const { name, email, password } = user;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
            [name, email, hashedPassword, id],
            function (err) {
                callback(err, this.changes);
            }
        );
    } catch (err) {
        callback(err, null);
    }
};

 exports.updateUserPassword = async (id, newPassword, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const query = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(query, [hashedPassword, id], function (err) {
            callback(err, this.changes);
        });
    } catch (err) {
        callback(err, null);
    }
};

exports.deleteUser = (id, callback) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        callback(err, this.changes);
    });
};

exports.deactivateUser = (id, callback) => {
    const query = `UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [id], function (err) {
        callback(err, this.changes);
    });
};
