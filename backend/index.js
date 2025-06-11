// backend/index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Utility function to map a database row to a bill object
const mapRowToBill = (row) => ({
  id: row.id,
  name: row.name,
  dueDay: row.dueDay,
  amount: row.amount,
  frequency: row.frequency,
  transactionType: row.transactionType,
  autoPay: !!row.autoPay,
  paymentHistory: row.paymentHistory ? JSON.parse(row.paymentHistory) : {},
  dueDate: row.dueDate || undefined,
});

// API Endpoints

// Get all bills
app.get('/api/bills', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM bills').all();
    const bills = rows.map(mapRowToBill);
    res.json(bills);
  } catch (err) {
    console.error('Error reading data:', err);
    res.json([]);
  }
});

// Add new bill(s)
app.post('/api/bills', (req, res) => {
  const newBills = Array.isArray(req.body) ? req.body : [req.body];

  const insert = db.prepare(`INSERT INTO bills
    (id, name, dueDay, amount, frequency, transactionType, autoPay, paymentHistory, dueDate)
    VALUES (@id, @name, @dueDay, @amount, @frequency, @transactionType, @autoPay, @paymentHistory, @dueDate)`);

  const transaction = db.transaction((bills) => {
    for (const bill of bills) {
      insert.run({
        id: bill.id,
        name: bill.name,
        dueDay: bill.dueDay,
        amount: bill.amount,
        frequency: bill.frequency,
        transactionType: bill.transactionType,
        autoPay: bill.autoPay ? 1 : 0,
        paymentHistory: JSON.stringify(bill.paymentHistory || {}),
        dueDate: bill.dueDate || null,
      });
    }
  });

  try {
    transaction(newBills);
    res.json({
      message: 'Bill(s) added successfully.',
      bills: newBills,
    });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Failed to save data.' });
  }
});

// Update a single bill
app.put('/api/bills/:id', (req, res) => {
  const billId = parseInt(req.params.id);
  const updatedBill = req.body;

  const existing = db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
  if (!existing) {
    return res.status(404).json({ error: 'Bill not found.' });
  }

  const merged = { ...mapRowToBill(existing), ...updatedBill };

  try {
    db.prepare(`UPDATE bills SET
      name=@name,
      dueDay=@dueDay,
      amount=@amount,
      frequency=@frequency,
      transactionType=@transactionType,
      autoPay=@autoPay,
      paymentHistory=@paymentHistory,
      dueDate=@dueDate
      WHERE id=@id`).run({
        id: billId,
        name: merged.name,
        dueDay: merged.dueDay,
        amount: merged.amount,
        frequency: merged.frequency,
        transactionType: merged.transactionType,
        autoPay: merged.autoPay ? 1 : 0,
        paymentHistory: JSON.stringify(merged.paymentHistory || {}),
        dueDate: merged.dueDate || null,
      });
    res.json({ message: 'Bill updated successfully.', bill: merged });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Failed to save data.' });
  }
});

// Delete a single bill
app.delete('/api/bills/:id', (req, res) => {
  const billId = parseInt(req.params.id);

  try {
    const info = db.prepare('DELETE FROM bills WHERE id = ?').run(billId);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Bill not found.' });
    }
    res.json({ message: 'Bill deleted successfully.' });
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Failed to delete data.' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Export the app for testing
module.exports = app;

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
