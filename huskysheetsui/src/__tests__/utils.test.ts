
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { register, getPublishers, createSheet, getSheets, deleteSheet, getUpdatesForSubscription, getUpdatesForPublished, updatePublished, updateSubscription } from '../Utilities/utils';

const mock = new MockAdapter(axios);
const API_URL = 'https://husksheets.fly.dev/api/v1';
const headers = { Authorization: `Basic : ${btoa('team18:qdKoHqmiP@6x`_1Q')}` };

describe('utils', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('register', () => {
    it('should register a new publisher', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onGet(`${API_URL}/register`).reply(200, response, headers);

      const result = await register();
      expect(result).toEqual(response);
    });

    it('should handle register error', async () => {
      mock.onGet(`${API_URL}/register`).reply(500);

      const result = await register();
      expect(result).toBeNull();
    });
  });

  describe('getPublishers', () => {
    it('should retrieve the list of publishers', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onGet(`${API_URL}/getPublishers`).reply(200, response, headers);

      const result = await getPublishers();
      expect(result).toEqual(response);
    });

    it('should handle getPublishers error', async () => {
      mock.onGet(`${API_URL}/getPublishers`).reply(500);

      const result = await getPublishers();
      expect(result).toBeNull();
    });
  });

  describe('createSheet', () => {
    it('should create a new sheet', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/createSheet`, { publisher: 'test', sheet: 'sheet1' }).reply(200, response, headers);

      const result = await createSheet('test', 'sheet1');
      expect(result).toEqual(response);
    });

    it('should handle createSheet error', async () => {
      mock.onPost(`${API_URL}/createSheet`, { publisher: 'test', sheet: 'sheet1' }).reply(500);

      const result = await createSheet('test', 'sheet1');
      expect(result).toBeNull();
    });
  });

  describe('getSheets', () => {
    it('should retrieve the list of sheets for a publisher', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/getSheets`, { publisher: 'test' }).reply(200, response, headers);

      const result = await getSheets('test');
      expect(result).toEqual(response);
    });

    it('should handle getSheets error', async () => {
      mock.onPost(`${API_URL}/getSheets`, { publisher: 'test' }).reply(500);

      const result = await getSheets('test');
      expect(result).toBeNull();
    });
  });

  describe('deleteSheet', () => {
    it('should delete a sheet', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/deleteSheet`, { publisher: 'test', sheet: 'sheet1' }).reply(200, response, headers);

      const result = await deleteSheet('test', 'sheet1');
      expect(result).toEqual(response);
    });

    it('should handle deleteSheet error', async () => {
      mock.onPost(`${API_URL}/deleteSheet`, { publisher: 'test', sheet: 'sheet1' }).reply(500);

      const result = await deleteSheet('test', 'sheet1');
      expect(result).toBeNull();
    });
  });

  describe('getUpdatesForSubscription', () => {
    it('should retrieve updates for a subscription', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/getUpdatesForSubscription`, { publisher: 'test', sheet: 'sheet1', id: '0' }).reply(200, response, headers);

      const result = await getUpdatesForSubscription('test', 'sheet1', '0');
      expect(result).toEqual(response);
    });

    it('should handle getUpdatesForSubscription error', async () => {
      mock.onPost(`${API_URL}/getUpdatesForSubscription`, { publisher: 'test', sheet: 'sheet1', id: '0' }).reply(500);

      const result = await getUpdatesForSubscription('test', 'sheet1', '0');
      expect(result).toBeNull();
    });
  });

  describe('getUpdatesForPublished', () => {
    it('should retrieve updates for published sheets', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/getUpdatesForPublished`, { publisher: 'test', sheet: 'sheet1', id: '0' }).reply(200, response, headers);

      const result = await getUpdatesForPublished('test', 'sheet1', '0');
      expect(result).toEqual(response);
    });

    it('should handle getUpdatesForPublished error', async () => {
      mock.onPost(`${API_URL}/getUpdatesForPublished`, { publisher: 'test', sheet: 'sheet1', id: '0' }).reply(500);

      const result = await getUpdatesForPublished('test', 'sheet1', '0');
      expect(result).toBeNull();
    });
  });

  describe('updatePublished', () => {
    it('should update a published sheet', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/updatePublished`, { publisher: 'test', sheet: 'sheet1', payload: 'update' }).reply(200, response, headers);

      const result = await updatePublished('test', 'sheet1', 'update');
      expect(result).toEqual(response);
    });

    it('should handle updatePublished error', async () => {
      mock.onPost(`${API_URL}/updatePublished`, { publisher: 'test', sheet: 'sheet1', payload: 'update' }).reply(500);

      const result = await updatePublished('test', 'sheet1', 'update');
      expect(result).toBeNull();
    });
  });

  describe('updateSubscription', () => {
    it('should update a subscription', async () => {
      const response = { success: true, message: null, value: [], time: 0 };
      mock.onPost(`${API_URL}/updateSubscription`, { publisher: 'test', sheet: 'sheet1', payload: 'update' }).reply(200, response, headers);

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toEqual(response);
    });

    it('should handle updateSubscription error', async () => {
      mock.onPost(`${API_URL}/updateSubscription`, { publisher: 'test', sheet: 'sheet1', payload: 'update' }).reply(500);

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toBeNull();
    });
  });
});
