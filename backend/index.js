// backend/index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to the data file
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFilePath = process.env.DATA_FILE_PATH || path.join(dataDir, 'bills.json');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// API Endpoints

// Get all bills
app.get('/api/bills', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.json([]);
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error('Error parsing data:', parseErr);
      res.json([]);
    }
  });
});

// Add new bill(s)
app.post('/api/bills', (req, res) => {
  const newBills = req.body;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    let bills = [];
    if (!err && data) {
      try {
        bills = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing data:', parseErr);
      }
    }

    // Check if newBills is an array
    if (Array.isArray(newBills)) {
      bills = bills.concat(newBills);
    } else {
      bills.push(newBills);
    }

    fs.writeFile(dataFilePath, JSON.stringify(bills, null, 2), (err) => {
      if (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ error: 'Failed to save data.' });
      }
      // Ensure that 'bills' is always an array in the response
      res.json({
        message: 'Bill(s) added successfully.',
        bills: Array.isArray(newBills) ? newBills : [newBills],
      });
    });
  });
});

// Update a single bill
app.put('/api/bills/:id', (req, res) => {
  const billId = parseInt(req.params.id);
  const updatedBill = req.body;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data.' });
    }

    let bills;
    try {
      bills = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing data:', parseErr);
      return res.status(500).json({ error: 'Failed to parse data.' });
    }

    const billIndex = bills.findIndex((bill) => bill.id === billId);
    if (billIndex === -1) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    // Ensure paymentHistory is preserved
    bills[billIndex] = { ...bills[billIndex], ...updatedBill };

    fs.writeFile(dataFilePath, JSON.stringify(bills, null, 2), (err) => {
      if (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ error: 'Failed to save data.' });
      }
      res.json({ message: 'Bill updated successfully.', bill: bills[billIndex] });
    });
  });
});

// Delete a single bill
app.delete('/api/bills/:id', (req, res) => {
  const billId = parseInt(req.params.id);

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data.' });
    }

    let bills;
    try {
      bills = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing data:', parseErr);
      return res.status(500).json({ error: 'Failed to parse data.' });
    }

    const billIndex = bills.findIndex((bill) => bill.id === billId);
    if (billIndex === -1) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    bills.splice(billIndex, 1);

    fs.writeFile(dataFilePath, JSON.stringify(bills, null, 2), (err) => {
      if (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ error: 'Failed to save data.' });
      }
      res.json({ message: 'Bill deleted successfully.' });
    });
  });
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
