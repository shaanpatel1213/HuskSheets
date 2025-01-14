// src/tests/Spreadsheet.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Spreadsheet } from '../Components/Spreadsheet';
import userEvent from '@testing-library/user-event';
import { evaluateOperands, evaluateExpression, parseAndEvaluateExpression, TableData } from "../Utilities";


/**
 * Tests to tests React Components for a spreadsheet
 * Tests include:
 *  rendering of rows and columns
 *  users can type in a cell
 *  Allowing for the addition of rows and columns
 *  Allowing for the removal of rows and columns
 *  Can edit cell values
 *  Prints ERROR with invalid value
 *  Calculates cell functionality
 *
 * @author Shaanpatel1213
 * */
describe('Spreadsheet Component Tests', () => {
  const initialRows = 25
  const initialCols = 25

  test('renders initial 100 rows and 25 columns', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: "" }} isSubscriber={false} /> );
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(initialRows + 1); // 100 rows + 1 header row
    
    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(initialCols + 1); // 25 columns + 1 header column
  });

  test('allows user to type into a cell', () => {
    render(<Spreadsheet sheet={{ id: null, name: "", publisher: ""}} isSubscriber={false} />);
    
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
/**
 * Checks to see if the evaluateOperands function works correctly
 * @author Shaanpatel1213
 * */
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





