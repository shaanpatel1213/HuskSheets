import { TableData } from '../Utilities/types';
import {
    sumFunction,
    minFunction,
    maxFunction,
    avgFunction,
    concatFunction,
    ifFunction,
    debugFunction,
    // evaluateCondition,
    copyFunction
} from '../Utilities/functions';

const data: TableData = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];

describe('sumFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply sum function when given single cells', () => {
        expect(sumFunction(['$A1', '$B2', '$B1'], data)).toBe(8);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply sum function when given range of cells', () => {
        expect(sumFunction(['$A1:$A3'], data)).toBe(12);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply sum function when given numbers', () => {
        expect(sumFunction([1, 2, 3], data)).toBe(6);
    });
});

describe('minFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply min function when given single cells', () => {
        expect(minFunction(['$A1', '$B2', '$B1'], data)).toBe(1);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply min function when given range of cells', () => {
        expect(minFunction(['$B1:$B3'], data)).toBe(2);
        expect(minFunction(['$B1:$B3', '$A1'], data)).toBe(1);
        expect(minFunction(['$B1:$B3', '$B1'], data)).toBe(2);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply min function when given numbers', () => {
        // add more cases if needed
        expect(minFunction(['2', '3', '1'], data)).toBe(1);
    });
});

describe('maxFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply max function when given single cells', () => {
        expect(maxFunction(['$A1', '$B2', '$B1'], data)).toBe(5);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply max function when given range of cells', () => {
        expect(maxFunction(['$B1:$B3'], data)).toBe(8);
        expect(maxFunction(['$B1:$B3', '$C3'], data)).toBe(9);
        expect(maxFunction(['$B1:$B3', '$B3'], data)).toBe(8);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply max function when given numbers', () => {
        expect(maxFunction(['2', '3', '1'], data)).toBe(3);
    });
});

describe('avgFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply avg function when given single cells', () => {
        expect(avgFunction(['$A1', '$B2', '$B1'], data)).toBeCloseTo(2.666);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply avg function when given range of cells', () => {
        expect(avgFunction(['$B1:$B3'], data)).toBe(5);
        expect(avgFunction(['$B1:$B3', '$C3'], data)).toBe(6);
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply avg function when given numbers', () => {
        expect(avgFunction(['2', '3', '1'], data)).toBe(2);
    });
    // add when result is NaN
});

describe('concatFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply concat function when given single cells', () => {
        expect(concatFunction(['$A1', '$B2', '$B1'], data)).toBe('152');
    });

    // should we be able to concat ranges?
    // test('should correctly apply concat function when given range of cells', () => {
    //     expect(concatFunction(['$B1:$B3'], data)).toBe('258');
    //     expect(concatFunction(['$B1:$B3', '$C3'], data)).toBe('2589');
    // });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply concat function when given values', () => {
        expect(concatFunction(['2', '3', '1'], data)).toBe('231');
        expect(concatFunction(['hello', ' ', 'world'], data)).toBe('hello world');
        expect(concatFunction(['"2"', '3', '1'], data)).toBe('231');
    });
});

describe('ifFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply if function when given single cells', () => {
        expect(ifFunction(['$A1<$B2', 'true', 'false'], data)).toBe('true');
        expect(ifFunction(['$A1>$B2', 'true', 'false'], data)).toBe('false');
        //expect(ifFunction(['$A1<$B2', '$B2', '$B1'], data)).toBe('2'); should it return the value of $B2
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply if function when given numbers', () => {
        expect(ifFunction(['2<3', '1', '2'], data)).toBe('1');
        expect(ifFunction(['2>3', '1', '2'], data)).toBe('2');
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly throw error if not given three arguments', () => {
        expect(() => {
            ifFunction(['2<3', '1'], data);
        }).toThrow('IF function requires 3 arguments');
    });
});

describe('debugFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply debug function when given single cells', () => {
        expect(debugFunction(['$A1'], data)).toBe('1');
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly apply debug function when given values', () => {
        expect(debugFunction(['2'], data)).toBe('2');
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly throw error if not given one argument', () => {
        expect(() => {
            debugFunction(['2', '1'], data);
        }).toThrow('DEBUG function requires 1 argument');
    });
});

describe('copyFunction function', () => {
    /** Ownership: @author EmilyFink474 */
    test('should correctly apply copy function when given single cells', () => {
        expect(copyFunction(['$A1', '"$B1"'], data)).toBe('1');
        expect(data[0][1]).toBe('1');
    });

    /** Ownership: @author EmilyFink474 */
    test('should correctly throw error if not given two arguments', () => {
        expect(() => {
            copyFunction(['2'], data);
        }).toThrow('COPY function requires 2 arguments');
    });
});