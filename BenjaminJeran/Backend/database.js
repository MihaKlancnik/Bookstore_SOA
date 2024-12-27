const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'books.db');

const dbExists = fs.existsSync(DB_PATH);

if (!dbExists) {
    console.log('Database file not found. Creating a new database...');
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        if (!dbExists) {
            initializeDatabase();
        }
    }
});

function initializeDatabase() {
    console.log('Initializing database schema...');
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10, 2),
        stock INT NOT NULL,
        description TEXT
    );`;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Database schema initialized successfully.');
        }
    });
}

module.exports = db;
