// src/Utils/utils.ts
import axios, { AxiosError } from 'axios';

// const API_URL = 'http://localhost:3002/api/shubTest';
const API_URL = 'https://husksheets.fly.dev/api/v1';


const username = 'team18';
const password = 'qdKoHqmiP@6x`_1Q';

// const username = 'user1';
// const password = 'password1';

const auth = btoa(`${username}:${password}`);

/**
 * Generates the authentication header for API requests.
 * @returns {Object} The authentication header.
 *
 * Ownership: @author BrandonPetersen
 */
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


/**
 * Checks if the given error is an AxiosError.
 * @param {any} error - The error to check.
 * @returns {boolean} True if the error is an AxiosError, false otherwise.
 *
 * Ownership: @author BrandonPetersen
 */
const isAxiosError = (error: any): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined;
};

/**
 * Registers a new publisher with the server.
 * @returns {Promise<Result | null>} The result of the registration.
 *
 * Ownership: @author BrandonPetersen
 */
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


/**
 * Retrieves the list of registered publishers.
 * @returns {Promise<Result | null>} The list of publishers.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Creates a new sheet for the given publisher.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet to create.
 * @returns {Promise<Result | null>} The result of the sheet creation.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Retrieves the list of sheets for the given publisher.
 * @param {string} publisher - The name of the publisher.
 * @returns {Promise<Result | null>} The list of sheets.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Deletes a sheet for the given publisher.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet to delete.
 * @returns {Promise<Result | null>} The result of the sheet deletion.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Retrieves updates for a subscription.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The ID of the last known update.
 * @returns {Promise<Result | null>} The updates for the subscription.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Retrieves updates for published sheets.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The ID of the last known update.
 * @returns {Promise<Result | null>} The updates for the published sheets.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Updates a published sheet.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The update payload.
 * @returns {Promise<Result | null>} The result of the update.
 *
 * Ownership: @author BrandonPetersen
 */
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

/**
 * Updates a subscription.
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The update payload.
 * @returns {Promise<Result | null>} The result of the update.
 *
 * Ownership: @author BrandonPetersen
 */
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
