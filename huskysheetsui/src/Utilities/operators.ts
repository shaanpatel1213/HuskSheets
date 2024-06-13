import { TableData } from './types';

/**
 * Evaluates operands with the specified operator.
 * @param {number | string} x - The first operand.
 * @param {number | string} y - The second operand.
 * @param {string} operator - The operator to apply.
 * @returns {number | string} The evaluated result.
 */
export const evaluateOperands = (
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
