// src/tests/parsing.test.tsx
import { TableData } from '../Utilities/types';
import {
    parseAndEvaluateExpression,
    parseExpression,
    parseOperatorMatch,
    parseOperand,
    evaluateExpression
    //evaluateFunction,
    //evaluateRange
} from '../Utilities/parsing';

const data: TableData = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];

describe('parseAndEvaluateExpression function', () => {
    const data: TableData = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ];

    test('should correctly parse and evaluate SUM function', () => {
        expect(parseAndEvaluateExpression('SUM(1,2,3)', data)).toBe('6');
    });

    test('should correctly parse and evaluate MIN function', () => {
        expect(parseAndEvaluateExpression('MIN(3,1,2)', data)).toBe('1');
    });

    test('should correctly parse and evaluate MAX function', () => {
        expect(parseAndEvaluateExpression('MAX(3,1,2)', data)).toBe('3');
    });

    test('should correctly parse and evaluate AVG function', () => {
        expect(parseAndEvaluateExpression('AVG(3,1,2)', data)).toBe('2');
    });

    test('should correctly parse and evaluate CONCAT function', () => {
        expect(parseAndEvaluateExpression('CONCAT(hello,world)', data)).toBe('helloworld');
    });

    test('should correctly parse and evaluate IF function', () => {
        expect(parseAndEvaluateExpression('IF(1,true,false)', data)).toBe('true');
    });

    test('should correctly parse and evaluate nested IF function', () => {
        expect(parseAndEvaluateExpression('IF(0,true,IF(1,true,false))', data)).toBe('true');
    });

    test('should correctly parse and evaluate DEBUG function', () => {
        expect(parseAndEvaluateExpression('DEBUG(1)', data)).toBe('1');
    });

    test('should correctly parse and evaluate COPY function', () => {
        expect(parseAndEvaluateExpression('COPY($A1,"$B1")', data)).toBe('1');
    });

    test('should correctly return error if given non-supported function', () => {
        expect(parseAndEvaluateExpression('FAKE(1)', data)).toBe('ERROR');
    });

    test('should correctly parse and evaluate - operator', () => {
        expect(parseAndEvaluateExpression('2-1', data)).toBe('1');
    });
});

describe('parseExpression function', () => {
    test('should correctly parse a number', () => {
        expect(parseExpression('2')).toStrictEqual({ "value": 2 });
    })

    test('should correctly parse a logical operator', () => {
        expect(parseExpression('2-1')).toStrictEqual({ x: 2, y: 1, operator: '-' });
    })

    test('should correctly parse a logical operator in parantheses', () => {
        expect(parseExpression('(2-1)')).toStrictEqual({ x: 2, y: 1, operator: '-' });
    })

    // does this make sense?
    test('should correctly parse a range with functions', () => {
        expect(parseExpression('$A1:SUM(1,2,3)')).toStrictEqual({
            startRef: '$A1',
            endRef: 'SUM(1,2,3)',
            isRangeWithFunc: true
        });
    })

    test('should correctly throw error if given invalid expression format', () => {
        expect(() => {
            parseExpression('((2*3)');
        }).toThrow('Invalid expression format');
    });
})

describe('parseOperatorMatch function', () => {
    test('correctly parses an operator', () => {
        const expression = '2*2';
        const match = expression.match(
            /^\s*(\(.+\)|\$?[A-Z]+\d*|[-+]?\d*\.?\d+)\s*([=<>|&:/*+-])\s*(\(.+\)|\$?[A-Z]+\d*|[-+]?\d*\.?\d+)\s*$/
        );
        if (match) {
            expect(parseOperatorMatch(match)).toStrictEqual({ x: 2, y: 2, operator: '*' });
        };
    })
})

describe('parseOperand function', () => {
    test('correctly parses an operand with a nested expression', () => {
        expect(parseOperand('(2*3)')).toBe(6);
    })

    test('correctly parses a number', () => {
        expect(parseOperand('2')).toBe(2);
    })

    test('correctly parses a cell Ref', () => {
        expect(parseOperand('$A1')).toBe('$A1');
    })

    test('should correctly throw error if given invalid operand format', () => {
        expect(() => {
            parseOperand('hi');
        }).toThrow('Invalid operand format');
    });
})

describe('evaluateExpression function', () => {
    test('should correctly evaluate SUM function', () => {
        const parsedExpression = { func: 'SUM', args: ['1', '2', '3'] };
        expect(evaluateExpression(parsedExpression, data)).toBe(6);
    });

    test('should correctly evaluate MIN function', () => {
        const parsedExpression = { func: 'MIN', args: ['3', '1', '2'] };
        expect(evaluateExpression(parsedExpression, data)).toBe(1);
    });

    test('should correctly evaluate MAX function', () => {
        const parsedExpression = { func: 'MAX', args: ['3', '1', '2'] };
        expect(evaluateExpression(parsedExpression, data)).toBe(3);
    });

    test('should correctly evaluate AVG function', () => {
        const parsedExpression = { func: 'AVG', args: ['3', '1', '2'] };
        expect(evaluateExpression(parsedExpression, data)).toBe(2);
    });

    test('should correctly evaluate CONCAT function', () => {
        const parsedExpression = { func: 'CONCAT', args: ['hello', ' ', 'world'] };
        expect(evaluateExpression(parsedExpression, data)).toBe('hello world');
    });

    test('should correctly evaluate IF function', () => {
        const parsedExpression = { func: 'IF', args: ['1', 'true', 'false'] };
        expect(evaluateExpression(parsedExpression, data)).toBe('true');
    });

    test('should correctly evaluate nested IF function', () => {
        const parsedExpression = { func: 'IF', args: ['0', 'true', 'IF(1,true,false)'] };
        expect(evaluateExpression(parsedExpression, data)).toBe('true');
    });

    test('should correctly evaluate DEBUG function', () => {
        const parsedExpression = { func: 'DEBUG', args: ['1'] };
        expect(evaluateExpression(parsedExpression, data)).toBe('1');
    });

    test('should correctly evaluate COPY function', () => {
        const parsedExpression = { func: 'COPY', args: ['$A1', '"$B1"'] };
        expect(evaluateExpression(parsedExpression, data)).toBe('1');
    });

    test('should correctly throw error if given non supported function', () => {
        const parsedExpression = { func: 'FAKE', args: ['1', '1'] };
        expect(() => {
            evaluateExpression(parsedExpression, data);
        }).toThrow('Function not supported');
    });

    test('should correctly evaluate an operator', () => {
        const parsedExpression = { x: 2, y: 1, operator: '-' };
        expect(evaluateExpression(parsedExpression, data)).toBe(1);
    });
});
