import "../css/Spreadsheet.css";
import { TableData, Ref } from './types';
import { resolveOperand, resolveCellReference, parseCellReference, getRangeFromReference } from './utilities';
import { evaluateOperands } from './operators';
import { sumFunction, minFunction, maxFunction, avgFunction, concatFunction, ifFunction, debugFunction, copyFunction } from './functions';

/**
 * Parses and evaluates an expression based on the provided table data.
 * This function first parses the expression into its components and then evaluates it.
 * If the expression contains references to cell values or ranges, those values are retrieved
 * from the provided table data. The result of the evaluation is returned as a string.
 *
 * @param {string} expression - The expression to parse and evaluate.
 * @param {TableData} data - The table data for evaluation.
 * @returns {string} The evaluated result as a string.
 * 
 * @author syadav7173
 */
export const parseAndEvaluateExpression = (
  expression: string,
  data: TableData
): string => {
  try {
    // console.log("Parsing expression:", expression);
    const parsedExpression = parseExpression(expression);
    // console.log("Evaluating parsed expression:", parsedExpression);
    const result = evaluateExpression(parsedExpression, data);
    return !isNaN(Number(result)) ? result.toString() : result.toString();
  } catch (error) {
    console.log("Error in parseAndEvaluateExpression:", error);
    return "ERROR";
  }
};

/**
 * Parses an expression into its components.
 * This function handles various types of expressions including simple values,
 * nested function calls, logical operators, ranges, and multiple cell references.
 *
 * @param {string} expression - The expression to parse.
 * @returns {Object} The parsed expression object.
 * 
 * @author syadav7173
 */
const parseExpression = (expression: string) => {
  // console.log("Parsing expression:", expression);

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
    // console.log("Parsed function", func, "with args:", args);
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
    // console.log("Parsing range with nested function:", startRef, endRef);
    return { startRef, endRef, isRangeWithFunc: true };
  }

  // Match range reference
  const rangeMatch = expression.match(/^\s*\$?([A-Z]+\d+)\s*:\s*\$?([A-Z]+\d+)\s*$/);
  if (rangeMatch) {
    const startRef = rangeMatch[1];
    const endRef = rangeMatch[2];
    // console.log("Parsed range", startRef, endRef);
    return { startRef, endRef };
  }  

  // Match multiple cell references separated by commas
  const multipleCellRefsMatch = expression.match(/^\s*\((\$?[A-Z]+\d+\s*,\s*)+\$?[A-Z]+\d+\)\s*$/);
  if (multipleCellRefsMatch) {
    const cellRefs = expression.slice(1, -1).split(',').map((ref) => ref.trim());
    // console.log("Parsed multiple cell references:", cellRefs);
    return { cellRefs };
  }

  throw new Error("Invalid expression format");
};

/**
 * Parses an operator match.
 * This function extracts the components of an operator expression, including the left operand,
 * operator, and right operand, and returns them in an object.
 *
 * @param {RegExpMatchArray} match - The matched operator expression.
 * @returns {Object} The parsed operator expression object.
 * 
 * @author syadav7173
 */
const parseOperatorMatch = (match: RegExpMatchArray) => {
  const x = parseOperand(match[1]);
  const operator = match[2];
  const y = parseOperand(match[3]);
  return { x, y, operator };
};

/**
 * Parses an operand from a string.
 * This function handles simple numeric values, cell references, and nested expressions.
 *
 * @param {string} operand - The operand to parse.
 * @returns {number | string | Ref} The parsed operand.
 * 
 * @author syadav7173
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
 * This function handles the evaluation of simple values, functions, ranges, and operator expressions.
 *
 * @param {any} parsedExpression - The parsed expression object.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The evaluated result.
 * 
 * @author syadav7173
 */
export const evaluateExpression = (
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
 * This function dispatches the function call to the appropriate implementation based on the function name.
 *
 * @param {any} parsedExpression - The parsed expression object.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number | string} The evaluated result.
 * 
 * @author syadav7173
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
 * This function retrieves the values from the specified range in the table data and sums them.
 *
 * @param {string} range - The range expression.
 * @param {TableData} data - The table data for evaluation.
 * @returns {number} The sum of the values in the range.
 * 
 * @author syadav7173
 */
const evaluateRange = (range: string, data: TableData): number => {
  const values = getRangeFromReference(range, data);
  return values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
};

export {
  parseExpression,
  parseOperatorMatch,
  parseOperand,
  evaluateFunction,
  evaluateRange
};
