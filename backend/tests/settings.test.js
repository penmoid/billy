const request = require('supertest');
const fs = require('fs');
const path = require('path');
let db;

const testDataDir = path.join(__dirname, 'data');
const testDbPath = path.join(testDataDir, 'settings.test.db');

let app;

beforeAll(() => {
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir);
  }
  process.env.DATA_DIR = testDataDir;
  process.env.DB_PATH = testDbPath;
  db = require('../db');
});

beforeEach(() => {
  jest.resetModules();
  app = require('../index');
  db.exec('DELETE FROM settings');
});

afterAll(() => {
  db.close();
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
});

describe('GET /api/settings', () => {
  it('should return empty object when no settings saved', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({});
  });
});

describe('POST /api/settings', () => {
  it('should save and return settings', async () => {
    const settings = { title: 'Test', pastPeriods: 2, futurePeriods: 3 };
    const res = await request(app).post('/api/settings').send(settings);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Settings saved successfully.');

    const getRes = await request(app).get('/api/settings');
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toEqual({
      title: 'Test',
      pastPeriods: '2',
      futurePeriods: '3',
    });
  });
});
