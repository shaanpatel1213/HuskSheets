import request from 'supertest';
import express from 'express';
import router from '../../routes/index';

/**
 * Initialize the Express application and apply middleware.
 *
 * @status {201} - Calling Endpoint was successful.
 * @status {200} - Calling Endpoint was successful.
 * 
 * @author syadav7173
 */
const app = express();
app.use(express.json()); // Add middleware for parsing JSON
app.use('/', router);

// Mock the auth middleware to get through authentication
jest.mock('../../middleware/auth', () => (req, res, next) => next());

// Mock the controller functions
jest.mock('../../controllers/authController', () => ({
  registerPublisher: jest.fn((req, res) => res.status(201).send('Publisher registered')),
  getAllPublishers: jest.fn((req, res) => res.status(200).send('All publishers')),
}));

jest.mock('../../controllers/publisherController', () => ({
  getPublishers: jest.fn((req, res) => res.status(200).send('Publisher details')),
}));

jest.mock('../../controllers/sheetController', () => ({
  createNewSheet: jest.fn((req, res) => res.status(201).send('Sheet created')),
  getSheets: jest.fn((req, res) => res.status(200).send('Sheets retrieved')),
  deleteSheet: jest.fn((req, res) => res.status(200).send('Sheet deleted')),
}));

jest.mock('../../controllers/updateController', () => ({
  getUpdatesForSubscription: jest.fn((req, res) => res.status(200).send('Subscription updates')),
  getUpdatesForPublished: jest.fn((req, res) => res.status(200).send('Published updates')),
  updatePublished: jest.fn((req, res) => res.status(200).send('Published content updated')),
  updateSubscription: jest.fn((req, res) => res.status(200).send('Subscription updated')),
}));

/**
 * Tests for route endpoints to ensure correct functionality.
 * 
 * @status {201} - Sheet successfully created
 * @status {200} - Calling Endpoint was successful.
 * 
 * @author syadav7173
 */
describe('Test routes', () => {
  it('should register a publisher', async () => {
    const response = await request(app).get('/register');
    expect(response.status).toBe(201);
    expect(response.text).toBe('Publisher registered');
  });

  it('should get all publishers', async () => {
    const response = await request(app).get('/getPublishers');
    expect(response.status).toBe(200);
    expect(response.text).toBe('All publishers');
  });

  it('should get publisher details', async () => {
    const response = await request(app).get('/publishers');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Publisher details');
  });

  it('should create a new sheet', async () => {
    const response = await request(app).post('/createSheet');
    expect(response.status).toBe(201);
    expect(response.text).toBe('Sheet created');
  });

  it('should get sheets', async () => {
    const response = await request(app).post('/getSheets');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Sheets retrieved');
  });

  it('should delete a sheet', async () => {
    const response = await request(app).post('/deleteSheet');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Sheet deleted');
  });

  it('should get updates for subscription', async () => {
    const response = await request(app).post('/getUpdatesForSubscription');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Subscription updates');
  });

  it('should get updates for published content', async () => {
    const response = await request(app).post('/getUpdatesForPublished');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Published updates');
  });

  it('should update published content', async () => {
    const response = await request(app).post('/updatePublished');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Published content updated');
  });

  it('should update subscription', async () => {
    const response = await request(app).post('/updateSubscription');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Subscription updated');
  });
});
