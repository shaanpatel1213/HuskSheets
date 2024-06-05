import React from 'react';
import { render, screen, fireEvent, waitFor, getByRole, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { HomePage } from './HomePage';
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
const newSheetName = 'Sheet1';
const mockPublisher = [{"publisher": "team3"}, {"publisher": "team18"}]

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
        const {container} = render(<MemoryRouter><HomePage /></MemoryRouter>);

        expect(screen.queryByText('HomePage')).toBeInTheDocument();
        expect(screen.queryByText('Register as Publisher')).toBeInTheDocument();

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

        expect(screen.queryByText('Create Sheet')).toBeInTheDocument();
        const createButton = screen.getByRole('button', {name: 'Create Sheet'});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(4);
        })

        const newSheetName = screen.getByPlaceholderText("Enter new sheet name") as HTMLInputElement;
        await act(() => {
            fireEvent.change(newSheetName, { target: { value: 'New Sheet' }});
        });
        expect(newSheetName.value).toEqual('New Sheet');
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(2);
        });

        const deleteButton = screen.queryAllByRole('button', {name: 'X'});
        expect(deleteButton).toBeDefined();

        fireEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(mockDeleteSheet).toBeCalledTimes(1);
        })
    })



    // test('check if the register renders correctly', async () => {
    //     const {asFragment, container} = render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     expect(screen.queryByText('HomePage')).toBeInTheDocument();
    //     expect(screen.queryByText('Register as Publisher')).toBeInTheDocument();
    //     expect(screen.queryByText('Create Sheet')).not.toBeInTheDocument();
    //     expect(getSheets).toBeCalledTimes(0);
    //     expect(container.firstChild).toMatchSnapshot();
    //     const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
    //     fireEvent.click(registerButton);
    //     await waitFor(() => {
    //         expect(register).toBeCalledTimes(1);
    //         //expect(getSheets).toBeCalledTimes(2);
    //         expect(container.firstChild).toMatchSnapshot();
    //     });
    //     //expect(screen.queryByText('Create Sheet')).toBeInTheDocument();
    // })

    // test('check if the create sheet renders correctly', async () => {
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     expect(screen.queryByText('HomePage')).toBeInTheDocument();
    //     expect(screen.queryByText('Create Sheet')).toBeInTheDocument();
    //     expect(getSheets).toBeCalledTimes(1);
    //     const createButton = screen.getByRole("button", {name: "Create Sheet"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(getSheets).toBeCalledTimes(2);
    //         //expect(container.firstChild).toMatchSnapshot();
    //     });
    //     const links = screen.getAllByRole('link');
    //     expect(links).toHaveLength(2);
    //     expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
    //     expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');
    // })

    // test('check if the + renders correctly', async () => {
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     expect(screen.queryByText('HomePage')).toBeInTheDocument();
    //     expect(screen.queryByText('+')).toBeInTheDocument();
    //     expect(getSheets).toBeCalledTimes(1);
    //     const createButton = screen.getByRole("button", {name: "+"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(getSheets).toBeCalledTimes(2);
    //         //expect(container.firstChild).toMatchSnapshot();
    //     });
    //     const links = screen.getAllByRole('link');
    //     expect(links).toHaveLength(2);
    //     expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
    //     expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');
    // })

    // test('check if the create sheet renders the errors correctly', async () => {
    //     (createSheet as jest.Mock).mockResolvedValue({ success: false });
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     const createButton = screen.getByRole("button", {name: "Create Sheet"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(screen.getByText('Failed to create sheet')).toBeDefined();
    //     });
    // })

    // test('check if the + renders the errors correctly', async () => {
    //     (createSheet as jest.Mock).mockResolvedValue({ success: false });
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     const createButton = screen.getByRole("button", {name: "+"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(screen.getByText('Failed to create sheet')).toBeDefined();
    //     });
    // })

    // test('check if get sheet renders the error correctly', async () => {
    //     (getSheets as jest.Mock).mockResolvedValue({ success: false });
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     await waitFor(() => {
    //         expect(screen.getByText('Failed to fetch sheets')).toBeDefined();
    //     });
    // })

    // test('check if we can create a new sheet with the input name', async () => {
    //     render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     const newSheetName = screen.getByPlaceholderText("Enter new sheet name") as HTMLInputElement;
    //     await act(() => {
    //         fireEvent.change(newSheetName, { target: { value: 'New Sheet' }});
    //     });
    //     expect(newSheetName.value).toEqual('New Sheet');
    // })

    // // to be fixed: clicking a delete button deletes both created sheets :(, need to figure out how to click singular X button
    // test('check if delete sheet renders correctly', async () => {
    //     const {asFragment, container} = render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     expect(screen.queryByText('HomePage')).toBeInTheDocument();
    //     const createButton = screen.getByRole("button", {name: "Create Sheet"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(getSheets).toBeCalledTimes(2);
    //         //expect(container.firstChild).toMatchSnapshot();
    //     });
    //     const links = screen.getAllByRole('link');
    //     expect(links).toHaveLength(2);
    //     expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
    //     expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');

    //     const deleteButtons = screen.queryAllByText('X');
    //     expect(deleteButtons).toHaveLength(2);
    //     const firstDeleteButton = deleteButtons[0];
    //     const secondDeleteButton = deleteButtons[1];
    //     fireEvent.click(firstDeleteButton);
    //     await waitFor(() => {
    //         expect(deleteSheet).toBeCalledTimes(1);
    //         expect(firstDeleteButton).not.toBeInTheDocument();
    //         //expect(container.firstChild).toMatchSnapshot();
    //         //expect(secondDeleteButton).toBeInTheDocument();
    //     });
    // })

    // test('check if the delete sheet renders the errors correctly', async () => {
    //     (deleteSheet as jest.Mock).mockResolvedValue({ success: false });
    //     const {asFragment, container} = render(<MemoryRouter><HomePage /></MemoryRouter>);
    //     const createButton = screen.getByRole("button", {name: "Create Sheet"});
    //     fireEvent.click(createButton);
    //     await waitFor(() => {
    //         expect(createSheet).toBeCalledTimes(1);
    //         expect(getSheets).toBeCalledTimes(2);
    //     });
    //     const deleteButtons = screen.queryAllByText('X');
    //     expect(deleteButtons).toHaveLength(2);
    //     const firstDeleteButton = deleteButtons[0];
    //     fireEvent.click(firstDeleteButton);
    //     await waitFor(() => {
    //         expect(deleteSheet).toBeCalledTimes(1);
    //         expect(screen.getByText('Failed to delete sheet')).toBeDefined();
    //     });
    // })
})

describe('Errors', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // mockCreateSheet.mockClear();
        // mockDeleteSheet.mockClear();
        // mockGetSheet.mockClear();
        // mockGetPublishers.mockReset();
        // mockRegister.mockReset();
    })

    test('checks register error', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);

        expect(screen.queryByText('Register as Publisher')).toBeInTheDocument();

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

        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(3);
            expect(mockGetSheet).toBeCalledWith(mockUserName);
            expect(mockGetPublishers).toBeCalledTimes(1);
        })

        const createButton = screen.getByRole('button', {name: 'Create Sheet'});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        })

        const deleteButton = screen.getAllByRole('button', {name: 'X'});
        fireEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(mockDeleteSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to delete sheet')).toBeDefined();
        })
    })
})

