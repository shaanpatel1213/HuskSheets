import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {MemoryRouter, Router} from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { HomePage } from '../Components/HomePage';
import { createSheet, getSheets, deleteSheet, getPublishers, register } from '../Utilities/utils';
import '@testing-library/jest-dom';
import {createMemoryHistory} from "history";

jest.setTimeout(10000);

jest.mock('../Utilities/utils');
const mockCreateSheet = createSheet as jest.Mock;
const mockDeleteSheet = deleteSheet as jest.Mock;
const mockGetSheet = getSheets as jest.Mock;
const mockGetPublishers = getPublishers as jest.Mock;
const mockRegister = register as jest.Mock;

const mockSheets = [ { id: 'sheet1', name: 'Sheet 1' },  { id: 'sheet2', name: 'Sheet 2' }, ];
const mockPublisher = [{"publisher": "team3"}, {"publisher": "team18"}]

describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    /** @author EmilyFink474 */
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
            expect(mockGetSheet).toBeCalledTimes(1); 
            expect(mockGetSheet).toBeCalledWith(''); 
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
            expect(mockGetSheet).toBeCalledTimes(2); 
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
    /** @author : Shaanpatel1213 */
    test('handleLogout function works correctly', () => {
      // Set up session storage
      sessionStorage.setItem('userName', 'testUser');
      sessionStorage.setItem('password', 'testPassword');

      // Create a memory history instance
      const history = createMemoryHistory();
      history.push = jest.fn(); // Mock the push function

      // Render the HomePage component with the history instance
      const { getByText } = render(
        <Router history={history}>
          <HomePage />
        </Router>
      );

      // Simulate clicking the logout button
      const logoutButton = getByText('Logout');
      fireEvent.click(logoutButton);

      // Assert that session storage items are removed
      expect(sessionStorage.getItem('userName')).toBeNull();
      expect(sessionStorage.getItem('password')).toBeNull();

      // Assert that history.push was called with the login path
      expect(history.push).toHaveBeenCalledWith('/');
    });

// test('renders otherSheets correctly', () => {
//   const otherSheets = [
//     {
//       publisher: "Publisher1",
//       sheets: [
//         { id: "1", name: "Sheet1" },
//         { id: "2", name: "Sheet2" }
//       ]
//     },
//     {
//       publisher: "Publisher2",
//       sheets: [
//         { id: "3", name: "Sheet3" },
//         { id: "4", name: "Sheet4" }
//       ]
//     }
//   ];
//
//   const { getByText } = render(
//     <MemoryRouter>
//       <HomePage />
//     </MemoryRouter>
//   );
//
//   // Check that the publishers and sheets are rendered
//   otherSheets.forEach(publisherSheets => {
//     //expect(getByText(publisherSheets.publisher)).toBeInTheDocument();
//     publisherSheets.sheets.forEach(sheet => {
//       expect(getByText(sheet.name)).toBeInTheDocument();
//     });
//   });
//
//   // Check that the links are correctly formed
//   otherSheets.forEach(publisherSheets => {
//     publisherSheets.sheets.forEach(sheet => {
//       const link = getByText(sheet.name).closest('a');
//       expect(link).toHaveAttribute('href', `/spreadsheet/${publisherSheets.publisher}/${sheet.name}`);
//     });
//   });
// });
})

describe('Errors', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    /** @author EmilyFink474 */
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

    /** @author EmilyFink474 */
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

    /** @author EmilyFink474 */
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

    /** @author EmilyFink474 */
    test('checks create sheet and delete sheet error', async () => {
        mockRegister.mockResolvedValue({ success: true });
        mockGetSheet.mockResolvedValue({ success: true, value: mockSheets });
        mockGetPublishers.mockResolvedValue({ success: true, value: mockPublisher });

        render(<MemoryRouter><HomePage /></MemoryRouter>);

        // clicks register button and expect it to pass but getPublishers should fail and should put up correct error message
        const registerButton = screen.getByRole('button', {name: 'Register as Publisher'});
        fireEvent.click(registerButton);
        await waitFor(() => {
            expect(mockRegister).toBeCalledTimes(1);
            expect(mockGetSheet).toBeCalledTimes(1);
            expect(mockGetPublishers).toBeCalledTimes(1);
        });

        const createButton = screen.getByRole('button', {name: 'Create Sheet'});
        fireEvent.click(createButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        });

        const plusButton = screen.getByRole('button', {name: '+'});
        fireEvent.click(plusButton);
        await waitFor(() => {
            expect(mockCreateSheet).toBeCalledTimes(2);
            expect(screen.getByText('Failed to create sheet')).toBeDefined();
        });

        const deleteButton = screen.queryAllByRole('button', {name: 'X'});
        fireEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(mockDeleteSheet).toBeCalledTimes(1);
            expect(screen.getByText('Failed to delete sheet')).toBeDefined();
        });
    })
});



