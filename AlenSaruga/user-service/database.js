const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'users.db');

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
        INSERT INTO users (name, email, password, phone, address) VALUES
        ('Alice Johnson', 'alice.johnson@example.com', 'password123', '1234567890', '123 Elm Street, Springfield'),
        ('Bob Smith', 'bob.smith@example.com', 'securepass456', '0987654321', '456 Oak Avenue, Shelbyville'),
        ('Charlie Brown', 'charlie.brown@example.com', 'pass789secure', NULL, '789 Pine Lane, Capital City'),
        ('Diana Prince', 'diana.prince@example.com', 'wonderwoman321', '5551234567', 'Themyscira Island'),
        ('Edward Elric', 'edward.elric@example.com', 'alchemy987', NULL, NULL);
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
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,                   
    email TEXT NOT NULL UNIQUE,           
    password TEXT NOT NULL,               
    phone TEXT,                           
    address TEXT,                         
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Database schema initialized successfully.');
            //addDummyData();
        }
    });
}

module.exports = db;
