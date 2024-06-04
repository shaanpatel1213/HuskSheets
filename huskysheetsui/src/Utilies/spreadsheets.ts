// src/Utils/utils.tsx
import axios from 'axios';

const API_URL = 'https://husksheets.fly.dev/api/v1';

const getAuthHeader = () => {
  const auth = btoa('team18:qdKoHqmiP@6x`_1Q');
  return {
    headers: {
      Authorization: `Basic ${auth}`
    }
  };
};

export const register = async () => {
  try {
    const response = await axios.get(`${API_URL}/register`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getPublishers = async () => {
  try {
    const response = await axios.get(`${API_URL}/getPublishers`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createSheet = async (publisher: string, sheet: string) => {
  try {
    const response = await axios.post(`${API_URL}/createSheet`, { publisher, sheet }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getSheets = async (publisher: string) => {
  try {
    const response = await axios.post(`${API_URL}/getSheets`, { publisher }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteSheet = async (publisher: string, sheet: string) => {
  try {
    const response = await axios.post(`${API_URL}/deleteSheet`, { publisher, sheet }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Get updates for a subscription
export const getUpdatesForSubscription = async (publisher: string, sheet: string, id: string) => {
  try {
    const response = await axios.post(`${API_URL}/getUpdatesForSubscription`, { publisher, sheet, id }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUpdatesForPublished = async (publisher: string, sheet: string, id: string) => {
  try {
    const response = await axios.post(`${API_URL}/getUpdatesForPublished`, { publisher, sheet, id }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updatePublished = async (publisher: string, sheet: string, payload: string) => {
  try {
    const response = await axios.post(`${API_URL}/updatePublished`, { publisher, sheet, payload }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateSubscription = async (publisher: string, sheet: string, payload: string) => {
  try {
    const response = await axios.post(`${API_URL}/updateSubscription`, { publisher, sheet, payload }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
