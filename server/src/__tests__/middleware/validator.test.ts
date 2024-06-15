import assert from 'assert';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { validatePublisher, validateSheet, validateUpdate } from '../../middleware/validators';



/**
 *
 * @author Shaanpatel1213*/
const app = express();
app.use(express.json());

// Sample routes to use the middleware
app.post('/publisher', validatePublisher, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Publisher validated' });
});

app.post('/sheet', validateSheet, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Sheet validated' });
});

app.post('/update', validateUpdate, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Update validated' });
});

describe('Validators Middleware', () => {
  describe('validatePublisher', () => {
    it('should return 400 if publisher is missing', (done) => {
      request(app)
        .post('/publisher')
        .send({ })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Publisher is required');
          done();
        });
    });

    it('should pass if publisher is present', (done) => {
      request(app)
        .post('/publisher')
        .send({ publisher: 'Test Publisher' })
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Publisher validated');
          done();
        });
    });
  });

  describe('validateSheet', () => {
    it('should return 400 if publisher or sheet is missing', (done) => {
      request(app)
        .post('/sheet')
        .send({ publisher: 'Test Publisher' })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Publisher and sheet are required');
          done();
        });
    });

    it('should pass if publisher and sheet are present', (done) => {
      request(app)
        .post('/sheet')
        .send({ publisher: 'Test Publisher', sheet: 'Test Sheet' })
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Sheet validated');
          done();
        });
    });
  });

  describe('validateUpdate', () => {
    it('should return 400 if publisher, sheet, or id is missing', (done) => {
      request(app)
        .post('/update')
        .send({ publisher: 'Test Publisher', sheet: 'Test Sheet' })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Publisher, sheet, and id are required');
          done();
        });
    });

    it('should pass if publisher, sheet, and id are present', (done) => {
      request(app)
        .post('/update')
        .send({ publisher: 'Test Publisher', sheet: 'Test Sheet', id: '123' })
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.message, 'Update validated');
          done();
        });
    });
  });
});
