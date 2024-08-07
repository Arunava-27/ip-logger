// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ip_data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ip_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ipv4 TEXT,
    ipv6 TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
