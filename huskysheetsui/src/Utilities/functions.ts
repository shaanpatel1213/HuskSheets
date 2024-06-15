import { TableData } from './types';
import { resolveOperand, resolveCellReference, getRangeFromReference, parseCellReference } from './utilities';
import { parseExpression, evaluateExpression } from './parsing';


/**
 * Sums the values of the given arguments.
 * @param args - The arguments to sum, which can be cell references, ranges, or numbers.
 * @param data - The table data.
 * @returns The sum of the values.
 * @author syadav7173
 */
export const sumFunction = (args: any[], data: TableData): number => {
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
 * Finds the minimum value among the given arguments.
 * @param args - The arguments to evaluate, which can be cell references, ranges, or numbers.
 * @param data - The table data.
 * @returns The minimum value.
 * @author syadav7173
 */
export const minFunction = (args: string[], data: TableData): number => {
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
 * Finds the maximum value among the given arguments.
 * @param args - The arguments to evaluate, which can be cell references, ranges, or numbers.
 * @param data - The table data.
 * @returns The maximum value.
 * @author syadav7173
 */
export const maxFunction = (args: string[], data: TableData): number => {
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
 * Calculates the average of the given arguments.
 * @param args - The arguments to evaluate, which can be cell references, ranges, or numbers.
 * @param data - The table data.
 * @returns The average of the values.
 * @author syadav7173
 */
export const avgFunction = (args: string[], data: TableData): number => {
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
 * Concatenates the given arguments.
 * @param args - The arguments to concatenate, which can be cell references or strings.
 * @param data - The table data.
 * @returns The concatenated string.
 * @author syadav7173
 */
export const concatFunction = (args: string[], data: TableData): string => {
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
 * Evaluates a condition and returns one of the two given arguments based on the result.
 * @param args - The arguments for the IF function: condition, true result, false result.
 * @param data - The table data.
 * @returns The result based on the condition.
 * @author syadav7173
 */
export const ifFunction = (args: string[], data: TableData): string => {
  if (args.length !== 3) {
    throw new Error("IF function requires 3 arguments");
  }
  const condition = evaluateCondition(args[0], data);
  return condition ? args[1] : args[2];
};

/**
 * Evaluates a condition and returns a boolean result.
 * @param condition - The condition to evaluate.
 * @param data - The table data.
 * @returns True if the condition is met, otherwise false.
 * @author syadav7173
 */
export const evaluateCondition = (condition: string, data: TableData): boolean => {
  const parsedExpression = parseExpression(condition);
  const result = evaluateExpression(parsedExpression, data);
  return parseFloat(result.toString()) !== 0;
};

/**
 * Logs the given argument and returns it as a string.
 * @param args - The arguments for the DEBUG function: one argument to debug.
 * @param data - The table data.
 * @returns The debugged value as a string.
 * @author syadav7173
 */
export const debugFunction = (args: string[], data: TableData): string => {
  if (args.length !== 1) {
    throw new Error("DEBUG function requires 1 argument");
  }
  const result = resolveOperand(args[0], data).toString();
  console.log(result);
  return result;
};

/**
 * Copies the value from a source cell to a target cell.
 * @param args - The arguments for the COPY function: source reference, target reference.
 * @param data - The table data.
 * @returns The value copied from the source cell.
 * @author syadav7173
 */
export const copyFunction = (args: string[], data: TableData): string => {
  if (args.length !== 2) {
    throw new Error("COPY function requires 2 arguments");
  }

  const sourceRef = args[0];
  const targetRef = args[1].replace(/"/g, "");

  const sourceValue = resolveCellReference(sourceRef, data);
  const targetCoords = parseCellReference(targetRef);
  data[targetCoords.row][targetCoords.col] = sourceValue.toString();

  return sourceValue.toString();
};
