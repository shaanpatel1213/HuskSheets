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
describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('check Home Page renders correctly', async () => {
        mockRegister.mockResolvedValue({ success: true });
        mockGetPublishers.mockResolvedValue({ success: true, value: mockPublisher });
        mockGetSheet.mockResolvedValue({ success: true, value: mockSheets });
        mockCreateSheet.mockResolvedValue({ success: true });
        mockDeleteSheet.mockResolvedValue({ success: true });

        // renders the home page
        render(<MemoryRouter><HomePage /></MemoryRouter>);

        expect(screen.queryByText('HomePage')).toBeInTheDocument();
        expect(screen.queryByText('Register as Publisher')).toBeInTheDocument();

        // click the register button
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(3);
            expect(mockGetSheet).toBeCalledWith(mockUserName);
            expect(mockGetPublishers).toBeCalledTimes(1);
        });
        expect(screen.queryByText('Sheet 1'));
        expect(screen.queryByText('Sheet 2'));
        expect(screen.queryByText('team3'));
        expect(screen.queryByText('team18'));

        // click the 'Create Sheet' button to create a new sheet
        expect(screen.queryByText('Create Sheet')).toBeInTheDocument();
        const createButton = screen.getByRole('button', {name: 'Create Sheet'});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(4);
        })

        // write a name to be assigned to a new sheet
        const newSheetName = screen.getByPlaceholderText("Enter new sheet name") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newSheetName, { target: { value: 'New Sheet' }});
        });
        expect(newSheetName.value).toEqual('New Sheet');

        // click the '+' button to create a new sheet with the assiged name
        expect(screen.queryByText('+')).toBeInTheDocument();
        const createButtonPlus = screen.getByRole('button', {name: '+'});
        fireEvent.click(createButtonPlus);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(2);
        });
        expect(screen.queryByText('New Sheet'));

        // click the delete button
        const deleteButton = screen.queryAllByRole('button', {name: 'X'});
        expect(deleteButton).toBeDefined();
        fireEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(mockDeleteSheet).toBeCalledTimes(1);
        })
    })
})

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

    test('checks create sheet and delete sheet error', async () => {
        mockRegister.mockResolvedValue({ success: true });
        mockGetSheet.mockResolvedValue({ success: true, value: mockSheets });
        mockGetPublishers.mockResolvedValue({ success: true, value: mockPublisher });

        render(<MemoryRouter><HomePage /></MemoryRouter>);

        // click register button
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(3);
            expect(mockGetSheet).toBeCalledWith(mockUserName);
            expect(mockGetPublishers).toBeCalledTimes(1);
        })

        // click 'Create Sheet' and expect it to fail and put up correct error message
        const createButton = screen.getByRole('button', {name: 'Create Sheet'});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        })

        // click '+' and expect it to fail and put up correct error message
        const createButtonPlus = screen.getByRole('button', {name: '+'});
        fireEvent.click(createButtonPlus);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(2);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        })

        // click the delete button and expect it to fail and put up correct error message
        const deleteButton = screen.getAllByRole('button', {name: 'X'});
        fireEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(mockDeleteSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to delete sheet')).toBeDefined();
        })
    })
})

