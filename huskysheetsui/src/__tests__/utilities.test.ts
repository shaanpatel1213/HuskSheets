import { TableData } from '../Utilities/types';
import {
    resolveOperand,
    resolveCellReference,
    parseCellReference,
    getRangeFromReference,
    colToIndex,
    isRef
} from '../Utilities/utilities';

const data: TableData = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];

describe('resolveOperand function', () => {
    test('correctly returns number when resolveOperand is given a number', () => {
        expect(resolveOperand(2, data)).toBe(2);
    });

    test('correctly returns value of cell when resolveOperand is given a cell', () => {
        expect(resolveOperand('$A1', data)).toBe(1);
    });

    test('correctly returns value of cell when resolveOperand is given a formula', () => {
        expect(resolveOperand('=2*3', data)).toBe('6');
    });

    test('correctly returns value of cell when resolveOperand is given a reference', () => {
        expect(resolveOperand({ row: 1, col: 2 }, data)).toBe('6');
    });
});

describe('resolveCellReference function', () => {
    test('correctly returns value of a given cell', () => {
        expect(resolveCellReference('$A2', data)).toBe(4);
        expect(resolveCellReference('A2', data)).toBe(4);
    });

    test('correctly returns given string when it is not a cell reference', () => {
        expect(resolveCellReference('hi', data)).toBe('hi');
    });

    test('correctly returns ERROR when given impossible cell reference', () => {
        expect(resolveCellReference('$A0', data)).toBe('ERROR');
    });
});

describe('parseCellReference function', () => {
    test('correctly returns correct row and column give a cell reference', () => {
        expect(parseCellReference('$A1')).toStrictEqual({ row: 0, col: 0 });
    });

    test('correctly throws error when given an invalid cell reference', () => {
        expect(() => {
            parseCellReference('$1A');
        }).toThrow('Invalid cell reference');
    });
});

describe('getRangeFromReference function', () => {
    test('correctly returns the values of a given range of cells', () => {
        expect(getRangeFromReference('$A1:$A3', data)).toStrictEqual(['1', '4', '7']);
    });

    test('correctly throws error when given an invalid range format', () => {
        expect(() => {
            getRangeFromReference('$A1-$A3', data);
        }).toThrow('Invalid range format');
    });
});

describe('colToIndex function', () => {
    test('correctly returns the column number', () => {
        expect(colToIndex('$A')).toBe(0);
    })
});

describe('isRef function', () => {
    test('correctly checks if given parameter is a Ref', () => {
        expect(isRef({ row: 1, col: 2 })).toBe(true);
    });
});