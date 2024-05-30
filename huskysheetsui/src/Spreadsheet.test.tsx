// src/Spreadsheet.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Spreadsheet from './Spreadsheet';
import { evaluate } from "./Spreadsheet"




describe('Spreadsheet Component', () => {
  test('renders initial 10 rows and 10 columns', () => {
    render(<Spreadsheet />);

    // Check that there are 10 rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(11); // 10 rows + 1 header row

    // Check that there are 10 columns
    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(11); // 10 cols + 1 header col
  });

  test('allows user to type into a cell', () => {
    render(<Spreadsheet />);

    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: 'test' } });
    expect(firstCell).toHaveValue('test');
  });

  test('adds a row when "Add Row" button is clicked', () => {
    render(<Spreadsheet />);

    const addButton = screen.getByText('Add Row');
    fireEvent.click(addButton);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(12); // 11 rows + 1 header row
  });

  test('removes a row when "Remove Row" button is clicked', () => {
    render(<Spreadsheet />);

    const removeButton = screen.getByText('Remove Row');
    fireEvent.click(removeButton);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(10); // 9 rows + 1 header row
  });

  test('adds a column when "Add Column" button is clicked', () => {
    render(<Spreadsheet />);

    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);

    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(12); // 11 + 1
  });

  test('removes a column when "Remove Column" button is clicked', () => {
    render(<Spreadsheet />);

    const removeButton = screen.getByText('Remove Column');
    fireEvent.click(removeButton);

    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(10); // 11 - 1
  });

  test('can edit cell values', () => {
    render(<Spreadsheet />);

    const firstCell = screen.getAllByRole('textbox', { name: '' })[0];
    fireEvent.change(firstCell, { target: { value: 'test' } });
    expect(firstCell).toHaveValue('test');
  });
  test('returns ERROR for invalid cell reference in formula', () => {
    render(<Spreadsheet />);
    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: '=A11' } }); // A11 does not exist in initial 10x10 grid
    fireEvent.blur(firstCell);
    expect(firstCell).toHaveValue('ERROR');
  });


  test('calculates the cell value correctly when a formula is entered', () => {
    render(<Spreadsheet />);
    const firstCell = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstCell, { target: { value: '=2+2' } });
    fireEvent.blur(firstCell);
    expect(firstCell).toHaveValue('4');
  });


});

describe('evaluate function', () => {

  test('should return 1 for equal numbers using = operator', () => {
    expect(evaluate(5, 5, '=')).toBe(1);
  });

  test('should return 0 for non-equal numbers using = operator', () => {
    expect(evaluate(5, 10, '=')).toBe(0);
  });

  test('should return 1 for equal strings using = operator', () => {
    expect(evaluate('hello', 'hello', '=')).toBe(1);
  });

  test('should return 0 for non-equal strings using = operator', () => {
    expect(evaluate('hello', 'world', '=')).toBe(0);
  });

  test('should return 1 for non-equal numbers using <> operator', () => {
    expect(evaluate(5, 10, '<>')).toBe(1);
  });

  test('should return 0 for equal numbers using <> operator', () => {
    expect(evaluate(5, 5, '<>')).toBe(0);
  });

  test('should return 1 for non-equal strings using <> operator', () => {
    expect(evaluate('hello', 'world', '<>')).toBe(1);
  });

  test('should return 0 for equal strings using <> operator', () => {
    expect(evaluate('hello', 'hello', '<>')).toBe(0);
  });

  test('should return 1 if both numbers are not 0 using & operator', () => {
    expect(evaluate(1, 1, '&')).toBe(1);
  });

  test('should return 0 if any number is 0 using & operator', () => {
    expect(evaluate(1, 0, '&')).toBe(0);
    expect(evaluate(0, 1, '&')).toBe(0);
    expect(evaluate(0, 0, '&')).toBe(0);
  });

  test('should return 1 if any number is 1 using | operator', () => {
    expect(evaluate(1, 1, '|')).toBe(1);
    expect(evaluate(1, 0, '|')).toBe(1);
    expect(evaluate(0, 1, '|')).toBe(1);
  });

  test('should return 0 if both numbers are 0 using | operator', () => {
    expect(evaluate(0, 0, '|')).toBe(0);
  });

  test('should return the range if both refs are valid and x <= y using : operator', () => {
    expect(evaluate({ row: 1, col: 1 }, { row: 1, col: 2 }, ':')).toBe('Range from (1, 1) to (1, 2)');
    expect(evaluate({ row: 1, col: 1 }, { row: 2, col: 1 }, ':')).toBe('Range from (1, 1) to (2, 1)');
  });

  test('should throw error if refs are not in order using : operator', () => {
    expect(() => evaluate({ row: 2, col: 1 }, { row: 1, col: 1 }, ':')).toThrow('Invalid operands for ":" operation');
    expect(() => evaluate({ row: 1, col: 2 }, { row: 1, col: 1 }, ':')).toThrow('Invalid operands for ":" operation');
  });

});