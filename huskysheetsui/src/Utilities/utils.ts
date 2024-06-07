// src/Utils/utils.tsx
import axios, { AxiosError } from 'axios';

const API_URL = '/api/v1';

const username = 'team18';
const password = 'qdKoHqmiP@6x`_1Q';

// const username = 'user1';
// const password = 'password1';

const auth = btoa(`${username}:${password}`);

const getAuthHeader = () => {
  console.log('Encoded auth string:', auth); // Log the encoded auth string
  return {
    headers: {
      Authorization: `Basic ${auth}`
    }
  };
};

interface Argument {
  publisher: string;
  sheet: string;
  id: string;
  payload: string;
}

interface Result {
  success: boolean;
  message: string | null;
  value: Argument[];
  time: number;
}

const isAxiosError = (error: any): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined;
};

// Register with the server
export const register = async (): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for register:', headers); // Log the headers
    const response = await axios.get<Result>(`${API_URL}/register`, headers);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Register error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

export const getPublishers = async (): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for getPublishers:', headers); // Log the headers
    const response = await axios.get<Result>(`${API_URL}/getPublishers`, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Get publishers error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Create a new sheet
export const createSheet = async (publisher: string, sheet: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    const payload = { publisher, sheet };
    console.log('Creating sheet with payload:', payload); // Log the payload
    console.log('Headers:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/createSheet`, payload, headers);
    console.log('Create sheet response:', response.data); // Log the response
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Create sheet error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Get sheets for a publisher
export const getSheets = async (publisher: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for getSheets:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/getSheets`, { publisher }, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Get sheets error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Delete a sheet
export const deleteSheet = async (publisher: string, sheet: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for deleteSheet:', headers); // Log the headers
    const payload = { publisher, sheet };
    console.log('Deleting sheet with payload:', payload); // Log the payload
    const response = await axios.post<Result>(`${API_URL}/deleteSheet`, payload, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Delete sheet error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Get updates for a subscription
export const getUpdatesForSubscription = async (publisher: string, sheet: string, id: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for getUpdatesForSubscription:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/getUpdatesForSubscription`, { publisher, sheet, id }, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Get updates for subscription error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Get updates for published sheets
export const getUpdatesForPublished = async (publisher: string, sheet: string, id: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for getUpdatesForPublished:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/getUpdatesForPublished`, { publisher, sheet, id }, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Get updates for published error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Update a published sheet
export const updatePublished = async (publisher: string, sheet: string, payload: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for updatePublished:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/updatePublished`, { publisher, sheet, payload }, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Update published sheet error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Update a subscription
export const updateSubscription = async (publisher: string, sheet: string, payload: string): Promise<Result | null> => {
  try {
    const headers = getAuthHeader();
    console.log('Request headers for updateSubscription:', headers); // Log the headers
    const response = await axios.post<Result>(`${API_URL}/updateSubscription`, { publisher, sheet, payload }, headers);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Update subscription error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};
