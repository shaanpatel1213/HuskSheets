import React from 'react';
import { render, screen, fireEvent, waitFor, getByRole, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { HomePage } from './HomePage';
import { createSheet, getSheets, deleteSheet } from '../Utilities/utils';
import '@testing-library/jest-dom';

jest.mock('../Utilities/utils', () => ({   
    getSheets: jest.fn(), 
    createSheet: jest.fn(), 
    deleteSheet: jest.fn(), }));

describe('HomePage', () => {
    const mockSheets = [ { id: 'sheet1', name: 'Sheet 1' },  { id: 'sheet2', name: 'Sheet 2' }, ];
    const mockUserName = 'team18';
    const newSheetName = 'Sheet1';
    beforeEach(() => {
        (getSheets as jest.Mock).mockResolvedValue({ success: true, value: mockSheets });
        (createSheet as jest.Mock).mockResolvedValue({ success: true });
        (deleteSheet as jest.Mock).mockResolvedValue({ success: true });
    })

    test('check if the create sheet renders correctly', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect(screen.queryByText('HomePage')).toBeInTheDocument();
        expect(screen.queryByText('Create Sheet')).toBeInTheDocument();
        expect(getSheets).toBeCalledTimes(1);
        const createButton = screen.getByRole("button", {name: "Create Sheet"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(getSheets).toBeCalledTimes(2);
            //expect(container.firstChild).toMatchSnapshot();
        });
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
        expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');
    })

    test('check if the + renders correctly', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect(screen.queryByText('HomePage')).toBeInTheDocument();
        expect(screen.queryByText('+')).toBeInTheDocument();
        expect(getSheets).toBeCalledTimes(1);
        const createButton = screen.getByRole("button", {name: "+"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(getSheets).toBeCalledTimes(2);
            //expect(container.firstChild).toMatchSnapshot();
        });
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
        expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');
    })

    test('check if the create sheet renders the errors correctly', async () => {
        (createSheet as jest.Mock).mockResolvedValue({ success: false });
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        const createButton = screen.getByRole("button", {name: "Create Sheet"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        });
    })

    test('check if the + renders the errors correctly', async () => {
        (createSheet as jest.Mock).mockResolvedValue({ success: false });
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        const createButton = screen.getByRole("button", {name: "+"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        });
    })

    test('check if get sheet renders the error correctly', async () => {
        (getSheets as jest.Mock).mockResolvedValue({ success: false });
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText('Failed to fetch sheets')).toBeDefined();
        });
    })

    test('check if we can create a new sheet with the input name', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        const newSheetName = screen.getByPlaceholderText("Enter new sheet name");
        await act(() => {
            fireEvent.change(newSheetName, { target: { value: 'New Sheet' }});
        });
        expect(newSheetName.value).toEqual('New Sheet');
    })

    // to be fixed: clicking a delete button deletes both created sheets :(, need to figure out how to click singular X button
    test('check if delete sheet renders correctly', async () => {
        const {asFragment, container} = render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect(screen.queryByText('HomePage')).toBeInTheDocument();
        const createButton = screen.getByRole("button", {name: "Create Sheet"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(getSheets).toBeCalledTimes(2);
            //expect(container.firstChild).toMatchSnapshot();
        });
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/spreadsheet/sheet1');
        expect(links[1]).toHaveAttribute('href', '/spreadsheet/sheet2');

        const deleteButtons = screen.queryAllByText('X');
        expect(deleteButtons).toHaveLength(2);
        const firstDeleteButton = deleteButtons[0];
        const secondDeleteButton = deleteButtons[1];
        fireEvent.click(firstDeleteButton);
        await waitFor(() => {
            expect(deleteSheet).toBeCalledTimes(1);
            expect(firstDeleteButton).not.toBeInTheDocument();
            //expect(container.firstChild).toMatchSnapshot();
            //expect(secondDeleteButton).toBeInTheDocument();
        });
    })

    test('check if the delete sheet renders the errors correctly', async () => {
        (deleteSheet as jest.Mock).mockResolvedValue({ success: false });
        const {asFragment, container} = render(<MemoryRouter><HomePage /></MemoryRouter>);
        const createButton = screen.getByRole("button", {name: "Create Sheet"});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(createSheet).toBeCalledTimes(1);
            expect(getSheets).toBeCalledTimes(2);
        });
        const deleteButtons = screen.queryAllByText('X');
        expect(deleteButtons).toHaveLength(2);
        const firstDeleteButton = deleteButtons[0];
        fireEvent.click(firstDeleteButton);
        await waitFor(() => {
            expect(deleteSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to delete sheet')).toBeDefined();
        });
    })
})

// describe('HomePage', () => {
//     test('renders HomePage with initial sheets', () => {
//         render(
//             <MemoryRouter>
//                 <HomePage />
//             </MemoryRouter>
//         );

//         expect(screen.getByText('HomePage')).toBeInTheDocument();
//         expect(screen.getByText('Sheet1')).toBeInTheDocument();
//         expect(screen.getByText('Sheet2')).toBeInTheDocument();
//         expect(screen.getByText('+')).toBeInTheDocument();
//     });

//     test('adds a new sheet when the add sheet button is clicked', () => {
//         render(
//             <MemoryRouter>
//                 <HomePage />
//             </MemoryRouter>
//         );

//         fireEvent.click(screen.getByText('+'));

//         expect(screen.getByText('Sheet3')).toBeInTheDocument();
//     });

//     test('navigation links are correct', () => {
//         render(
//             <MemoryRouter>
//                 <HomePage />
//             </MemoryRouter>
//         );

//         expect(screen.getByText('Sheet1').closest('a')).toHaveAttribute('href', '/spreadsheet');
//         expect(screen.getByText('Sheet2').closest('a')).toHaveAttribute('href', '/spreadsheet');
//     });
// });
