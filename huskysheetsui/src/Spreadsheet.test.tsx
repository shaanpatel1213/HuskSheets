// src/Spreadsheet.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Spreadsheet from './Spreadsheet';


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
});
