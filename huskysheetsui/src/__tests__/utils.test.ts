// src/__tests__/utils.test.ts

const API_URL = 'https://husksheets.fly.dev/api/v1';
const username1 = 'team18';
const password1 = 'qdKoHqmiP@6x`_1Q';
const auth1 =  btoa(`${username1}:${password1}`);

// src/__tests__/utils.test.ts
import axios from 'axios';
import { 
  getAuthHeader, register, getPublishers, createSheet, getSheets, 
  deleteSheet, getUpdatesForSubscription, getUpdatesForPublished, 
  updatePublished, updateSubscription 
} from '../Utilities/utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Utils', () => {
  beforeEach(() => {
    global.sessionStorage = {
      getItem: jest.fn(() => 'mockedAuth'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    sessionStorage.setItem('auth', auth1);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockHeaders = {
    headers: {
      Authorization: `Basic ${auth1}`
    }
  };

  describe('getAuthHeader', () => {
    it('should return correct auth headers', () => {
      const result = getAuthHeader();
      expect(result).toEqual(mockHeaders);
      expect(sessionStorage.getItem).toHaveBeenCalledWith('auth');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: responseData });

      const result = await register();
      expect(result).toEqual(responseData);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/register`, mockHeaders);
    });

    it('should return null on register error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await register();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('getPublishers', () => {
    it('should get publishers successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: responseData });

      const result = await getPublishers();
      expect(result).toEqual(responseData);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/getPublishers`, mockHeaders);
    });

    it('should return null on getPublishers error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await getPublishers();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('createSheet', () => {
    it('should create sheet successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await createSheet('test', 'sheet1');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/createSheet`, payload, mockHeaders);
    });

    it('should return null on createSheet error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await createSheet('test', 'sheet1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('getSheets', () => {
    it('should get sheets successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await getSheets('test');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/getSheets`, payload, mockHeaders);
    });

    it('should return null on getSheets error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await getSheets('test');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('deleteSheet', () => {
    it('should delete sheet successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await deleteSheet('test', 'sheet1');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/deleteSheet`, payload, mockHeaders);
    });

    it('should return null on deleteSheet error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await deleteSheet('test', 'sheet1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('getUpdatesForSubscription', () => {
    it('should get updates for subscription successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1', id: '1' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await getUpdatesForSubscription('test', 'sheet1', '1');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/getUpdatesForSubscription`, payload, mockHeaders);
    });

    it('should return null on getUpdatesForSubscription error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await getUpdatesForSubscription('test', 'sheet1', '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('getUpdatesForPublished', () => {
    it('should get updates for published successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1', id: '1' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await getUpdatesForPublished('test', 'sheet1', '1');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/getUpdatesForPublished`, payload, mockHeaders);
    });

    it('should return null on getUpdatesForPublished error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await getUpdatesForPublished('test', 'sheet1', '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('updatePublished', () => {
    it('should update published successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1', payload: 'update' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await updatePublished('test', 'sheet1', 'update');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/updatePublished`, payload, mockHeaders);
    });

    it('should return null on updatePublished error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await updatePublished('test', 'sheet1', 'update');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const responseData = { success: true, message: null, value: [], time: 0 };
      const payload = { publisher: 'test', sheet: 'sheet1', payload: 'update' };
      mockedAxios.post.mockResolvedValueOnce({ data: responseData });

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/updateSubscription`, payload, mockHeaders);
    });

    it('should return null on updateSubscription error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });
});
