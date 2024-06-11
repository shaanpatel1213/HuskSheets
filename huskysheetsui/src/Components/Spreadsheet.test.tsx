// src/Spreadsheet.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  Spreadsheet,
  evaluateOperands,
  evaluateExpression,
  parseAndEvaluateExpression,
  type TableData,
  type SpreadsheetProps,
  type Sheet
} from './Spreadsheet';
import {
  getUpdatesForSubscription,
  getUpdatesForPublished,
  updatePublished,
  updateSubscription
} from '../Utilities/utils';

jest.mock('../Utilities/utils');
const mockGetUpdatesForSubscription = getUpdatesForSubscription as jest.Mock;
const mockGetUpdatesForPublished = getUpdatesForPublished as jest.Mock;
const mockUpdateSubcription = updateSubscription as jest.Mock;
const mockUpdatePublished = updatePublished as jest.Mock;

const mockPublisher = 'team18';
const mockSubscriber = 'team3';
const mockSheetNamePublisher = 'Sheet1';
const mockSheetNameSubscriber = 'Sheet2';
const mockEmptyPayload = '';
const mockPayloadForPublisher = '$A1 1\n$B3 =2+2\n$C2 =$A1+$B3';
const mockPayloadForSubscriber = '$G6 hi\n$C2 bye';
const mockUpdatesForPublisherNewSheet = [{
  publisher: mockPublisher,
  sheet: mockSheetNamePublisher,
  id: null,
  payload: mockEmptyPayload
}];
const mockUpdatesForPublisher = [{
  publisher: mockPublisher,
  sheet: mockSheetNamePublisher,
  id: '1', // create new variable for this maybe
  payload: mockPayloadForPublisher
}];
const mockUpdatesForSubscriber = [{
  publisher: mockSubscriber,
  sheet: mockSheetNameSubscriber,
  id: '3',
  payload: mockPayloadForSubscriber
}];

describe('Spreadsheet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('checks new spreadsheet renders correctly for publisher', async () => {
    mockGetUpdatesForPublished.mockResolvedValue({ success: true, value: mockUpdatesForPublisherNewSheet });
    mockUpdatePublished.mockResolvedValue({ success: true });

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: null,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={false} />
    </MemoryRouter>);
    expect(mockGetUpdatesForPublished).toBeCalledTimes(1);
    expect(mockGetUpdatesForPublished).toBeCalledWith(mockPublisher, mockSheetNamePublisher, '0');

    // checks there are initially 10 rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(11);

    // checks there are initially 10 columns
    const cols = screen.getAllByRole('columnheader');
    expect(cols).toHaveLength(11);

    // checks that there are 10x10=100 cells
    const allCells = screen.getAllByRole('textbox', { name: '' });
    expect(allCells).toHaveLength(100);

    // checks that the add row button adds 1 row
    const addRowButton = screen.getByRole('button', { name: 'Add Row' });
    fireEvent.click(addRowButton);
    await waitFor(() => {
      const rowsAdd = screen.getAllByRole('row');
      expect(rowsAdd).toHaveLength(12);
    });

    // checks that the remove row button removes 1 row
    const removeRowButton = screen.getByRole('button', { name: 'Remove Row' });
    fireEvent.click(removeRowButton);
    await waitFor(() => {
      const rowsRemove = screen.getAllByRole('row');
      expect(rowsRemove).toHaveLength(11);
    });

    // checks that the add column button adds 1 column
    const addColButton = screen.getByRole('button', { name: 'Add Column' });
    fireEvent.click(addColButton);
    await waitFor(() => {
      const colsAdd = screen.getAllByRole('columnheader');
      expect(colsAdd).toHaveLength(12);
    });

    // checks that the remove column button removes 1 column
    const removeColButton = screen.getByRole('button', { name: 'Remove Column' });
    fireEvent.click(removeColButton);
    await waitFor(() => {
      const colsRemove = screen.getAllByRole('columnheader');
      expect(colsRemove).toHaveLength(11);
    });

    // changing value of cell A1
    const cellA1 = allCells[0];
    cellA1.focus();
    await act(() => {
      expect(cellA1).toHaveFocus();
      fireEvent.change(cellA1, { target: { value: '1' } });
      expect(cellA1).toHaveValue('1');
      cellA1.blur();
      expect(cellA1).not.toHaveFocus();
    });

    // changing value of cell B3
    const cellB3 = allCells[21];
    cellB3.focus();
    await act(() => {
      expect(cellB3).toHaveFocus();
      fireEvent.change(cellB3, { target: { value: '=2+2' } });
      expect(cellB3).toHaveValue('=2+2');
      cellB3.blur();
      expect(cellB3).not.toHaveFocus();
    });

    // changing value of cell C2
    const cellC2 = allCells[12];
    cellC2.focus();
    await act(() => {
      expect(cellC2).toHaveFocus();
      fireEvent.change(cellC2, { target: { value: '=$A1+$B3' } });
      expect(cellC2).toHaveValue('=$A1+$B3');
      cellC2.blur();
      expect(cellC2).not.toHaveFocus();
    });

    // clicking the save button and checks it updates correctly
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdatePublished).toBeCalledTimes(1);
      expect(mockUpdatePublished).toBeCalledWith(mockPublisher, mockSheetNamePublisher, '$A1 1\n$B3 =2+2\n$C2 =$A1+$B3');
    })
  })

  test('checks spreadsheet with updates renders correctly for publisher', async () => {
    mockGetUpdatesForPublished.mockResolvedValue({ success: true, value: mockUpdatesForPublisher });
    mockUpdatePublished.mockResolvedValue({ success: true });

    // renders the newly created spreadsheet
    const { container } = render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: 1,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={false} />
    </MemoryRouter>);
    expect(mockGetUpdatesForPublished).toBeCalledTimes(1);
    expect(mockGetUpdatesForPublished).toBeCalledWith(mockPublisher, mockSheetNamePublisher, '1');

    const allCells = screen.getAllByRole('textbox');

    await act(() => { });

    // checks all the cells get correctly updated from payload from get updates
    const cellA1 = allCells[0];
    expect(cellA1).toHaveValue('1');
    const cellB3 = allCells[21];
    expect(cellB3).toHaveValue('=2+2');
    const cellC2 = allCells[12];
    expect(cellC2).toHaveValue('=$A1+$B3');

    // checks you can add value to empty cell A2
    const cellA2 = allCells[10];
    cellA2.focus();
    await act(() => {
      expect(cellA2).toHaveFocus();
      fireEvent.change(cellA2, { target: { value: 'yuhh' } });
      expect(cellA2).toHaveValue('yuhh');
      cellA2.blur();
      expect(cellA2).not.toHaveFocus();
    });

    // checks you can change value of non-empty cell A1
    cellA1.focus();
    await act(() => {
      expect(cellA1).toHaveFocus();
      fireEvent.change(cellA1, { target: { value: '2' } });
      expect(cellA1).toHaveValue('2');
      cellA1.blur();
      expect(cellA1).not.toHaveFocus();
    });

    // clicking the save button and checks it updates correctly
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdatePublished).toBeCalledTimes(1);
      expect(mockUpdatePublished).toBeCalledWith(mockPublisher, mockSheetNamePublisher, '$A2 yuhh\n$A1 2');
    });
  })

  test('checks spreadsheet renders correctly for subscriber', async () => {
    mockGetUpdatesForSubscription.mockResolvedValue({ success: true, value: mockUpdatesForSubscriber });
    mockUpdateSubcription.mockResolvedValue({ success: true });

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: 3,
          name: mockSheetNameSubscriber,
          publisher: mockSubscriber
        }} isSubscriber={true} />
    </MemoryRouter>);
    expect(mockGetUpdatesForSubscription).toBeCalledTimes(1);
    expect(mockGetUpdatesForSubscription).toBeCalledWith(mockSubscriber, mockSheetNameSubscriber, '3');

    const allCells = screen.getAllByRole('textbox', { name: '' });

    await act(() => { });

    // checks all the cells get correctly updated from payload from get updates
    const cellG6 = allCells[56];
    expect(cellG6).toHaveValue('hi');
    const cellC2 = allCells[12];
    expect(cellC2).toHaveValue('bye');

    // clicking the save button and checks it updates correctly
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdateSubcription).toBeCalledTimes(1);
      expect(mockUpdateSubcription).toBeCalledWith(mockSubscriber, mockSheetNameSubscriber, '');
    });
  })
})

describe('Errors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('checks get updates for published error', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: null,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={false} />
    </MemoryRouter>);

    expect(mockGetUpdatesForPublished).toBeCalledTimes(1);

    await act(() => { });

    // checks an error was written in the console with the correct message
    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith('Failed to fetch updates');

    errorSpy.mockRestore();
  })

  test('checks update published error', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');

    mockGetUpdatesForPublished.mockResolvedValue({ success: true, value: mockUpdatesForPublisherNewSheet });

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: null,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={false} />
    </MemoryRouter>);

    expect(mockGetUpdatesForPublished).toBeCalledTimes(1);

    // clicking the save button and checks an error was written in console with correct message
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdatePublished).toBeCalledTimes(1);
    });

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith('Failed to save updates');

    errorSpy.mockRestore();
  })

  test('checks get updates for subscription error', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: null,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={true} />
    </MemoryRouter>);

    expect(mockGetUpdatesForSubscription).toBeCalledTimes(1);

    await act(() => { });

    // checks an error was written in the console with the correct message
    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith('Failed to fetch updates');

    errorSpy.mockRestore();
  })

  test('checks update subscription error', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');

    mockGetUpdatesForSubscription.mockResolvedValue({ success: true, value: mockUpdatesForSubscriber });

    // renders the newly created spreadsheet
    render(<MemoryRouter>
      <Spreadsheet
        sheet={{
          id: null,
          name: mockSheetNamePublisher,
          publisher: mockPublisher
        }} isSubscriber={true} />
    </MemoryRouter>);

    expect(mockGetUpdatesForSubscription).toBeCalledTimes(1);

    // clicking the save button and checks an error was written in console with correct message
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdateSubcription).toBeCalledTimes(1);
    });

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith('Failed to save updates');

    errorSpy.mockRestore();
  })
})


// describe('Spreadsheet Component', () => {
//   test('renders initial 10 rows and 10 columns', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     // Check that there are 10 rows
//     const rows = screen.getAllByRole('row');
//     expect(rows).toHaveLength(11); // 10 rows + 1 header row

//     // Check that there are 10 columns
//     const cols = screen.getAllByRole('columnheader');
//     expect(cols).toHaveLength(11); // 10 cols + 1 header col
//   });

//   test('allows user to type into a cell', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const firstCell = screen.getAllByRole('textbox')[0];
//     fireEvent.change(firstCell, { target: { value: 'test' } });
//     expect(firstCell).toHaveValue('test');
//   });

//   test('adds a row when "Add Row" button is clicked', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const addButton = screen.getByText('Add Row');
//     fireEvent.click(addButton);

//     const rows = screen.getAllByRole('row');
//     expect(rows).toHaveLength(12); // 11 rows + 1 header row
//   });

//   test('removes a row when "Remove Row" button is clicked', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const removeButton = screen.getByText('Remove Row');
//     fireEvent.click(removeButton);

//     const rows = screen.getAllByRole('row');
//     expect(rows).toHaveLength(10); // 9 rows + 1 header row
//   });

//   test('adds a column when "Add Column" button is clicked', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const addButton = screen.getByText('Add Column');
//     fireEvent.click(addButton);

//     const cols = screen.getAllByRole('columnheader');
//     expect(cols).toHaveLength(12); // 11 + 1
//   });

//   test('removes a column when "Remove Column" button is clicked', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const removeButton = screen.getByText('Remove Column');
//     fireEvent.click(removeButton);

//     const cols = screen.getAllByRole('columnheader');
//     expect(cols).toHaveLength(10); // 11 - 1
//   });

//   test('can edit cell values', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);

//     const firstCell = screen.getAllByRole('textbox', { name: '' })[0];
//     fireEvent.change(firstCell, { target: { value: 'test' } });
//     expect(firstCell).toHaveValue('test');
//   });
//   test('returns ERROR for invalid cell reference in formula', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);
//     const firstCell = screen.getAllByRole('textbox')[0];
//     fireEvent.change(firstCell, { target: { value: '=A11' } }); // A11 does not exist in initial 10x10 grid
//     fireEvent.blur(firstCell);
//     expect(firstCell).toHaveValue('ERRORs');
//   });


//   test('calculates the cell value correctly when a formula is entered', () => {
//     render(<Spreadsheet sheet={{
//       id: null,
//       name: "",
//       publisher: "",
//     }} isSubscriber={false} />);
//     const firstCell = screen.getAllByRole('textbox')[0];
//     fireEvent.change(firstCell, { target: { value: '=2+2' } });
//     fireEvent.blur(firstCell);
//     expect(firstCell).toHaveValue('4');
//   });


// });








// describe('evaluateOperands function', () => {

//   test('should return 1 for equal numbers using = operator', () => {
//     expect(evaluateOperands(5, 5, '=')).toBe(1);
//   });

//   test('should return 0 for non-equal numbers using = operator', () => {
//     expect(evaluateOperands(5, 10, '=')).toBe(0);
//   });

//   test('should return 1 for equal strings using = operator', () => {
//     expect(evaluateOperands('hello', 'hello', '=')).toBe(1);
//   });

//   test('should return 0 for non-equal strings using = operator', () => {
//     expect(evaluateOperands('hello', 'world', '=')).toBe(0);
//   });

//   test('should return 1 for non-equal numbers using <> operator', () => {
//     expect(evaluateOperands(5, 10, '<>')).toBe(1);
//   });

//   test('should return 0 for equal numbers using <> operator', () => {
//     expect(evaluateOperands(5, 5, '<>')).toBe(0);
//   });

//   test('should return 1 for non-equal strings using <> operator', () => {
//     expect(evaluateOperands('hello', 'world', '<>')).toBe(1);
//   });

//   test('should return 0 for equal strings using <> operator', () => {
//     expect(evaluateOperands('hello', 'hello', '<>')).toBe(0);
//   });

//   test('should return 1 if both numbers are not 0 using & operator', () => {
//     expect(evaluateOperands(1, 1, '&')).toBe(1);
//   });

//   test('should return 0 if any number is 0 using & operator', () => {
//     expect(evaluateOperands(1, 0, '&')).toBe(0);
//     expect(evaluateOperands(0, 1, '&')).toBe(0);
//     expect(evaluateOperands(0, 0, '&')).toBe(0);
//   });

//   test('should return 1 if any number is 1 using | operator', () => {
//     expect(evaluateOperands(1, 1, '|')).toBe(1);
//     expect(evaluateOperands(1, 0, '|')).toBe(1);
//     expect(evaluateOperands(0, 1, '|')).toBe(1);
//   });

//   test('should return 0 if both numbers are 0 using | operator', () => {
//     expect(evaluateOperands(0, 0, '|')).toBe(0);
//   });

//   describe('evaluateExpression function', () => {
//     const data: TableData = [
//       ['1', '2', '3'],
//       ['4', '5', '6'],
//       ['7', '8', '9']
//     ];

//     test('should correctly evaluate SUM function', () => {
//       const parsedExpression = { func: 'SUM', args: ['1', '2', '3'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe(6);
//     });

//     test('should correctly evaluate MIN function', () => {
//       const parsedExpression = { func: 'MIN', args: ['3', '1', '2'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe(1);
//     });

//     test('should correctly evaluate MAX function', () => {
//       const parsedExpression = { func: 'MAX', args: ['3', '1', '2'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe(3);
//     });

//     test('should correctly evaluate AVG function', () => {
//       const parsedExpression = { func: 'AVG', args: ['3', '1', '2'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe(2);
//     });

//     test('should correctly evaluate CONCAT function', () => {
//       const parsedExpression = { func: 'CONCAT', args: ['hello', ' ', 'world'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe('hello world');
//     });

//     test('should correctly evaluate IF function', () => {
//       const parsedExpression = { func: 'IF', args: ['1', 'true', 'false'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe('true');
//     });

//     test('should correctly evaluate nested IF function', () => {
//       const parsedExpression = { func: 'IF', args: ['0', 'true', 'IF(1,true,false)'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe('true');
//     });

//     test('should correctly evaluate DEBUG function', () => {
//       const parsedExpression = { func: 'DEBUG', args: ['1'] };
//       expect(evaluateExpression(parsedExpression, data)).toBe('1');
//     });
//   });

//   describe('parseAndEvaluateExpression function', () => {
//     const data: TableData = [
//       ['1', '2', '3'],
//       ['4', '5', '6'],
//       ['7', '8', '9']
//     ];

//     test('should correctly parse and evaluate SUM function', () => {
//       expect(parseAndEvaluateExpression('SUM(1,2,3)', data)).toBe('6');
//     });

//     test('should correctly parse and evaluate MIN function', () => {
//       expect(parseAndEvaluateExpression('MIN(3,1,2)', data)).toBe('1');
//     });

//     test('should correctly parse and evaluate MAX function', () => {
//       expect(parseAndEvaluateExpression('MAX(3,1,2)', data)).toBe('3');
//     });

//     test('should correctly parse and evaluate AVG function', () => {
//       expect(parseAndEvaluateExpression('AVG(3,1,2)', data)).toBe('2');
//     });

//     test('should correctly parse and evaluate CONCAT function', () => {
//       expect(parseAndEvaluateExpression('CONCAT(hello, ,world)', data)).toBe('hello world');
//     });

//     test('should correctly parse and evaluate IF function', () => {
//       expect(parseAndEvaluateExpression('IF(1,true,false)', data)).toBe('true');
//     });

//     test('should correctly parse and evaluate nested IF function', () => {
//       expect(parseAndEvaluateExpression('IF(0,true,IF(1,true,false))', data)).toBe('true');
//     });

//     test('should correctly parse and evaluate DEBUG function', () => {
//       expect(parseAndEvaluateExpression('DEBUG(1)', data)).toBe('1');
//     });
//   });

// });