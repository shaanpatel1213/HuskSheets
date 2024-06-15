import {
  getUpdatesForSubscription,
  getUpdatesForPublished,
  updatePublished,
  updateSubscription
} from '../Utilities/utils';
import { parseAndEvaluateExpression } from '../Utilities';
import { TableData } from '../Utilities';

type DependencyGraphType = Map<string, Set<string>>;

class DependencyGraph {
  private graph: DependencyGraphType = new Map();

  /**
   * Adds a dependency for a cell.
   * @param {string} cell - The cell identifier.
   * @param {string} dependency - The dependency identifier.
   * 
   * @author BrandonPetersen
   */
  addDependency(cell: string, dependency: string) {
    if (!this.graph.has(cell)) {
      this.graph.set(cell, new Set());
    }
    this.graph.get(cell)!.add(dependency);
  }

  /**
   * Gets the dependencies of a cell.
   * @param {string} cell - The cell identifier.
   * @returns {Set<string>} The set of dependencies.
   * 
   * @author BrandonPetersen
   */
  getDependencies(cell: string): Set<string> {
    return this.graph.get(cell) || new Set();
  }

  /**
   * Detects if there is a cycle in the dependencies starting from the given cell.
   * @param {string} cell - The cell identifier.
   * @param {Set<string>} visited - The set of visited cells.
   * @returns {boolean} True if a cycle is detected, false otherwise.
   * 
   * @author BrandonPetersen
   */
  detectCycle(cell: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(cell)) return true;
    visited.add(cell);

    for (const dep of this.getDependencies(cell)) {
      if (this.detectCycle(dep, new Set(visited))) {
        return true;
      }
    }

    return false;
  }
}

export { DependencyGraph };

const getCellKey = (row: number, col: number): string => `${row}:${col}`;

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
 * Ownership: @author EmilyFink474 
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
    const newData = initialData.map(row => row.slice()); 

    result.value.forEach((update: { publisher: string; sheet: string; id: string; payload: string }) => { 
      update.payload.split('\n').forEach(line => { 
        if (line.trim()) { 
          if (line.match(/\$([A-Z]+)(\d+)\s(.+)/)) { 
            const { row, col, value } = parseUpdate(line); 
            while (newData.length <= row) { 
              newData.push(new Array(initialData[0].length).fill('')); 
            } 
            while (newData[row].length <= col) { 
              newData[row].push(''); 
            } 
            newData[row][col] = value; 
          } else { 
            console.error('Failed to fetch updates'); 
          } 
        } 
      }); 
    }); 
    setLiteralString(newData); 
    const dependencyGraph = new DependencyGraph(); 
    const evaluatedData = evaluateAllCells(newData, dependencyGraph); 
    setVisualData(evaluatedData); 
  } else { 
    console.error('Failed to fetch updates'); 
  } 
}; 

/**
 * Evaluates all cells in the provided data.
 * @param {TableData} data - The table data to evaluate.
 * @param {DependencyGraph} dependencyGraph - The dependency graph.
 * @returns {TableData} The evaluated table data.
 *
 * @author BrandonPetersen
 */
const evaluateAllCells = (data: TableData, dependencyGraph: DependencyGraph): TableData => {
  return data.map((row, rowIndex) =>
    row.map((cell, colIndex) => evaluateCell(cell, rowIndex, colIndex, data, dependencyGraph, new Set()))
  );
};

/**
 * Evaluates a single cell.
 * @param {string} cell - The cell value.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} colIndex - The column index of the cell.
 * @param {TableData} data - The table data.
 * @param {DependencyGraph} dependencyGraph - The dependency graph.
 * @param {Set<string>} visitedCells - The set of visited cells.
 * @param {TableData} evaluatedData - The evaluated table data.
 * @returns {string} The evaluated cell value.
 *
 * @author BrandonPetersen
 */
const evaluateCell = (
  cell: string,
  rowIndex: number,
  colIndex: number,
  data: TableData,
  dependencyGraph: DependencyGraph,
  visitedCells: Set<string>
): string => {
  const cellKey = getCellKey(rowIndex, colIndex);

  if (visitedCells.has(cellKey)) return 'ERROR: Circular reference detected';
  visitedCells.add(cellKey);

  if (!cell) return '';

  if (cell.startsWith('=')) {
    const formula = cell.slice(1).replace(/\$\s*/g, ''); // Remove $ signs
    const dependencies = getDependenciesFromFormula(formula);

    dependencies.forEach(dep => {
      const { row, col } = parseCellReference(dep);
      dependencyGraph.addDependency(cellKey, getCellKey(row, col));
    });

    if (dependencyGraph.detectCycle(cellKey)) return 'ERROR: Circular reference detected';

    let evaluatedFormula = formula;
    dependencies.forEach(dep => {
      const { row, col } = parseCellReference(dep);
      const depValue = evaluateCell(data[row]?.[col] || '', row, col, data, dependencyGraph, new Set(visitedCells));
      evaluatedFormula = evaluatedFormula.replace(dep, depValue);
    });

    const isFunction = formula.match(/^\s*[\w\$]+\s*\(.*\)\s*$/);
    if (isFunction) {
      return parseAndEvaluateExpression(formula, data);
    } else {
      return parseAndEvaluateExpression(evaluatedFormula, data);
    }
  }

  return cell || '';
};

/**
 * Parses a cell reference and returns the row and column indices.
 * @param {string} reference - The cell reference.
 * @returns {Object} The parsed cell reference with row and column indices.
 *
 * @author BrandonPetersen
 */
export const parseCellReference = (reference: string): { row: number, col: number } => {
  const match = reference.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error('Invalid cell reference');
  const [, colLetter, rowIndex] = match;
  const row = parseInt(rowIndex, 10) - 1;
  const col = colToIndex(colLetter);
  return { row, col };
};

/**
 * Extracts cell references from a formula.
 * @param {string} formula - The formula to extract references from.
 * @returns {Set<string>} The set of cell references.
 *
 * @author BrandonPetersen
 */
export const getDependenciesFromFormula = (formula: string): string[] => {
  const matches = formula.match(/\$?[A-Z]+\d+/g);
  return matches ? matches.map(ref => ref.replace('$', '')) : [];
};

/**
 * Adds updates to the provided updates ref object.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} colIndex - The column index of the cell.
 * @param {string} value - The value to be added.
 * @param {React.MutableRefObject<string>} updates - The updates ref object.
 * @param {Function} getColumnLetter - Function to get column letter from index.
 *
 * @author BrandonPetersen
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
 * Saves the updates to the server.
 * @param {boolean} isSubscriber - Indicates if the user is a subscriber.
 * @param {Object} sheet - The sheet object containing publisher and name.
 * @param {React.MutableRefObject<string>} updates - The updates ref object.
 * @param {number | null} sheetId - The current sheet ID.
 * @param {Function} setSheetId - Function to set the sheet ID.
 *
 * @author BrandonPetersen
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
 * Converts a column letter to an index.
 * @param {string} col - The column letter.
 * @returns {number} The column index.
 *
 * @author BrandonPetersen
 */
const colToIndex = (col: string): number => {
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
 * @author BrandonPetersen
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
 * @author BrandonPetersen
 */
export const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};

export { evaluateCell, evaluateAllCells, colToIndex };
