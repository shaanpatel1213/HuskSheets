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

  addDependency(cell: string, dependency: string) {
    if (!this.graph.has(cell)) {
      this.graph.set(cell, new Set());
    }
    this.graph.get(cell)!.add(dependency);
  }

  getDependencies(cell: string): Set<string> {
    return this.graph.get(cell) || new Set();
  }

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
 * Ownership: BrandonPetersen
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
    : await getUpdatesForPublished(sheet.publisher, sheet.name, sheetId ? sheetId.toString() : '0');
  
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
 * Ownership: BrandonPetersen
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
 * Ownership: BrandonPetersen
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
      const depValue = evaluateCell(data[row][col], row, col, data, dependencyGraph, new Set(visitedCells));
      evaluatedFormula = evaluatedFormula.replace(dep, depValue);
    });

    return parseAndEvaluateExpression(evaluatedFormula, data);
  }
  return cell || '';
};


const parseCellReference = (reference: string): { row: number, col: number } => {
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
 */
const getDependenciesFromFormula = (formula: string): string[] => {
  const matches = formula.match(/\$?[A-Z]+\d+/g);
  return matches ? matches.map(ref => ref.replace('$', '')) : [];
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

/**
 * Converts a column letter to an index.
 * @param {string} col - The column letter.
 * @returns {number} The column index.
 *
 * Ownership: BrandonPetersen
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
 * Ownership: BrandonPetersen
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
 * Ownership: BrandonPetersen
 */
export const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};


export {evaluateCell, evaluateAllCells};