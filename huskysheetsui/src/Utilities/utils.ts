// src/Utils/utils.tsx
import axios from 'axios';

const API_URL = 'https://husksheets.fly.dev/api/v1';
var username = 'team18';
var password = 'qdKoHqmiP@6x`_1Q';
var credentials = btoa(username + ':' + password);
var basicAuth = 'Basic ' + credentials;

const getAuthHeader = () => {
  return {
    auth: {
      username: 'team18',
      password: 'qdKoHqmiP@6x`_1Q'
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

// Register with the server
export const register = async (): Promise<Result | null> => {
  try {
    const response = await axios.get<Result>(`${API_URL}/register`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get all publishers
export const getPublishers = async (): Promise<Result | null> => {
  try {
    const response = await axios.get<Result>(`${API_URL}/getPublishers`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Create a new sheet
export const createSheet = async (publisher: string, sheet: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/createSheet`, { publisher, sheet }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get sheets for a publisher
export const getSheets = async (publisher: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/getSheets`, { publisher }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Delete a sheet
export const deleteSheet = async (publisher: string, sheet: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/deleteSheet`, { publisher, sheet }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get updates for a subscription
export const getUpdatesForSubscription = async (publisher: string, sheet: string, id: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/getUpdatesForSubscription`, { publisher, sheet, id }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get updates for published sheets
export const getUpdatesForPublished = async (publisher: string, sheet: string, id: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/getUpdatesForPublished`, { publisher, sheet, id }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Update a published sheet
export const updatePublished = async (publisher: string, sheet: string, payload: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/updatePublished`, { publisher, sheet, payload }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Update a subscription
export const updateSubscription = async (publisher: string, sheet: string, payload: string): Promise<Result | null> => {
  try {
    const response = await axios.post<Result>(`${API_URL}/updateSubscription`, { publisher, sheet, payload }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
