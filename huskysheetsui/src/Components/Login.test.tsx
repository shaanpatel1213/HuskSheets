import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login'; // Adjust the path as needed

const mockUsername = 'team18';
const mockPassword = 'qdKoHqmiP@6x`_1Q';
const mockWrongUsername = 'groovydude';
const mockWrongPassword = '1234';

// written by: Emily Fink
describe('Login', () => {
    test('check login renders correctly', async () => {
        // renders the login page
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.queryAllByText('Login')).toBeDefined();

        // change the username and password
        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newUsername.value).toEqual(mockUsername);
        expect(newPassword.value).toEqual(mockPassword);

        // click the login button
        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
    })
})

// written by: Emily Fink
describe('Errors', () => {
    test('check login renders error correctly when missing username', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        // adds a password
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newPassword.value).toEqual(mockPassword);

        // click login button and expect a prompt to fill in both fields due to missing username
        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Please fill in both fields')).toBeDefined();
        })
    })

    test('check login renders error correctly when missing password', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        // adds a username
        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
        });
        expect(newUsername.value).toEqual(mockUsername);

        // click login button and expect a prompt to fill in both fields due to missing password
        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Please fill in both fields')).toBeDefined();
        })
    })

    test('check login renders error correctly with wrong username', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        // change username and password but with an incorrect username
        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockWrongUsername }});
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newUsername.value).toEqual(mockWrongUsername);
        expect(newPassword.value).toEqual(mockPassword);

        // click login button and expect a prompt that says a field is incorrect due to wrong username
        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Incorrect username or password')).toBeDefined();
        })
    })

    test('check login renders error correctly with wrong password', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.queryAllByText('Login')).toBeDefined();

        // change username and password but with an incorrect password
        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
            fireEvent.change(newPassword, { target: { value: mockWrongPassword }});
        });
        expect(newUsername.value).toEqual(mockUsername);
        expect(newPassword.value).toEqual(mockWrongPassword);

        // click login button and expect a prompt that says a field is incorrect due to wrong password
        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Incorrect username or password')).toBeDefined();
        })
    })
})
