// src/Utilities/SpreadsheetUtils.ts
import '../Components/Spreadsheet.css';
type Ref = { row: number, col: number };

type CellData = string;
type RowData = CellData[];
type TableData = RowData[];

// Utility functions for spreadsheet calculations

export const parseAndEvaluateExpression = (expression: string, data: TableData): string => {
  try {
    console.log("we are parsing", expression)
    let parsedExpression = parseExpression(expression);
    console.log("evaluateing", parsedExpression);
    let result = evaluateExpression(parsedExpression, data);
    // Check if the result is a number or a basic value and return directly
    if (!isNaN(Number(result))) {
      console.log("result is ", result);
      return result.toString();
    }
    return result.toString();
  } catch (error) {
    console.error(error);
    return 'ERROR';
  }
};
  
  const parseExpression = (expression: string) => {
    console.log("parsing expression", expression);


    if (!isNaN(Number(expression.trim()))) {
      return { value: Number(expression.trim()) };
    }

    //match nested function call
    const nestedFuncMatch = expression.match(/^\s*([\w\$]+)\s*\((.*)\)\s*$/);
    if (nestedFuncMatch) {
      const func = nestedFuncMatch[1];
      const args = nestedFuncMatch[2].split(/,(?![^\(]*\))/).map(arg => arg.trim());
      console.log("parsed function", func, "with args:", args);
      return { func, args };
    }
  
    if (expression.startsWith('(') && expression.endsWith(')')) {
      const innerExpression = expression.slice(1, -1);
      // Check if the parentheses match
      let depth = 0;
      let isMatching = true;
      for (let i = 0; i < innerExpression.length; i++) {
        if (innerExpression[i] === '(') depth++;
        if (innerExpression[i] === ')') depth--;
        if (depth < 0) {
          isMatching = false;
          break;
        }
      }
      if (isMatching && depth === 0) {
        expression = innerExpression;
        console.log(innerExpression);
      }
    }

    if (!isNaN(Number(expression.trim()))) {
      return { value: Number(expression.trim()) };
    }

    //match range with nested function
    const rangeWithFuncMatch = expression.match(/^\s*([\w\$]+)\s*:\s*([\w\$\(][^\)]*\)\s*)$/);
    if (rangeWithFuncMatch) {
      const startRef = rangeWithFuncMatch[1];
      const endRef = rangeWithFuncMatch[2];
      console.log("parsing range with nested function:", startRef, endRef);
      return { startRef, endRef, isRangeWithFunc: true };
    }
  
    //match range reference
    const rangeMatch = expression.match(/^\s*([\w\$]+)\s*:\s*([\w\$]+)\s*$/);
    if (rangeMatch) {
      const startRef = rangeMatch[1];
      const endRef = rangeMatch[2];
      console.log("parsed range", startRef, endRef);
      return { startRef, endRef };
    }
  
    //match operators and operands
    const opMatch = expression.match(/^\s*(\$?[A-Z]+\d*|\d*\.?\d+)\s*([=<>|&:/*+-])\s*(\$?[A-Z]+\d*|\d*\.?\d+)\s*$/);
    if (opMatch) {
      const x = parseOperand(opMatch[1]);
      const operator = opMatch[2];
      const y = parseOperand(opMatch[3]);
      return { x, y, operator };
    }

    
  
    throw new Error('invalid expression format');
  };
  
  
  const parseOperand = (operand: string): number | string | Ref => {
    if (!isNaN(Number(operand))) {
      return Number(operand);
    } else if (operand.match(/^\$?[A-Z]+\d*$/)) {
      return operand;
    } else {
      throw new Error('Invalid operand format');
    }
  };
  
  const evaluateExpression = (parsedExpression: any, data: TableData): number | string => {
    if (parsedExpression.value !== undefined) {
      return parsedExpression.value;
    }
    
    if (parsedExpression.func) {
      const { func, args } = parsedExpression;
      const resolvedArgs = args.map((arg: string) => {
        if (arg.includes('(')) {
          return parseAndEvaluateExpression(arg, data);
        }
        return arg;
      });
  
      switch (func) {
        case 'SUM':
          return sumFunction(resolvedArgs, data);
        case 'MIN':
          return minFunction(resolvedArgs, data);
        case 'MAX':
          return maxFunction(resolvedArgs, data);
        case 'AVG':
          return avgFunction(resolvedArgs, data);
        case 'CONCAT':
          return concatFunction(resolvedArgs, data);
        case 'IF':
          return ifFunction(resolvedArgs, data);
        case 'DEBUG':
          return debugFunction(resolvedArgs, data);
        case 'COPY':
          return copyFunction(resolvedArgs, data);
        default:
          throw new Error('function not supported');
      }
    } else if (parsedExpression.isRangeWithFunc) {
      const { startRef, endRef } = parsedExpression;
      const resolvedEndRef = parseAndEvaluateExpression(endRef, data);
      const range = `${startRef}:${resolvedEndRef}`;
      return evaluateRange(range, data);
    } else {
      const { x, y, operator } = parsedExpression;
      let evaluatedX = resolveOperand(x, data);
      let evaluatedY = resolveOperand(y, data);
      return evaluateOperands(evaluatedX, evaluatedY, operator);
    }
  };
  
  const evaluateRange = (range: string, data: TableData): number => {
    const values = getRangeFromReference(range, data);
    let sum = 0;
    values.forEach(value => {
      sum += parseFloat(value) || 0;
    });
    return sum;
  };
  
  const sumFunction = (args: any[], data: TableData): number => {
    console.log("summing with args", args);
    let sum = 0;
  
    args.forEach((arg: any) => {
      if (typeof arg === 'string' && arg.includes(':')) {
        // Handle range
        const range = getRangeFromReference(arg, data);
        range.forEach(value => {
          sum += parseFloat(value) || 0;
        });
      } else if (typeof arg === 'string' && arg.match(/^\$?[A-Z]+\d*$/)) {
        // Handle individual cell reference
        const cellValue = resolveCellReference(arg, data);
        sum += parseFloat(cellValue) || 0;
      } else {
        // Handle direct numeric value
        const resolvedValue = parseFloat(arg) || 0;
        sum += resolvedValue;
      }
    });
  
    console.log("sum result:", sum);
    return sum;
  };
  
  
  const minFunction = (args: string[], data: TableData): number => {
    let min = Infinity;
    args.forEach((arg: any) => {
      if (arg.includes(':')) {
        const range = getRangeFromReference(arg, data);
        range.forEach(value => {
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
  
  const maxFunction = (args: string[], data: TableData): number => {
    let max = -Infinity;
    args.forEach((arg: any) => {
      if (arg.includes(':')) {
        const range = getRangeFromReference(arg, data);
        range.forEach(value => {
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
  
  const avgFunction = (args: string[], data: TableData): number => {
    let sum = 0;
    let count = 0;
    args.forEach((arg: any) => {
      if (arg.includes(':')) {
        const range = getRangeFromReference(arg, data);
        range.forEach(value => {
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
  
  const concatFunction = (args: string[], data: TableData): string => {
    return args.map(arg => resolveOperand(arg, data)).join('');
  };
  
  const ifFunction = (args: string[], data: TableData): string => {
    if (args.length !== 3) {
      throw new Error('IF function requires 3 arguments');
    }
    const condition = evaluateCondition(args[0], data);
    if (condition) {
      return args[1];
    } else {
      return args[2];
    }
  };
  
  const evaluateCondition = (condition: string, data: TableData): boolean => {
    // Evaluate the condition expression
    const parsedExpression = parseExpression(condition);
    console.log("reparsing", parsedExpression);
    const result = evaluateExpression(parsedExpression, data);
    return parseFloat(result.toString()) !== 0;
  };
  
  const debugFunction = (args: string[], data: TableData): string => {
    if (args.length !== 1) {
      throw new Error('DEBUG function requires 1 argument');
    }
    return resolveOperand(args[0], data).toString();
  };

  const copyFunction = (args: string[], data: TableData): string => {
    if (args.length !== 2) {
      throw new Error('COPY function requires 2 arguments');
    }
  
    const sourceRef = args[0];
    const targetRef = args[1].replace(/"/g, ''); // Remove the double quotes
  
    const sourceValue = resolveCellReference(sourceRef, data);
    const targetCoords = parseCellReference(targetRef);
    data[targetCoords.row][targetCoords.col] = sourceValue;
  
    return sourceValue;
  };
  
  const parseCellReference = (ref: string): Ref => {
    ref = ref.startsWith('$') ? ref.substring(1) : ref;
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    console.log(ref);
    if (!match) throw new Error('Invalid cell reference');
  
    const colLetters = match[1];
    const rowIndex = parseInt(match[2], 10) - 1;
  
    let colIndex = 0;
    for (let i = 0; i < colLetters.length; i++) {
      colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
    }
    colIndex -= 1;
  
    return { row: rowIndex, col: colIndex };
  };
  
  
  const getRangeFromReference = (ref: string, data: TableData): string[] => {
    console.log("getting range from reference:", ref); // Debugging output
    const match = ref.match(/^(\$?[A-Z]+)(\d+):(\$?[A-Z]+)(\d+)$/);
    if (!match) throw new Error('invalid range format');
  
    const [ , colStart, rowStart, colEnd, rowEnd ] = match;
    console.log("starting point", colStart);
    const startCol = colToIndex(colStart);
    const endCol = colToIndex(colEnd);
    const startRow = parseInt(rowStart, 10) - 1;
    const endRow = parseInt(rowEnd, 10) - 1;
  
    console.log(`parsed range: Start: (${startCol}, ${startRow}), End: (${endCol}, ${endRow})`); // Debugging output
    console.log("starting point post processing", startCol);
    const values = [];
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          values.push(data[row][col]);
        }
      }
      console.log("values in range:", values);
      return values;
    };
    
    const colToIndex = (col: string): number => {
      col = col.replace('$', '');
      let index = 0;
      for (let i = 0; i < col.length; i++) {
        index = index * 26 + (col.charCodeAt(i) - 65 + 1);
      }
      return index - 1;
    };
    
    const resolveOperand = (operand: number | string | Ref, data: TableData): number | string => {
      if (typeof operand === 'number') {
        return operand;
      }
      if (typeof operand === 'string') {
        if (operand.startsWith('=')) {
          return parseAndEvaluateExpression(operand.substring(1), data);
        }
        return resolveCellReference(operand, data);
      }
      if (isRef(operand)) {
        return data[operand.row][operand.col];
      }
      throw new Error('invalid operand type');
    };
    
    const resolveCellReference = (ref: string, data: TableData): string => {
      ref = ref.startsWith('$') ? ref.substring(1) : ref;
      const match = ref.match(/^([A-Z]+)(\d+)$/);
      if (!match) return ref;
    
      const colLetters = match[1];
      const rowIndex = parseInt(match[2], 10) - 1;
    
      let colIndex = 0;
      for (let i = 0; i < colLetters.length; i++) {
        colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
      }
      colIndex -= 1;
    
      if (rowIndex < 0 || rowIndex >= data.length || colIndex < 0 || colIndex >= data[0].length) {
        return 'ERROR';
      }
    
      return data[rowIndex][colIndex];
    };
    
    const evaluateOperands = (x: number | string, y: number | string, operator: string): number | string => {
      if (operator === '=') {
        return x === y ? 1 : 0;
      }
      if (operator === '<>') {
        return x !== y ? 1 : 0;
      }
      if (operator === '&') {
        return x !== 0 && y !== 0 ? 1 : 0;
      }
      if (operator === '|') {
        return x === 1 || y === 1 ? 1 : 0;
      }
      if (operator === '+') {
        return (x as number) + (y as number);
      }
      if (operator === '-') {
        return (x as number) - (y as number);
      }
      if (operator === '*') {
        return (x as number) * (y as number);
      }
      if (operator === '/') {
        if ((y as number) === 0) throw new Error('Division by zero');
        return (x as number) / (y as number);
      }
      throw new Error('Unsupported operator');
    };
    
    function isRef(value: any): value is Ref {
      return value && typeof value.row === 'number' && typeof value.col === 'number';
    }
    


export { evaluateOperands, evaluateExpression, type TableData }