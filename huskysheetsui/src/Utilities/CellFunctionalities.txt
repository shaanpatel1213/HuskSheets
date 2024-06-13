import "../css/Spreadsheet.css";

type Ref = { row: number; col: number };

type CellData = string;
type TableData = CellData[][];

// Utility functions for spreadsheet calculations

/**
 * Parses and evaluates an expression based on the provided table data.
 * @param {string} expression - The expression to parse and evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The evaluated result as a string.
 */
export const parseAndEvaluateExpression = (
  expression: string,
  data: TableData
): string => {
  try {
    console.log("Parsing expression:", expression);
    const parsedExpression = parseExpression(expression);
    console.log("Evaluating parsed expression:", parsedExpression);
    const result = evaluateExpression(parsedExpression, data);
    return !isNaN(Number(result)) ? result.toString() : result.toString();
  } catch (error) {
    console.error("Error in parseAndEvaluateExpression:", error);
    return "ERROR";
  }
};

/**
 * Parses an expression into its components.
 * @param {string} expression - The expression to parse.
 * @returns {Object} The parsed expression object.
 */
const parseExpression = (expression: string) => {
  console.log("Parsing expression:", expression);

  if (!isNaN(Number(expression.trim()))) {
    return { value: Number(expression.trim()) };
  }

  // Remove outer parentheses for nested expressions
  if (expression.startsWith("(") && expression.endsWith(")")) {
    expression = expression.slice(1, -1);
  }

  // Handle nested function calls
  const nestedFuncMatch = expression.match(/^\s*([\w\$]+)\s*\((.*)\)\s*$/);
  if (nestedFuncMatch) {
    const func = nestedFuncMatch[1];
    const args = nestedFuncMatch[2]
      .split(/,(?![^\(]*\))/)
      .map((arg) => arg.trim());
    console.log("Parsed function", func, "with args:", args);
    return { func, args };
  }

  // Handle logical operators and nested expressions
  const logicalOpMatch = expression.match(
    /^\s*(\(.+\)|\$?[A-Z]+\d*|[-+]?\d*\.?\d+)\s*([=<>|&:/*+-])\s*(\(.+\)|\$?[A-Z]+\d*|[-+]?\d*\.?\d+)\s*$/
  );
  if (logicalOpMatch) {
    return parseOperatorMatch(logicalOpMatch);
  }

  // Match range with nested function
  const rangeWithFuncMatch = expression.match(
    /^\s*([\w\$]+)\s*:\s*([\w\$\(][^\)]*\)\s*)$/
  );
  if (rangeWithFuncMatch) {
    const startRef = rangeWithFuncMatch[1];
    const endRef = rangeWithFuncMatch[2];
    console.log("Parsing range with nested function:", startRef, endRef);
    return { startRef, endRef, isRangeWithFunc: true };
  }

  // Match range reference
  const rangeMatch = expression.match(/^\s*\$?([A-Z]+\d+)\s*:\s*\$?([A-Z]+\d+)\s*$/);
  if (rangeMatch) {
    const startRef = rangeMatch[1];
    const endRef = rangeMatch[2];
    console.log("Parsed range", startRef, endRef);
    return { startRef, endRef };
  }  

  // Match multiple cell references separated by commas
  const multipleCellRefsMatch = expression.match(/^\s*\((\$?[A-Z]+\d+\s*,\s*)+\$?[A-Z]+\d+\)\s*$/);
  if (multipleCellRefsMatch) {
    const cellRefs = expression.slice(1, -1).split(',').map((ref) => ref.trim());
    console.log("Parsed multiple cell references:", cellRefs);
    return { cellRefs };
  }

  throw new Error("Invalid expression format");
};

/**
 * Parses an operator match.
 * @param {RegExpMatchArray} match - The matched operator expression.
 * @returns {Object} The parsed operator expression object.
 */
const parseOperatorMatch = (match: RegExpMatchArray) => {
  const x = parseOperand(match[1]);
  const operator = match[2];
  const y = parseOperand(match[3]);
  return { x, y, operator };
};

/**
 * Parses an operand from a string.
 * @param {string} operand - The operand to parse.
 * @returns {number | string | Ref} The parsed operand.
 */
const parseOperand = (operand: string): number | string | Ref => {
  if (operand.startsWith("(") && operand.endsWith(")")) {
    const nestedExpression = parseExpression(operand);
    return evaluateExpression(nestedExpression, []);
  }
  if (!isNaN(Number(operand))) {
    return Number(operand);
  } else if (operand.match(/^\$?[A-Z]+\d*$/)) {
    return operand;
  } else {
    throw new Error("Invalid operand format");
  }
};

/**
 * Evaluates a parsed expression based on the provided table data.
 * @param {any} parsedExpression - The parsed expression object.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The evaluated result.
 */
const evaluateExpression = (
  parsedExpression: any,
  data: TableData
): number | string => {
  if (parsedExpression.value !== undefined) {
    return parsedExpression.value;
  }

  if (parsedExpression.func) {
    return evaluateFunction(parsedExpression, data);
  }

  if (parsedExpression.isRangeWithFunc) {
    const { startRef, endRef } = parsedExpression;
    const resolvedEndRef = parseAndEvaluateExpression(endRef, data);
    const range = `${startRef}:${resolvedEndRef}`;
    return evaluateRange(range, data);
  }

  const { x, y, operator } = parsedExpression;
  const evaluatedX = resolveOperand(x, data);
  const evaluatedY = resolveOperand(y, data);
  return evaluateOperands(evaluatedX, evaluatedY, operator);
};

/**
 * Evaluates a function based on the provided table data.
 * @param {any} parsedExpression - The parsed expression object.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The evaluated result.
 */
const evaluateFunction = (
  parsedExpression: any,
  data: TableData
): number | string => {
  const { func, args } = parsedExpression;
  const resolvedArgs = args.map((arg: string) =>
    arg.includes("(") ? parseAndEvaluateExpression(arg, data) : arg
  );

  switch (func) {
    case "SUM":
      return sumFunction(resolvedArgs, data);
    case "MIN":
      return minFunction(resolvedArgs, data);
    case "MAX":
      return maxFunction(resolvedArgs, data);
    case "AVG":
      return avgFunction(resolvedArgs, data);
    case "CONCAT":
      return concatFunction(resolvedArgs, data);
    case "IF":
      return ifFunction(resolvedArgs, data);
    case "DEBUG":
      return debugFunction(resolvedArgs, data);
    case "COPY":
      return copyFunction(resolvedArgs, data);
    default:
      throw new Error("Function not supported");
  }
};

/**
 * Evaluates a range expression.
 * @param {string} range - The range expression.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The sum of the values in the range.
 */
const evaluateRange = (range: string, data: TableData): number => {
  const values = getRangeFromReference(range, data);
  return values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
};

/**
 * Sums the values of the arguments based on the provided table data.
 * @param {any[]} args - The arguments to sum.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The sum of the arguments.
 */
const sumFunction = (args: any[], data: TableData): number => {
  console.log("Summing with args:", args);
  let sum = 0;

  args.forEach((arg: any) => {
    if (typeof arg === "string" && arg.match(/^\$?[A-Z]+\d*$/)) {
      const cellValue = resolveCellReference(arg, data);
      sum += parseFloat(cellValue.toString()) || 0;
    } else if (typeof arg === "string" && arg.match(/^\$?[A-Z]+\d+:\$?[A-Z]+\d+$/)) {
      const range = getRangeFromReference(arg, data);
      range.forEach((value) => {
        sum += parseFloat(value) || 0;
      });
    } else {
      sum += parseFloat(arg) || 0;
    }
  });

  console.log("Sum result:", sum);
  return sum;
};

/**
 * Finds the minimum value among the arguments based on the provided table data.
 * @param {string[]} args - The arguments to evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The minimum value.
 */
const minFunction = (args: string[], data: TableData): number => {
  let min = Infinity;
  args.forEach((arg: any) => {
    if (arg.includes(":")) {
      const range = getRangeFromReference(arg, data);
      range.forEach((value) => {
        const num = parseFloat(value);
        if (!isNaN(num) && num < min) {
          min = num;
        }
      });
    } else {
      const num = parseFloat(resolveOperand(arg, data) as string);
      if (!isNaN(num) && num < min) {
        min = num;
      }
    }
  });
  return min;
};

/**
 * Finds the maximum value among the arguments based on the provided table data.
 * @param {string[]} args - The arguments to evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The maximum value.
 */
const maxFunction = (args: string[], data: TableData): number => {
  let max = -Infinity;
  args.forEach((arg: any) => {
    if (arg.includes(":")) {
      const range = getRangeFromReference(arg, data);
      range.forEach((value) => {
        const num = parseFloat(value);
        if (!isNaN(num) && num > max) {
          max = num;
        }
      });
    } else {
      const num = parseFloat(resolveOperand(arg, data) as string);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  });
  return max;
};

/**
 * Calculates the average value of the arguments based on the provided table data.
 * @param {string[]} args - The arguments to evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The average value.
 */
const avgFunction = (args: string[], data: TableData): number => {
  let sum = 0;
  let count = 0;
  args.forEach((arg: any) => {
    if (arg.includes(":")) {
      const range = getRangeFromReference(arg, data);
      range.forEach((value) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          sum += num;
          count++;
        }
      });
    } else {
      const num = parseFloat(resolveOperand(arg, data) as string);
      if (!isNaN(num)) {
        sum += num;
        count++;
      }
    }
  });
  return count > 0 ? sum / count : NaN;
};

/**
 * Concatenates the values of the arguments based on the provided table data.
 * @param {string[]} args - The arguments to concatenate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The concatenated result.
 */
const concatFunction = (args: string[], data: TableData): string => {
  return args
    .map((arg) => {
      let resolvedArg = resolveOperand(arg, data).toString();
      if (resolvedArg.startsWith('"') && resolvedArg.endsWith('"')) {
        resolvedArg = resolvedArg.slice(1, -1);
      }
      return resolvedArg;
    })
    .join("");
};

/**
 * Evaluates an IF condition based on the provided table data.
 * @param {string[]} args - The arguments for the IF function.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The result of the IF function.
 */
const ifFunction = (args: string[], data: TableData): string => {
  if (args.length !== 3) {
    throw new Error("IF function requires 3 arguments");
  }
  const condition = evaluateCondition(args[0], data);
  return condition ? args[1] : args[2];
};

/**
 * Evaluates a condition based on the provided table data.
 * @param {string} condition - The condition to evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {boolean} The result of the condition evaluation.
 */
const evaluateCondition = (condition: string, data: TableData): boolean => {
  const parsedExpression = parseExpression(condition);
  const result = evaluateExpression(parsedExpression, data);
  return parseFloat(result.toString()) !== 0;
};

/**
 * Debugs a function by logging the result.
 * @param {string[]} args - The arguments for the DEBUG function.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The result of the DEBUG function.
 */
const debugFunction = (args: string[], data: TableData): string => {
  if (args.length !== 1) {
    throw new Error("DEBUG function requires 1 argument");
  }
  const result = resolveOperand(args[0], data).toString();
  console.log(result); // For specification
  return result;
};

/**
 * Copies the value from one cell to another based on the provided table data.
 * @param {string[]} args - The arguments for the COPY function.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The copied value.
 */
const copyFunction = (args: string[], data: TableData): string => {
  if (args.length !== 2) {
    throw new Error("COPY function requires 2 arguments");
  }

  const sourceRef = args[0];
  const targetRef = args[1].replace(/"/g, ""); // Remove the double quotes

  const sourceValue = resolveCellReference(sourceRef, data);
  const targetCoords = parseCellReference(targetRef);
  data[targetCoords.row][targetCoords.col] = sourceValue.toString();

  return sourceValue.toString();
};

/**
 * Parses a cell reference into row and column indices.
 * @param {string} ref - The cell reference to parse.
 * @returns {Ref} The parsed row and column indices.
 */
const parseCellReference = (ref: string): Ref => {
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
 * Gets the range of values from the table data based on the reference.
 * @param {string} ref - The range reference.
 * @param {TableData} data - The table data.
 * @returns {string[]} The values in the range.
 */
const getRangeFromReference = (ref: string, data: TableData): string[] => {
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
 * Converts a column reference to an index.
 * @param {string} col - The column reference.
 * @returns {number} The column index.
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
 * Resolves an operand based on the provided table data.
 * @param {number | string | Ref} operand - The operand to resolve.
 * @param {TableData} data - The table data.
 * @returns {number | string} The resolved operand value.
 */
const resolveOperand = (
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
 * Resolves a cell reference to a value based on the provided table data.
 * @param {string} ref - The cell reference to resolve.
 * @param {TableData} data - The table data.
 * @returns {string | number} The resolved cell value.
 */
const resolveCellReference = (ref: string, data: TableData): string | number => {
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
 * Evaluates operands with the specified operator.
 * @param {number | string} x - The first operand.
 * @param {number | string} y - The second operand.
 * @param {string} operator - The operator to apply.
 * @returns {number | string} The evaluated result.
 */
const evaluateOperands = (
  x: number | string,
  y: number | string,
  operator: string
): number | string => {
  switch (operator) {
    case "=":
      return x === y ? 1 : 0;
    case "<>":
      return x !== y ? 1 : 0;
    case "&":
      return x !== 0 && y !== 0 ? 1 : 0;
    case "|":
      return x === 1 || y === 1 ? 1 : 0;
    case "+":
      return (x as number) + (y as number);
    case "-":
      return (x as number) - (y as number);
    case "*":
      return (x as number) * (y as number);
    case "/":
      if ((y as number) === 0) throw new Error("Division by zero");
      return (x as number) / (y as number);
    case "<":
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error("Invalid operand type for comparison");
      return (x as number) < (y as number) ? 1 : 0;
    case ">":
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error("Invalid operand type for comparison");
      return (x as number) > (y as number) ? 1 : 0;
    case "<=":
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error("Invalid operand type for comparison");
      return (x as number) <= (y as number) ? 1 : 0;
    case ">=":
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error("Invalid operand type for comparison");
      return (x as number) >= (y as number) ? 1 : 0;
    default:
      throw new Error("Unsupported operator");
  }
};

function isRef(value: any): value is Ref {
  return value && typeof value.row === "number" && typeof value.col === "number";
}

export { evaluateOperands, evaluateExpression, type TableData };
