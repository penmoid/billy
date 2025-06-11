const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const dbPath = process.env.DB_PATH || path.join(dataDir, 'bills.db');

const db = new Database(dbPath);

// Initialize table
const init = `CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY,
  name TEXT,
  dueDay TEXT,
  amount TEXT,
  frequency TEXT,
  transactionType TEXT,
  autoPay INTEGER,
  paymentHistory TEXT,
  dueDate TEXT
)`;

db.exec(init);

module.exports = db;
