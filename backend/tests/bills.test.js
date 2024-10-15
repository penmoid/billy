// backend/tests/bills.test.js

const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Define the path to the test data file
const testDataDir = path.join(__dirname, 'data');
const testDataFilePath = path.join(testDataDir, 'bills.test.json');

let app;

// Before all tests, ensure the test data directory exists and set environment variables
beforeAll(() => {
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir);
  }
  process.env.DATA_DIR = testDataDir;
  process.env.DATA_FILE_PATH = testDataFilePath;
});

beforeEach(() => {
  // Reset the module registry to ensure a fresh app instance
  jest.resetModules();

  // Import the app after setting environment variables
  app = require('../index');

  // Initialize test data
  const initialData = [
    {
      "name": "Test Bill 1",
      "dueDay": "15",
      "amount": "100",
      "frequency": "monthly",
      "transactionType": "EFT",
      "autoPay": true,
      "id": 1,
      "paymentHistory": {}
    },
    {
      "name": "Test Bill 2",
      "dueDay": "2",
      "amount": "200",
      "frequency": "weekly",
      "transactionType": "Cash",
      "autoPay": false,
      "id": 2,
      "paymentHistory": {}
    }
  ];
  fs.writeFileSync(testDataFilePath, JSON.stringify(initialData, null, 2));
});

afterEach(() => {
  // Remove the test data file after each test
  if (fs.existsSync(testDataFilePath)) {
    fs.unlinkSync(testDataFilePath);
  }
});

afterAll(() => {
  // Remove the test data directory after all tests
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true }); // Updated to fs.rmSync to fix deprecation warning
  }
});

describe('GET /api/bills', () => {
  it('should retrieve all bills', async () => {
    const res = await request(app).get('/api/bills');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Test Bill 1');
    expect(res.body[1].name).toBe('Test Bill 2');
  });
});

describe('POST /api/bills', () => {
  it('should add a new bill', async () => {
    const newBill = {
      "name": "Test Bill 3",
      "dueDay": "10",
      "amount": "150",
      "frequency": "biweekly",
      "transactionType": "Credit/Debit",
      "autoPay": false,
      "id": 3,
      "paymentHistory": {}
    };
    const res = await request(app).post('/api/bills').send(newBill);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Bill(s) added successfully.');
    expect(res.body.bills).toHaveLength(1);
    expect(res.body.bills[0].name).toBe('Test Bill 3');

    // Verify that the bill was added
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body).toHaveLength(3);
    expect(getRes.body[2].name).toBe('Test Bill 3');
  });

  it('should add multiple bills', async () => {
    const newBills = [
      {
        "name": "Test Bill 4",
        "dueDay": "20",
        "amount": "250",
        "frequency": "monthly",
        "transactionType": "Internal Transfer",
        "autoPay": true,
        "id": 4,
        "paymentHistory": {}
      },
      {
        "name": "Test Bill 5",
        "dueDay": "5",
        "amount": "300",
        "frequency": "weekly",
        "transactionType": "Cash",
        "autoPay": false,
        "id": 5,
        "paymentHistory": {}
      }
    ];
    const res = await request(app).post('/api/bills').send(newBills);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Bill(s) added successfully.');
    expect(res.body.bills).toHaveLength(2);

    // Verify that the bills were added
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body).toHaveLength(4);
    expect(getRes.body[2].name).toBe('Test Bill 4');
    expect(getRes.body[3].name).toBe('Test Bill 5');
  });
});

describe('PUT /api/bills/:id', () => {
  it('should update an existing bill', async () => {
    const updatedBill = {
      "name": "Updated Test Bill 1",
      "amount": "120",
      "autoPay": false
    };
    const res = await request(app).put('/api/bills/1').send(updatedBill);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Bill updated successfully.');
    expect(res.body.bill.name).toBe('Updated Test Bill 1');
    expect(res.body.bill.amount).toBe('120');
    expect(res.body.bill.autoPay).toBe(false);

    // Verify that the bill was updated
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body[0].name).toBe('Updated Test Bill 1');
    expect(getRes.body[0].amount).toBe('120');
    expect(getRes.body[0].autoPay).toBe(false);
  });

  it('should return 404 for non-existent bill', async () => {
    const updatedBill = {
      "name": "Non-existent Bill",
      "amount": "500",
      "autoPay": true
    };
    const res = await request(app).put('/api/bills/999').send(updatedBill);
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toBe('Bill not found.');

    // Verify that no new bill was added
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body).toHaveLength(2);
  });
});

describe('DELETE /api/bills/:id', () => {
  it('should delete an existing bill', async () => {
    const res = await request(app).delete('/api/bills/2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Bill deleted successfully.');

    // Verify that the bill was deleted
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].id).toBe(1);
  });

  it('should return 404 for non-existent bill', async () => {
    const res = await request(app).delete('/api/bills/999');
    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toBe('Bill not found.');

    // Verify that no bills were deleted
    const getRes = await request(app).get('/api/bills');
    expect(getRes.body).toHaveLength(2);
  });
});
