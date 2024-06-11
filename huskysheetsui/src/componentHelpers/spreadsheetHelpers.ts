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
      const newData = initialData.map(row => [...row]);
      result.value.forEach((update: { publisher: string; sheet: string; id: string; payload: string }) => {
        update.payload.split('\n').forEach(line => {
          if (line.trim()) {
            const { row, col, value } = parseUpdate(line);
            newData[row][col] = value;
          }
        });
      });
      setLiteralString(newData);
      setVisualData(newData);
    } else {
      console.error('Failed to fetch updates');
    }
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
  
  export const evaluateCell = (cell: string, data: TableData) => {
    while (cell.startsWith('=')) {
      const formula = cell.slice(1);
      cell = parseAndEvaluateExpression(formula, data);
    }
    return cell;
  };
  
  export const colToIndex = (col: string): number => {
    col = col.replace('$', '');
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };
  
  export const parseUpdate = (update: string) => {
    const match = update.match(/\$([A-Z]+)(\d+)\s(.+)/);
    if (!match) throw new Error('Invalid update format');
    const [, colLetter, rowIndex, value] = match;
    const row = parseInt(rowIndex, 10) - 1;
    const col = colToIndex(colLetter);
    return { row, col, value };
  };
  
  export const getColumnLetter = (colIndex: number): string => {
    let letter = '';
    while (colIndex >= 0) {
      letter = String.fromCharCode((colIndex % 26) + 65) + letter;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
  };
  