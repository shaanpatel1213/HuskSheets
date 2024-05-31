import axios from 'axios';

const API_URL = '/api/shubTest';

const getAuthHeader = (): { headers: { Authorization: string } } => {
  const auth = localStorage.getItem('auth');
  if (!auth) {
    throw new Error('User is not authenticated');
  }
  return {
    headers: {
      Authorization: 'Basic ' + auth
    }
  };
};

export const register = async (firstName: string, lastName: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/register`, { firstName, lastName, email, password });

  localStorage.setItem('auth', btoa(`${email}:${password}`));
  return response.data;
};

export const getPublishers = async () => {
  const response = await axios.get(`${API_URL}/getPublishers`, getAuthHeader());
  return response.data;
};

export const createSheet = async (publisher: string) => {
  const response = await axios.post(`${API_URL}/createSheet`, { publisher }, getAuthHeader());
  return response.data;
};

export const getSheets = async (publisher: string) => {
  const response = await axios.get(`${API_URL}/getSheets`, { params: { publisher }, ...getAuthHeader() });
  return response.data;
};

export const deleteSheet = async (publisher: string, sheetId: string) => {
  const response = await axios.delete(`${API_URL}/deleteSheet`, { data: { publisher, sheetId }, ...getAuthHeader() });
  return response.data;
};

export const getUpdatesForSubscription = async (publisher: string, sheetId: string, id: string) => {
  const response = await axios.get(`${API_URL}/getUpdatesForSubscription`, { params: { publisher, sheetId, id }, ...getAuthHeader() });
  return response.data;
};

export const getUpdatesForPublished = async (publisher: string, sheetId: string, id: string) => {
  const response = await axios.get(`${API_URL}/getUpdatesForPublished`, { params: { publisher, sheetId, id }, ...getAuthHeader() });
  return response.data;
};

export const updatePublished = async (publisher: string, sheetId: string, payload: string) => {
  const response = await axios.post(`${API_URL}/updatePublished`, { publisher, sheetId, payload }, getAuthHeader());
  return response.data;
};

export const updateSubscription = async (publisher: string, sheetId: string, payload: string) => {
  const response = await axios.post(`${API_URL}/updateSubscription`, { publisher, sheetId, payload }, getAuthHeader());
  return response.data;
};