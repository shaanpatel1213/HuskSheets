// src/App.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

describe('App Component', () => {
  test('renders the App component with initial sheet', () => {
    render(<App />);
    const headerElement = screen.getByText(/React Spreadsheet/i);
    expect(headerElement).toBeInTheDocument();

    const initialSheet = screen.getByText(/Sheet 1/i);
    expect(initialSheet).toBeInTheDocument();
  });

  test('adds a new sheet when "+" button is clicked', () => {
    render(<App />);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    const newSheet = screen.getByText(/Sheet 2/i);
    expect(newSheet).toBeInTheDocument();
  });

  test('removes a sheet when "x" button is clicked', () => {
    render(<App />);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    const removeButton = screen.getAllByText('x')[0];
    fireEvent.click(removeButton);

    const removedSheet = screen.queryByText(/Sheet 1/i);
    expect(removedSheet).not.toBeInTheDocument();
  });

  test('switches between sheets when tabs are clicked', () => {
    render(<App />);
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    const sheet1Tab = screen.getByText(/Sheet 1/i);
    const sheet2Tab = screen.getByText(/Sheet 2/i);

    fireEvent.click(sheet2Tab);
    expect(sheet2Tab).toHaveClass('active');
    expect(sheet1Tab).not.toHaveClass('active');

    fireEvent.click(sheet1Tab);
    expect(sheet1Tab).toHaveClass('active');
    expect(sheet2Tab).not.toHaveClass('active');
  });
});
