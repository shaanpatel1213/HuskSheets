// src/__tests__/utils.test.ts

const API_URL = 'https://husksheets.fly.dev/api/v1';
const username1 = 'team18';
const password1 = 'qdKoHqmiP@6x`_1Q';
const auth1 = btoa(`${username1}:${password1}`);

import axios, { AxiosError } from 'axios';
import { 
  getAuthHeader, register, getPublishers, createSheet, getSheets, 
  deleteSheet, getUpdatesForSubscription, getUpdatesForPublished, 
  updatePublished, updateSubscription 
} from '../Utilities/utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Utils', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    global.sessionStorage = {
      getItem: jest.fn(() => 'mockedAuth'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    } as unknown as Storage;
    sessionStorage.setItem('auth', auth1);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  const mockHeaders = {
    headers: {
      Authorization: `Basic ${auth1}`
    }
  };

  const createAxiosError = (message: string): AxiosError => {
    return {
      isAxiosError: true,
      toJSON: () => ({}),
      name: 'AxiosError',
      message,
      config: {},
      response: {
        data: 'Error data',
        status: 500,
        statusText: 'Server Error',
        headers: {},
        config: {}
      },
      code: '500',
      request: {}
    } as AxiosError;
  };

  describe('getAuthHeader', () => {
    it('should return correct auth headers', () => {
      const result = getAuthHeader();
      expect(result).toEqual(mockHeaders);
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

    it('should return null on register axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      const result = await register();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Register error:', axiosError.message);
    });

    it('should return null on register unexpected error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on getPublishers axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      const result = await getPublishers();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Get publishers error:', axiosError.message);
    });

    it('should return null on getPublishers unexpected error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on createSheet axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await createSheet('test', 'sheet1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Create sheet error:', axiosError.message);
    });

    it('should return null on createSheet unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on getSheets axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await getSheets('test');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Get sheets error:', axiosError.message);
    });

    it('should return null on getSheets unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on deleteSheet axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await deleteSheet('test', 'sheet1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Delete sheet error:', axiosError.message);
    });

    it('should return null on deleteSheet unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on getUpdatesForSubscription axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await getUpdatesForSubscription('test', 'sheet1', '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Get updates for subscription error:', axiosError.message);
    });

    it('should return null on getUpdatesForSubscription unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on getUpdatesForPublished axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await getUpdatesForPublished('test', 'sheet1', '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Get updates for published error:', axiosError.message);
    });

    it('should return null on getUpdatesForPublished unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on updatePublished axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await updatePublished('test', 'sheet1', 'update');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Update published sheet error:', axiosError.message);
    });

    it('should return null on updatePublished unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

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

    it('should return null on updateSubscription axios error', async () => {
      const axiosError = createAxiosError('Network Error');
      mockedAxios.post.mockRejectedValueOnce(axiosError);

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Update subscription error:', axiosError.message);
    });

    it('should return null on updateSubscription unexpected error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

      const result = await updateSubscription('test', 'sheet1', 'update');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
    });
  });
});
