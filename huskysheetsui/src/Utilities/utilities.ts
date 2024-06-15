import { TableData, Ref } from './types';
import { parseAndEvaluateExpression } from './parsing';

/**
 * Resolves the value of an operand, which can be a number, a string representing a cell reference or expression, or a Ref object.
 * @param {number | string | Ref} operand - The operand to resolve.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The resolved value of the operand.
 * @throws {Error} If the operand type is invalid.
 * 
 * @author syadav7173
 */

/**
 * Resolves the value of an operand, which can be a number, a string representing a cell reference or expression, or a Ref object.
 * If the operand is a number, it returns the number. If it is a string, it checks if it is an expression or a cell reference,
 * evaluates it accordingly, and returns the result. If it is a Ref object, it returns the corresponding cell value from the table data.
 * 
 * @param {number | string | Ref} operand - The operand to resolve.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The resolved value of the operand.
 * @throws {Error} If the operand type is invalid.
 * 
 * @author syadav7173
 */
export const resolveOperand = (
  operand: number | string | Ref,
  data: TableData
): number | string => {
  if (typeof operand === "number") {
    return operand;
  }
  if (typeof operand === "string") {
    if (operand.startsWith("=")) {
      return parseAndEvaluateExpression(operand.substring(1), data);
    }
    return resolveCellReference(operand, data);
  }
  if (isRef(operand)) {
    return data[operand.row][operand.col];
  }
  throw new Error("Invalid operand type");
};


/**
 * Resolves the value of a cell reference by converting the reference to its corresponding row and column indices,
 * then retrieving the value from the table data. If the cell value is a number, it returns the number; otherwise, it returns the string.
 * @param {string} ref - The cell reference to resolve.
 * @param {TableData} data - The table data.
 * @returns {string | number} The value of the cell reference.
 * 
 * @author syadav7173
 */
export const resolveCellReference = (ref: string, data: TableData): string | number => {
  ref = ref.startsWith("$") ? ref.substring(1) : ref;
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return ref;
  const colLetters = match[1];
  const rowIndex = parseInt(match[2], 10) - 1;
  let colIndex = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
  }
  colIndex -= 1;
  if (
    rowIndex < 0 ||
    rowIndex >= data.length ||
    colIndex < 0 ||
    colIndex >= data[0].length
  ) {
    return "ERROR";
  }
  let returnValue = data[rowIndex][colIndex];
  return !isNaN(Number(returnValue)) ? Number(returnValue) : returnValue.toString();
};

/**
 * Parses a cell reference into a Ref object containing the zero-based row and column indices.
 * This function converts a cell reference string into an object.
 * @param {string} ref - The cell reference to parse.
 * @returns {Ref} The parsed cell reference as a Ref object.
 * @throws {Error} If the cell reference format is invalid.
 * 
 * @author syadav7173
 */
export const parseCellReference = (ref: string): Ref => {
  ref = ref.startsWith("$") ? ref.substring(1) : ref;
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error("Invalid cell reference");

  const colLetters = match[1];
  const rowIndex = parseInt(match[2], 10) - 1;

  let colIndex = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
  }
  colIndex -= 1;

  return { row: rowIndex, col: colIndex };
};

/**
 * Gets the values from a specified range in the table data by converting the range reference
 * to numerical row and column indices, then retrieving all cell values within the range.
 * 
 * @param {string} ref - The range reference.
 * @param {TableData} data - The table data.
 * @returns {string[]} An array of values within the specified range.
 * @throws {Error} If the range format is invalid.
 * 
 * @author syadav7173
 */
export const getRangeFromReference = (ref: string, data: TableData): string[] => {
  console.log("Getting range from reference:", ref);
  const match = ref.match(/^(\$?[A-Z]+)(\d+):(\$?[A-Z]+)(\d+)$/);
  if (!match) throw new Error("Invalid range format");

  const [, colStart, rowStart, colEnd, rowEnd] = match;
  const startCol = colToIndex(colStart);
  const endCol = colToIndex(colEnd);
  const startRow = parseInt(rowStart, 10) - 1;
  const endRow = parseInt(rowEnd, 10) - 1;

  console.log(`Parsed range: Start: (${startCol}, ${startRow}), End: (${endCol}, ${endRow})`);

  const values = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      values.push(data[row][col]);
    }
  }
  return values;
};

/**
 * Converts a column letter reference to a zero-based column index.
 * This function handles single and multi-letter column references (e.g., "A" to 0, "AA" to 26).
 * @param {string} col - The column letter reference.
 * @returns {number} The zero-based column index.
 * 
 * @author syadav7173
 */
const colToIndex = (col: string): number => {
  col = col.replace("$", "");
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

/**
 * Checks if a value is a Ref object by verifying that it contains numerical row and column properties.
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a Ref object, false otherwise.
 * 
 * @author syadav7173
 */
const isRef = (value: any): value is Ref => {
  return value && typeof value.row === "number" && typeof value.col === "number";
};

export {
  colToIndex,
  isRef,
};
