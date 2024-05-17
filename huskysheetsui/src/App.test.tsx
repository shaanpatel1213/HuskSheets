import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('renders the App component', () => {
  const { getByText } = render(<App />);
  const headerElement = getByText(/Spreadsheet/i);
  expect(headerElement).toBeInTheDocument();
});