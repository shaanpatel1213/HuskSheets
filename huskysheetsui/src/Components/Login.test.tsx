import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Login } from './Login'; // Adjust the path as needed

jest.mock('../Utilies/spreadsheets', () => ({
    getPublishers: jest.fn(() => ['testuser']), // Mock the getPublishers function
    register: jest.fn()
}));

describe('Login component', () => {
    it('renders the login form', () => {
        render(<Login />);
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('shows error message when fields are empty and form is submitted', () => {
        render(<Login />);
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(screen.getByText(/please fill in both fields/i)).toBeInTheDocument();
    });

    it('navigates to home on successful login', () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(history.location.pathname).toBe('/home');
    });


});
