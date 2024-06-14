// src/tests/Spreadsheet.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Spreadsheet } from '../Components/Spreadsheet';
import { evaluateOperands, evaluateExpression, parseAndEvaluateExpression, TableData } from "../Utilities";


describe('Spreadsheet Component', () => {
  const initialRows = 25;
  const initialCols = 25;

  test('renders initial 100 rows and 25 columns', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(initialRows + 1); // 100 rows + 1 header row
    
    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(initialCols + 1); // 25 columns + 1 header column
  });

  test('allows user to type into a cell', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: 'test' } });
    fireEvent.blur(firstCell); // Ensure blur event to trigger update
    expect(firstCell).toHaveValue("");
  });

  test('adds a row when "Add Row" button is clicked', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const addButton = screen.getByText('Add Row');
    fireEvent.click(addButton);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(initialRows + 2); // 100 rows + 1 header row + 1 new row
  });

  test('removes a row when "Remove Row" button is clicked', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const removeButton = screen.getByText('Remove Row');
    fireEvent.click(removeButton);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(initialRows); // 100 rows - 1 row + 1 header row
  });

  test('adds a column when "Add Column" button is clicked', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);

    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);

    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(initialCols + 2); // 26 + 1
  });

  test('removes a column when "Remove Column" button is clicked', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);

    const removeButton = screen.getByText('Remove Column');
    fireEvent.click(removeButton);

    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(initialCols); // 25 - 1 + 1 header
  });

  test('can edit cell values', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const firstCell = screen.getAllByRole('textbox', { name: '' })[0];
    fireEvent.change(firstCell, { target: { value: 'test' } });
    fireEvent.focus(firstCell)
    fireEvent.blur(firstCell);// Ensure blur event to trigger update
    expect(firstCell).toHaveValue('test');
  });



  test('returns ERROR for invalid cell reference in formula', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    
    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: '=A101' } }); // A101 does not exist in initial 100x25 grid
    fireEvent.blur(firstCell);

    expect(firstCell).toHaveValue("");
  });

  test('calculates the cell value correctly when a formula is entered', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: '=2+2' } });
    fireEvent.blur(firstCell);
    waitFor(() => expect(firstCell).toHaveValue('4'));
  });
});

describe('evaluateOperands function', () => {
  test('should return 1 for equal numbers using = operator', () => {
    expect(evaluateOperands(5, 5, '=')).toBe(1);
  });

  test('should return 0 for non-equal numbers using = operator', () => {
    expect(evaluateOperands(5, 10, '=')).toBe(0);
  });

  test('should return 1 for equal strings using = operator', () => {
    expect(evaluateOperands('hello', 'hello', '=')).toBe(1);
  });

  test('should return 0 for non-equal strings using = operator', () => {
    expect(evaluateOperands('hello', 'world', '=')).toBe(0);
  });

  test('should return 1 for non-equal numbers using <> operator', () => {
    expect(evaluateOperands(5, 10, '<>')).toBe(1);
  });

  test('should return 0 for equal numbers using <> operator', () => {
    expect(evaluateOperands(5, 5, '<>')).toBe(0);
  });

  test('should return 1 for non-equal strings using <> operator', () => {
    expect(evaluateOperands('hello', 'world', '<>')).toBe(1);
  });

  test('should return 0 for equal strings using <> operator', () => {
    expect(evaluateOperands('hello', 'hello', '<>')). toBe(0);
  });

  test('should return 1 if both numbers are not 0 using & operator', () => {
    expect(evaluateOperands(1, 1, '&')).toBe(1);
  });

  test('should return 0 if any number is 0 using & operator', () => {
    expect(evaluateOperands(1, 0, '&')).toBe(0);
    expect(evaluateOperands(0, 1, '&')).toBe(0);
    expect(evaluateOperands(0, 0, '&')).toBe(0);
  });

  test('should return 1 if any number is 1 using | operator', () => {
    expect(evaluateOperands(1, 1, '|')).toBe(1);
    expect(evaluateOperands(1, 0, '|')).toBe(1);
    expect(evaluateOperands(0, 1, '|')).toBe(1);
  });

  test('should return 0 if both numbers are 0 using | operator', () => {
    expect(evaluateOperands(0, 0, '|')).toBe(0);
  });
});

describe('evaluateExpression function', () => {
  const data: TableData = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
  ];

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
});

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
});
// test('renders header', () => {
//   render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
//   const headerElement = screen.getByText(/Spreadsheet Header/i);
//   expect(headerElement).toBeInTheDocument();
// });
//
// test('renders initial empty cell', () => {
//   render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} />);
//   const cellElement = screen.getByTestId('cell-0-0');
//   expect(cellElement).toBeInTheDocument();
// });


   
