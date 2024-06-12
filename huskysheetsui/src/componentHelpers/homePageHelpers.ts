import { getPublishers, getSheets, createSheet, deleteSheet, register } from '../Utilities/utils';

/**
 * Checks if the current user is a registered publisher and fetches sheets.
 * @param {string} userName - The name of the user.
 * @param {Function} setIsRegistered - Function to update the registered state.
 * @param {Function} fetchSheets - Function to fetch sheets.
 * @param {Function} fetchOtherSheets - Function to fetch sheets from other publishers.
 * @param {Function} setError - Function to set error messages.
 * 
 * Ownership: @author BrandonPetersen
 */
export const checkPublisher = async (
  userName: string,
  setIsRegistered: (isRegistered: boolean) => void,
  fetchSheets: () => void,
  fetchOtherSheets: (userNames: string[]) => void,
  setError: (error: string) => void
) => {
  const result = await getPublishers();
  if (result && result.success) {
    const userNames = result.value.map((publisher: { publisher: string }) => publisher.publisher);
    if (userNames.includes(userName)) {
      setIsRegistered(true);
      fetchSheets();
      fetchOtherSheets(userNames.filter((name: string) => name !== userName));
    }
  } else {
    setError('Failed to fetch publishers');
  }
};

/**
 * Fetches sheets for the current user.
 * @param {string} userName - The name of the user.
 * @param {Function} setSheets - Function to update the sheets state.
 * @param {Function} setError - Function to set error messages.
 * 
 * Ownership: @author BrandonPetersen
 */
export const fetchSheets = async (
  userName: string,
  setSheets: (sheets: { id: string; name: string }[]) => void,
  setError: (error: string) => void
) => {
  const result = await getSheets(userName);
  if (result && result.success) {
    setSheets(result.value.map(sheet => ({ id: sheet.id, name: sheet.sheet })));
  } else {
    setError('Failed to fetch sheets');
  }
};

/**
 * Fetches sheets for other publishers.
 * @param {string[]} otherPublishers - List of other publishers.
 * @param {Function} setOtherSheets - Function to update the other sheets state.
 * 
 * Ownership: @author BrandonPetersen
 */
export const fetchOtherSheets = async (
  otherPublishers: string[],
  setOtherSheets: (otherSheets: { publisher: string; sheets: { id: string; name: string }[] }[]) => void
) => {
  const allSheets = await Promise.all(otherPublishers.map(async (publisher) => {
    const result = await getSheets(publisher);
    if (result && result.success) {
      return { publisher, sheets: result.value.map(sheet => ({ id: sheet.id, name: sheet.sheet })) };
    } else {
      return { publisher, sheets: [] };
    }
  }));
  setOtherSheets(allSheets);
};

/**
 * Handles the creation of a new sheet using the sheet name in the input bar
 * @param {string} userName - The name of the user.
 * @param {string} newSheetName - The name of the new sheet.
 * @param {Function} setNewSheetName - Function to update the new sheet name state.
 * @param {Function} setSheetCounter - Function to update the sheet counter state.
 * @param {Function} setError - Function to set error messages.
 * @param {Function} fetchSheets - Function to fetch sheets.
 * 
 * Ownership: @author BrandonPetersen
 */
export const handleCreateSheet = async (
  userName: string,
  newSheetName: string,
  setNewSheetName: (name: string) => void,
  sheetCounter: number,
  setSheetCounter: (counter: number) => void,
  setError: (error: string) => void,
  fetchSheets: () => void
) => {
  let sheetName = newSheetName.trim();
  if (!sheetName) {
    sheetName = `Sheet${sheetCounter}`;
    setSheetCounter(sheetCounter + 1);
  }
  console.log('Attempting to create sheet with name:', sheetName); // Log the sheet name
  const result = await createSheet(userName, sheetName);
  console.log('Create sheet result:', result); // Log the result
  if (result && result.success) {
    fetchSheets();
    setNewSheetName('');
  } else {
    setError('Failed to create sheet');
  }
};

/**
 * Handles the deletion of a sheet.
 * @param {string} userName - The name of the user.
 * @param {string} sheet - The name of the sheet to delete.
 * @param {Function} setSheets - Function to update the sheets state.
 * @param {Function} setError - Function to set error messages.
 * 
 * Ownership: @author BrandonPetersen
 */
export const handleDeleteSheet = async (
  userName: string,
  sheet: string,
  setSheets: (sheets: { id: string; name: string }[]) => void,
  sheets: { id: string; name: string }[],
  setError: (error: string) => void
) => {
  const sheetName = sheet;
  console.log('Attempting to delete sheet with name:', sheetName); // Log the sheet ID
  const result = await deleteSheet(userName, sheetName);
  console.log('Delete sheet result:', result); // Log the result
  if (result && result.success) {
    setSheets(sheets.filter(sheet => sheet.name !== sheetName)); // Update state immediately
  } else {
    setError('Failed to delete sheet');
  }
};

/**
 * Handles the registration of a new publisher.
 * @param {Function} setIsRegistered - Function to update the registered state.
 * @param {Function} setError - Function to set error messages.
 * @param {Function} fetchSheets - Function to fetch sheets.
 * @param {Function} fetchOtherSheets - Function to fetch sheets from other publishers.
 * 
 * Ownership: @author BrandonPetersen
 */
export const handleRegister = async (
  setIsRegistered: (isRegistered: boolean) => void,
  setError: (error: string) => void,
  fetchSheets: () => void,
  fetchOtherSheets: (userNames: string[]) => void
) => {
  const result = await register();
  if (result && result.success) {
    setIsRegistered(true);
    fetchSheets();
    fetchOtherSheets([]);
  } else {
    setError('Failed to register');
  }
};
