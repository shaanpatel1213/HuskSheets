// src/tests/operators.test.tsx
import { TableData } from '../Utilities/types';
import { evaluateOperands } from '../Utilities';

const data: TableData = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];

describe('evaluateOperands function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should return 1 for equal numbers using = operator', () => {
        expect(evaluateOperands(5, 5, '=')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 for non-equal numbers using = operator', () => {
        expect(evaluateOperands(5, 10, '=')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 for equal strings using = operator', () => {
        expect(evaluateOperands('hello', 'hello', '=')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 for non-equal strings using = operator', () => {
        expect(evaluateOperands('hello', 'world', '=')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 for non-equal numbers using <> operator', () => {
        expect(evaluateOperands(5, 10, '<>')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 for equal numbers using <> operator', () => {
        expect(evaluateOperands(5, 5, '<>')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 for non-equal strings using <> operator', () => {
        expect(evaluateOperands('hello', 'world', '<>')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 for equal strings using <> operator', () => {
        expect(evaluateOperands('hello', 'hello', '<>')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if both numbers are not 0 using & operator', () => {
        expect(evaluateOperands(1, 1, '&')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if any number is 0 using & operator', () => {
        expect(evaluateOperands(1, 0, '&')).toBe(0);
        expect(evaluateOperands(0, 1, '&')).toBe(0);
        expect(evaluateOperands(0, 0, '&')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if any number is 1 using | operator', () => {
        expect(evaluateOperands(1, 1, '|')).toBe(1);
        expect(evaluateOperands(1, 0, '|')).toBe(1);
        expect(evaluateOperands(0, 1, '|')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if both numbers are 0 using | operator', () => {
        expect(evaluateOperands(0, 0, '|')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct sum if both inputs are numbers using + operator', () => {
        expect(evaluateOperands(2, 2, '+')).toBe(4);
    });

    // test('should return correct sum even if some inputs are strings', () => {
    //     //expect(evaluateOperands('2', 2, '+')).toBe(4);
    //     //expect(evaluateOperands(2, '2', '+')).toBe(4);
    //     expect(evaluateOperands('2', '2', '+')).toBe(4);
    // });

    /** Ownership: @author EmilyFink474 */
    test('should return correct difference if both inputs are numbers using - operator', () => {
        expect(evaluateOperands(2, 1, '-')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct difference even if some inputs are strings using - operator', () => {
        expect(evaluateOperands('2', 1, '-')).toBe(1);
        expect(evaluateOperands(2, '1', '-')).toBe(1);
        expect(evaluateOperands('2', '1', '-')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct product if both inputs are numbers using * operator', () => {
        expect(evaluateOperands(2, 1, '*')).toBe(2);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct product even if some inputs are strings using * operator', () => {
        expect(evaluateOperands('2', 1, '*')).toBe(2);
        expect(evaluateOperands(2, '1', '*')).toBe(2);
        expect(evaluateOperands('2', '1', '*')).toBe(2);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct quotient if both inputs are numbers using / operator', () => {
        expect(evaluateOperands(2, 1, '/')).toBe(2);
        expect(evaluateOperands(2.0, 1, '/')).toBe(2.0);
        expect(evaluateOperands(2.5, 0.5, '/')).toBe(5);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return correct quotient even if some inputs are strings using / operator', () => {
        expect(evaluateOperands('2', 1, '/')).toBe(2);
        expect(evaluateOperands(2, '1', '/')).toBe(2);
        expect(evaluateOperands('2', '1', '/')).toBe(2);
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if second input is 0 using / operator', () => {
        expect(() => {
            evaluateOperands(2, 0, '/');
        }).toThrow('Division by zero');
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if first number is less than the second number using < operator', () => {
        expect(evaluateOperands(1, 2, '<')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if first number is not less than the second number using < operator', () => {
        expect(evaluateOperands(2, 1, '<')).toBe(0);
        expect(evaluateOperands(1, 1, '<')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if any input is not a number using < operator', () => {
        expect(() => {
            evaluateOperands('2', 1, '<');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands(2, '1', '<');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands('2', '1', '<');
        }).toThrow('Invalid operand type for comparison');
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if second number is less than the first number using > operator', () => {
        expect(evaluateOperands(2, 1, '>')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if first number is not less than the second number using > operator', () => {
        expect(evaluateOperands(1, 2, '>')).toBe(0);
        expect(evaluateOperands(1, 1, '>')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if any input is not a number using > operator', () => {
        expect(() => {
            evaluateOperands('2', 1, '>');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands(2, '1', '>');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands('2', '1', '>');
        }).toThrow('Invalid operand type for comparison');
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if first number is less than or equal to the second number using <= operator', () => {
        expect(evaluateOperands(1, 1, '<=')).toBe(1);
        expect(evaluateOperands(1, 2, '<=')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if first number is not less than or equal to the second number using <= operator', () => {
        expect(evaluateOperands(2, 1, '<=')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if any input is not a number using <= operator', () => {
        expect(() => {
            evaluateOperands('2', 1, '<=');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands(2, '1', '<=');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands('2', '1', '<=');
        }).toThrow('Invalid operand type for comparison');
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 1 if second number is less than or equal to the first number using >= operator', () => {
        expect(evaluateOperands(1, 1, '>=')).toBe(1);
        expect(evaluateOperands(2, 1, '>=')).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should return 0 if second number is not less than or equal to the first number using >= operator', () => {
        expect(evaluateOperands(0, 1, '>=')).toBe(0);
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if any input is not a number using <= operator', () => {
        expect(() => {
            evaluateOperands('2', 1, '>=');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands(2, '1', '>=');
        }).toThrow('Invalid operand type for comparison');
        expect(() => {
            evaluateOperands('2', '1', '>=');
        }).toThrow('Invalid operand type for comparison');
    });

    /** Ownership: @author EmilyFink474 */
    test('should throw error if operator is not supported', () => {
        expect(() => {
            evaluateOperands(2, 1, '^');
        }).toThrow('Unsupported operator');
    })
});