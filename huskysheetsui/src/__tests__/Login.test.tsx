import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Components/Login'; // Adjust the path as needed
import { handleSubmit } from '../componentHelpers/loginHelpers';

const mockUsername = 'team18';
const mockPassword = 'qdKoHqmiP@6x`_1Q';
const mockWrongUsername = 'groovydude';
const mockWrongPassword = '1234';

describe('Login', () => {
    test('check login renders correctly', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.queryAllByText('Login')).toBeDefined();

        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newUsername.value).toEqual(mockUsername);
        expect(newPassword.value).toEqual(mockPassword);

        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
    })

    test('check login renders error correctly when missing username', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newPassword.value).toEqual(mockPassword);

        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Please fill in both fields')).toBeDefined();
        })
    })

    test('check login renders error correctly when missing password', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
        });
        expect(newUsername.value).toEqual(mockUsername);

        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Please fill in both fields')).toBeDefined();
        })
    })

    test('check login renders error correctly with wrong username', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.queryAllByText('Login')).toBeDefined();

        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockWrongUsername }});
            fireEvent.change(newPassword, { target: { value: mockPassword }});
        });
        expect(newUsername.value).toEqual(mockWrongUsername);
        expect(newPassword.value).toEqual(mockPassword);

        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Incorrect username or password')).toBeDefined();
        })
    })

    test('check login renders error correctly with wrong password', async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.queryAllByText('Login')).toBeDefined();

        const newUsername = screen.getByLabelText("Username:") as HTMLInputElement;
        const newPassword = screen.getByLabelText("Password:") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newUsername, { target: { value: mockUsername }});
            fireEvent.change(newPassword, { target: { value: mockWrongPassword }});
        });
        expect(newUsername.value).toEqual(mockUsername);
        expect(newPassword.value).toEqual(mockWrongPassword);

        const loginButton = screen.getByRole('button', {name: 'Login'});
        fireEvent.click(loginButton);
        await waitFor(() => {
            expect(screen.getByText('Incorrect username or password')).toBeDefined();
        })
    })
})