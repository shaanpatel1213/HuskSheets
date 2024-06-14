import { TableData } from './types';
import { resolveOperand, resolveCellReference, getRangeFromReference, parseCellReference } from './utilities';
import { parseExpression, evaluateExpression } from './parsing';

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

export const ifFunction = (args: string[], data: TableData): string => {
  if (args.length !== 3) {
    throw new Error("IF function requires 3 arguments");
  }
  const condition = evaluateCondition(args[0], data);
  return condition ? args[1] : args[2];
};

export const evaluateCondition = (condition: string, data: TableData): boolean => {
  const parsedExpression = parseExpression(condition);
  const result = evaluateExpression(parsedExpression, data);
  return parseFloat(result.toString()) !== 0;
};

export const debugFunction = (args: string[], data: TableData): string => {
  if (args.length !== 1) {
    throw new Error("DEBUG function requires 1 argument");
  }
  const result = resolveOperand(args[0], data).toString();
  console.log(result); // For specification
  return result;
};

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
