const sqlite3 = require('sqlite3').verbose();;
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'inventory.db');

const dbExists = fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }

    console.log('Connected to SQLite database.');

    if (!dbExists) {
        initializeDatabase();
    }
});

function addDummyData() {
    console.log('Adding dummy data to the database...');

    const insertQuery = `
        INSERT INTO inventory (book_id, quantity) VALUES
        (1, 10),
        (2, 5),
        (3, 5),
        (4, 7),
        (5, 2);
    `;

    db.run(insertQuery, (err) => {
        if (err) {
            console.error('Error adding dummy data:', err.message);
        } else {
            console.log('Dummy data added successfully.');
        }
    });
}

function initializeDatabase() {
    console.log('Initializing database schema...');

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table created successfully.');
            addDummyData();
        }
    });
}

module.exports = db;