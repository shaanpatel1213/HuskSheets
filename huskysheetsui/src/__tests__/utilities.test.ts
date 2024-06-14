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
    })

    test('correctly returns value of cell when resolveOperand is given a cell', () => {
        expect(resolveOperand('$A1', data)).toBe(1);
    })

    test('correctly returns value of cell when resolveOperand is given a formula', () => {
        expect(resolveOperand('=2*3', data)).toBe('6');
    })
});

describe('resolveCellReference function', () => {
    test('correctly returns value of a given cell', () => {
        expect(resolveCellReference('$A2', data)).toBe(4);
    })
});

describe('parseCellReference function', () => {
    
});

describe('getRangeFromReference function', () => {
    
});

describe('colToIndex function', () => {
    test('correctly returns the column number', () => {
        expect(colToIndex('$A')).toBe(0);
    })
});

describe('isRef function', () => {
    test('correctly checks if given parameter is a Ref', () => {
        expect(isRef({row: 1, col: 2})).toBe(true);
    });
});