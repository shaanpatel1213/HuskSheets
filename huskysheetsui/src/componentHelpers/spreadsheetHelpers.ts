import {
  getUpdatesForSubscription,
  getUpdatesForPublished,
  updatePublished,
  updateSubscription
} from '../Utilities/utils';
import { parseAndEvaluateExpression } from '../Utilities/CellFunctionalities';
import { TableData } from '../Utilities/CellFunctionalities';

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
    const newData = initialData.map(row => row.slice());
    
    result.value.forEach((update: { publisher: string; sheet: string; id: string; payload: string }) => {
      update.payload.split('\n').forEach(line => {
        if (line.trim()) {
          const { row, col, value } = parseUpdate(line);
          while (newData.length <= row) {
            newData.push(new Array(initialData[0].length).fill(''));
          }
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

export const evaluateAllCells = (data: TableData): TableData => {
  return data.map(row =>
    row.map(cell => evaluateCell(cell, data))
  );
};

const evaluateCellRecursive = (cell: string, data: TableData, visited: Set<string>): string => {
  if (visited.has(cell)) return 'ERROR: Circular reference detected';


  if (cell.startsWith('=')) {
    const formula = cell.slice(1);
    const tokens = tokenizeFormula(formula);

    let evaluatedTokens = tokens.map(token => {
      if (token.match(/^\$?[A-Za-z]+\d+$/)) {
        const { row, col } = parseCellReference(token);
        if (row >= data.length || col >= data[row].length) {
          return 'ERROR: Reference out of bounds';
        }
        const evaluatedToken = evaluateCellRecursive(data[row][col], data, visited);
        return evaluatedToken.startsWith('ERROR') ? evaluatedToken : evaluatedToken;
      }
      return token;
    });

    const evaluatedFormula = evaluatedTokens.join('');
    console.log('Evaluated Formula:', evaluatedFormula);

    const evaluatedValue = parseAndEvaluateExpression(evaluatedFormula, data);
    return evaluatedValue.startsWith('ERROR') ? evaluatedValue : evaluatedValue;
  }
  return cell || '';
};

const tokenizeFormula = (formula: string): string[] => {
  const regex = /(\$?[A-Za-z]+\d+|\d+|\+|\-|\*|\/|\(|\))/g;
  return formula.match(regex) || [];
};

export const evaluateCell = (cell: string, data: TableData): string => {
  const result = evaluateCellRecursive(cell, data, new Set());
  return result.startsWith('ERROR') ? cell : result;
};

const parseCellReference = (reference: string): { row: number, col: number } => {
  const match = reference.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error('Invalid cell reference');
  const [, colLetter, rowIndex] = match;
  const row = parseInt(rowIndex, 10) - 1;
  const col = colToIndex(colLetter);
  return { row, col };
};

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

export const parseUpdate = (update: string) => {
  const match = update.match(/\$([A-Z]+)(\d+)\s(.+)/);
  if (!match) throw new Error('Invalid update format');
  const [, colLetter, rowIndex, value] = match;
  const row = parseInt(rowIndex, 10) - 1;
  const col = colToIndex(colLetter);
  return { row, col, value };
};

export const colToIndex = (col: string): number => {
  col = col.replace('$', '');
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

export const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};
