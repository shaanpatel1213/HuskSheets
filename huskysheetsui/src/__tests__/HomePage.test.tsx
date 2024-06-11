import React from 'react';
import { render, screen, fireEvent, waitFor, getByRole, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { HomePage } from '../Components/HomePage';
import { createSheet, getSheets, deleteSheet, getPublishers, register } from '../Utilities/utils';
import '@testing-library/jest-dom';

jest.setTimeout(10000);

jest.mock('../Utilities/utils');
const mockCreateSheet = createSheet as jest.Mock;
const mockDeleteSheet = deleteSheet as jest.Mock;
const mockGetSheet = getSheets as jest.Mock;
const mockGetPublishers = getPublishers as jest.Mock;
const mockRegister = register as jest.Mock;

const mockSheets = [ { id: 'sheet1', name: 'Sheet 1' },  { id: 'sheet2', name: 'Sheet 2' }, ];
const mockUserName = 'team18';
const mockPublisher = [{"publisher": "team3"}, {"publisher": "team18"}]

// written by: Emily Fink


// written by: Emily Fink
describe('Errors', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    test('checks register error', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);

        expect(screen.queryByText('Register as Publisher')).toBeInTheDocument();

        // clicks register button and expect it to fail and should put up correct error message
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(screen.getByText('Failed to register')).toBeDefined();
        })
    })

    test('checks get sheets error', async () => {
        mockRegister.mockResolvedValue({ success: true });

        render(<MemoryRouter><HomePage /></MemoryRouter>);

        // clicks register button and expect it to pass but getSheets should fail and should put up correct error message
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to fetch sheets')).toBeDefined();
        });
    })

    test('checks get publisher error', async () => {
        mockRegister.mockResolvedValue({ success: true });
        mockGetSheet.mockResolvedValue({ success: true, value: mockSheets });

        render(<MemoryRouter><HomePage /></MemoryRouter>);

                // clicks register button and expect it to pass but getPublishers should fail and should put up correct error message
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockGetPublishers).toBeCalledTimes(1);
            expect(screen.getByText('Failed to fetch publishers')).toBeDefined();
        });
    })
})

