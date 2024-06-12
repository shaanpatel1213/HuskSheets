// src/App.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from '../App';
import { MemoryRouter, Router } from 'react-router-dom';

jest.mock('./Components/Login', () => ({
  Login: () => {
    const history = require('react-router-dom').useHistory();
    return (
      <div> Login Component
        <button onClick={() => history.push('/home')}>Go to Home</button>
      </div>);
  },
}));
jest.mock('./Components/HomePage', () => ({
  HomePage: () => {
    const history = require('react-router-dom').useHistory();
    return (
    <div> HomePage Component
      <button onClick={() => history.push("/spreadsheet/mockPublisher/mockName/mockId/false")}>Go to Spreadsheet</button>
    </div>);
  },
}));
jest.mock('./Components/Spreadsheet', () => ({
  Spreadsheet: () => {
    const history = require('react-router-dom').useHistory();
    return (<div> Spreadsheet Component</div>);
  },
}));

// Ownership: Emily Fink
describe('App Component', () => {
  test('renders all the paths correctly', () => {
    // renders at the Login path
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText('Login Component')).toBeDefined();

    // goes to the HomePage path
    const homePageButton = screen.queryByRole('button', {name: 'Go to Home'}) as HTMLElement;
    fireEvent.click(homePageButton);
    expect(screen.getByText('HomePage Component')).toBeDefined();

    // goes to Spreadsheet path
    const spreadsheetButton = screen.queryByRole('button', {name: 'Go to Spreadsheet'}) as HTMLElement;
    fireEvent.click(spreadsheetButton);
    expect(screen.getByText('Spreadsheet Component')).toBeDefined();
  })
})