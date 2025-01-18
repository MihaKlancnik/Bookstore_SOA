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
    INSERT INTO users (name, email, password, phone, address, role) VALUES
    ('Alice Johnson', 'alice.johnson@example.com', '$2b$10$zRxkJWoVL0yvPi6.V.37Gu8E90jDysTE8.7Z.MKTk2BEhyn4T99fK', '1234567890', '123 Elm Street, Springfield', 'user'),
    ('Bob Smith', 'bob.smith@example.com', '$2b$10$E7WiPec1lclT4YUjBzH1x.HXGIhQU6us5f0drnqqH7OCapIzZzCkG', '0987654321', '456 Oak Avenue, Shelbyville', 'user'),
    ('Charlie Brown', 'charlie.brown@example.com', '$2b$10$QeVmWpQZRl3VOM9NvN8MbudbA41yw8XhcMRhvB9SmHScu1YUiA0gq', NULL, '789 Pine Lane, Capital City', 'user'),
    ('Diana Prince', 'diana.prince@example.com', '$2b$10$UXfefCQEMXcDTqoQzZ97QeU8zJdoFKbLgQVTf0cg7UJ5EhreP8pbO', '5551234567', 'Themyscira Island', 'user'),
    ('Edward Elric', 'edward.elric@example.com', '$2b$10$b03P25eflo7pxZQgWVDxiOtO.GruJKt/s834P4mxiKO1MsTy93aci', NULL, NULL, 'user'),
    ('admin', 'admin@gmail.com', '$2b$10$deu1waPWaD4UwSnHm980IekHnHzoR.gx8K74alU2oKCiexGgI866q', NULL, NULL, 'admin');
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
    reviews TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,                         
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Database schema initialized successfully.');
            addDummyData();
        }
    });
}

module.exports = db;
