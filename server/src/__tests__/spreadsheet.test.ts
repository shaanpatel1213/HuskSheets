import request from 'supertest';
import app from '../app';  
import { AppDataSource } from '../data-source';
import { Publisher } from '../entity/Publisher';
import { Spreadsheet } from '../entity/Spreadsheet';
import { Update } from '../entity/Update';

jest.setTimeout(15000)
beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe('Spreadsheet API', () => {
  let publisherId: number;
  let spreadsheetName = 'Test Spreadsheet';

  it('should register a new publisher', async () => {
    const response = await request(app).post('/api/shubTest/register').send({
      username: 'john_doe',
      password: 'password123'
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Publisher registered');
    const publisher = await AppDataSource.manager.findOneBy(Publisher, { username: 'john_doe' });
    expect(publisher).toBeDefined();
    if (publisher) {
      publisherId = publisher.id;
    }
  });

  it('should create a new spreadsheet', async () => {
    const response = await request(app).post('/api/shubTest/createSheet').send({
      publisher: 'john_doe',
      name: spreadsheetName
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: spreadsheetName, publisher: { id: publisherId } });
    expect(spreadsheet).toBeDefined();
  });

  it('should get spreadsheets for a publisher', async () => {
    const response = await request(app).get('/api/shubTest/getSheets').query({
      publisher: 'john_doe'
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.value.length).toBeGreaterThan(0);
    
  });

  it('should update a spreadsheet', async () => {
    const payload = '$A1 1\n$B2 2\n$C3 =SUM($A1:$B2)';
    const response = await request(app).post('/api/shubTest/updatePublished').send({
      publisher: 'john_doe',
      sheetName: spreadsheetName,
      payload
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Using QueryBuilder to fetch updates
    const updates = await AppDataSource.manager.createQueryBuilder(Update, 'update')
      .innerJoinAndSelect('update.spreadsheet', 'spreadsheet')
      .innerJoinAndSelect('spreadsheet.publisher', 'publisher')
      .where('spreadsheet.name = :name', { name: spreadsheetName })
      .andWhere('publisher.id = :publisherId', { publisherId })
      .getMany();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0].payload).toBe(payload);
  });

  it('should delete a spreadsheet', async () => {
    const response = await request(app).delete('/api/shubTest/deleteSheet').send({
      publisher: 'john_doe',
      sheetName: spreadsheetName
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  
    // Verify deletion
    const spreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
      where: {
        name: spreadsheetName,
        publisher: { id: publisherId }
      },
      relations: ['publisher']
    });
  
    expect(spreadsheet).toBeNull();
  }, 10000); // Extend timeout for this test suite
  
  
  
});
