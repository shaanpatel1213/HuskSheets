import { TableData, Ref } from './types';
import { parseAndEvaluateExpression } from './parsing';

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

const colToIndex = (col: string): number => {
  col = col.replace("$", "");
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

const isRef = (value: any): value is Ref => {
  return value && typeof value.row === "number" && typeof value.col === "number";
};

export {
  colToIndex,
  isRef,
};
