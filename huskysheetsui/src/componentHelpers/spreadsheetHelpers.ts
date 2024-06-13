import {
  getUpdatesForSubscription,
  getUpdatesForPublished,
  updatePublished,
  updateSubscription
} from '../Utilities/utils';
import { parseAndEvaluateExpression } from '../Utilities/CellFunctionalities';
import { TableData } from '../Utilities/CellFunctionalities';

/**
 * Fetches updates from the server for the current sheet.
 * @param {Object} sheet - The sheet object containing publisher and name.
 * @param {number | null} sheetId - The current sheet ID.
 * @param {boolean} isSubscriber - Indicates if the user is a subscriber.
 * @param {TableData} initialData - The initial table data.
 * @param {Function} setLiteralString - Function to set literal string data.
 * @param {Function} setVisualData - Function to set visual data.
 * @param {Function} parseUpdate - Function to parse update strings.
 * @returns {Promise<void>}
 *
 * Ownership: @author BrandonPetersen
 */
export const fetchUpdates = async (
  sheet: { publisher: string, name: string },
  sheetId: number | null,
  isSubscriber: boolean,
  initialData: TableData,
  setLiteralString: (data: TableData) => void,
  setVisualData: (data: TableData) => void,
  parseUpdate: (update: string) => { row: number, col: number, value: string }
) => {
  const result = isSubscriber
    ? await getUpdatesForSubscription(sheet.publisher, sheet.name, sheetId ? sheetId.toString() : '0')
    : await getUpdatesForSubscription(sheet.publisher, sheet.name, sheetId ? sheetId.toString() : '0');
  
  if (result && result.success) {
    // Create a new data structure with the same dimensions as initialData
    const newData = initialData.map(row => row.slice());
    
    result.value.forEach((update: { publisher: string; sheet: string; id: string; payload: string }) => {
      update.payload.split('\n').forEach(line => {
        if (line.trim()) {
          const { row, col, value } = parseUpdate(line);
          // Ensure the row exists in newData before accessing it
          while (newData.length <= row) {
            newData.push(new Array(initialData[0].length).fill(''));
          }
          // Ensure the column exists in newData before accessing it
          while (newData[row].length <= col) {
            newData[row].push('');
          }
          newData[row][col] = value;
        }
      });
    });
    setLiteralString(newData);
    const evaluatedData = evaluateAllCells(newData);
    setVisualData(evaluatedData);
  } else {
    console.error('Failed to fetch updates');
  }
};

/**
 * Evaluates all cells in the provided data.
 * @param {TableData} data - The table data to evaluate.
 * @returns {TableData} The evaluated table data.
 *
 * Ownership: @author BrandonPetersen
 */
export const evaluateAllCells = (data: TableData): TableData => {
  return data.map((row, rowIndex) =>
    row.map((cell, colIndex) => evaluateCell(cell, data))
  );
};

/**
 * Adds updates to the updates reference.
 * @param {number} rowIndex - The row index.
 * @param {number} colIndex - The column index.
 * @param {string} value - The cell value.
 * @param {React.MutableRefObject<string>} updates - The updates reference.
 * @param {Function} getColumnLetter - Function to get the column letter.
 *
 * Ownership: @author BrandonPetersen
 */
export const addUpdates = (
  rowIndex: number,
  colIndex: number,
  value: string,
  updates: React.MutableRefObject<string>,
  getColumnLetter: (colIndex: number) => string
) => {
  if (value !== '') {
    updates.current = updates.current + "$" + getColumnLetter(colIndex) + (rowIndex + 1) + " " + value + "\n";
  }
};

/**
 * Saves updates to the server.
 * @param {boolean} isSubscriber - Indicates if the user is a subscriber.
 * @param {Object} sheet - The sheet object containing publisher and name.
 * @param {React.MutableRefObject<string>} updates - The updates reference.
 * @param {number | null} sheetId - The current sheet ID.
 * @param {Function} setSheetId - Function to set the sheet ID.
 * @returns {Promise<void>}
 *
 * Ownership: @author BrandonPetersen
 */
export const saveUpdates = async (
  isSubscriber: boolean,
  sheet: { publisher: string, name: string },
  updates: React.MutableRefObject<string>,
  sheetId: number | null,
  setSheetId: (id: number | null) => void
) => {
  let allUpdates = updates.current.substring(0, updates.current.length);
  const result = isSubscriber
    ? await updateSubscription(sheet.publisher, sheet.name, allUpdates)
    : await updatePublished(sheet.publisher, sheet.name, allUpdates);
  
  if (result && result.success) {
    setSheetId(sheetId === null ? 1 : sheetId + 1);
    updates.current = "";
  } else {
    console.error('Failed to save updates');
  }
};

/**
 * Evaluates a cell value.
 * @param {string} cell - The cell value.
 * @param {TableData} data - The table data.
 * @returns {string} The evaluated cell value.
 *
 * Ownership: @author BrandonPetersen
 */
export const evaluateCell = (cell: string, data: TableData): string => {
  while (cell && cell.startsWith('=')) {
    const formula = cell.slice(1);
    cell = parseAndEvaluateExpression(formula, data);
  }
  return cell || '';
};


/**
 * Converts a column letter to an index.
 * @param {string} col - The column letter.
 * @returns {number} The column index.
 *
 * Ownership: @author BrandonPetersen
 */
export const colToIndex = (col: string): number => {
  col = col.replace('$', '');
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

/**
 * Parses an update string and returns the row, column, and value.
 * @param {string} update - The update string.
 * @returns {Object} The parsed update with row, column, and value.
 *
 * Ownership: @author BrandonPetersen
 */
export const parseUpdate = (update: string) => {
  const match = update.match(/\$([A-Z]+)(\d+)\s(.+)/);
  if (!match) throw new Error('Invalid update format');
  const [, colLetter, rowIndex, value] = match;
  const row = parseInt(rowIndex, 10) - 1;
  const col = colToIndex(colLetter);
  return { row, col, value };
};

/**
 * Converts a column index to a letter.
 * @param {number} colIndex - The column index.
 * @returns {string} The column letter.
 *
 * Ownership: @author BrandonPetersen
 */
export const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};
