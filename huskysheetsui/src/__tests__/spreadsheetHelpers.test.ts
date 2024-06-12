import { fetchUpdates, evaluateAllCells, addUpdates, saveUpdates, evaluateCell, colToIndex, getColumnLetter, parseUpdate } from '../componentHelpers/spreadsheetHelpers';
import { getUpdatesForSubscription, getUpdatesForPublished, updatePublished, updateSubscription } from '../Utilities/utils';
import { parseAndEvaluateExpression, TableData } from '../Utilities/CellFunctionalities';

jest.mock('../Utilities/utils');
jest.mock('../Utilities/CellFunctionalities');



/**
 * Tests the spreadsheet helpers file
 * 
 * Ownership: @author BrandonPetersen
 */
describe('spreadsheetHelpers', () => {
  let consoleErrorMock: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorMock.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUpdates', () => {
    it('should fetch and process updates for a subscriber', async () => {
      const initialData: TableData = [['', ''], ['', '']];
      const updates = [
        { publisher: 'test', sheet: 'sheet1', id: '1', payload: '$A1 1\n$B1 2' }
      ];
      (getUpdatesForSubscription as jest.Mock).mockResolvedValue({ success: true, value: updates });

      const setLiteralString = jest.fn();
      const setVisualData = jest.fn();
      const parseUpdate = (update: string) => ({ row: 0, col: 0, value: update.split(' ')[1] });

      await fetchUpdates(
        { publisher: 'test', name: 'sheet1' },
        null,
        true,
        initialData,
        setLiteralString,
        setVisualData,
        parseUpdate
      );

      expect(setLiteralString).toHaveBeenCalled();
      expect(setVisualData).toHaveBeenCalled();
    });

    it('should handle fetch updates failure', async () => {
      (getUpdatesForSubscription as jest.Mock).mockResolvedValue({ success: false, value: [] });

      const setLiteralString = jest.fn();
      const setVisualData = jest.fn();
      const parseUpdate = (update: string) => ({ row: 0, col: 0, value: update.split(' ')[1] });

      await fetchUpdates(
        { publisher: 'test', name: 'sheet1' },
        null,
        true,
        [['']],
        setLiteralString,
        setVisualData,
        parseUpdate
      );

      expect(console.error).toHaveBeenCalledWith('Failed to fetch updates');
    });
  });


  /*
    Broken test right now. Needed for 80% coverage
    
  describe('evaluateAllCells', () => {
    it('should evaluate all cells in the data', () => {
      const data: TableData = [['=1+1'], ['=2+2'], ['=3+3'], ['=4+4']];
      const evaluatedData: TableData = [['2'], ['4'], ['6'], ['8']];
      jest.spyOn(global as any, 'evaluateCell').mockImplementation((data) => {
        if (data === '=1+1') return '2';
        if (data === '=2+2') return '4';
        if (data === '=3+3') return '6';
        if (data === '=4+4') return '8';
        return data;
      });
  
      const result = evaluateAllCells(data);
      expect(result).toEqual(evaluatedData);
    });
  });
  */

  describe('addUpdates', () => {
    it('should add updates correctly', () => {
      const updates = { current: '' };
      const getColumnLetter = jest.fn().mockReturnValue('A');
      addUpdates(0, 0, '1', updates, getColumnLetter);
      expect(updates.current).toBe('$A1 1\n');
    });
  });

  describe('saveUpdates', () => {
    it('should save updates successfully', async () => {
      (updatePublished as jest.Mock).mockResolvedValue({ success: true });
      const updates = { current: 'update' };
      const setSheetId = jest.fn();

      await saveUpdates(false, { publisher: 'test', name: 'sheet1' }, updates, null, setSheetId);
      expect(setSheetId).toHaveBeenCalledWith(1);
      expect(updates.current).toBe('');
    });

    it('should handle save updates failure', async () => {
      (updatePublished as jest.Mock).mockResolvedValue({ success: false });
      const updates = { current: 'update' };
      const setSheetId = jest.fn();

      await saveUpdates(false, { publisher: 'test', name: 'sheet1' }, updates, null, setSheetId);
      expect(console.error).toHaveBeenCalledWith('Failed to save updates');
    });
  });


  /*
  Broken test right now. Needed for 80% coverage

  describe('evaluateCell', () => {
    it('should evaluate a cell value', () => {
      const data: TableData = [['=1+1'], ['=2+2'], ['=3+3'], ['=4+4']];
      jest.spyOn(global as any, 'parseAndEvaluateExpression').mockImplementation((cell, data) => {
        if (formula === '1+1') return '2';
        if (formula === '2+2') return '4';
        if (formula === '3+3') return '6';
        if (formula === '4+4') return '8';
        return formula;

      });
  
      const result = evaluateCell('=1+1', data);
      expect(result).toBe('2');
    });
  });
  */

  describe('colToIndex and getColumnLetter', () => {
    it('should convert column letter to index and back', () => {
      expect(colToIndex('A')).toBe(0);
      expect(getColumnLetter(0)).toBe('A');
      expect(colToIndex('Z')).toBe(25);
      expect(getColumnLetter(25)).toBe('Z');
      expect(colToIndex('AA')).toBe(26);
      expect(getColumnLetter(26)).toBe('AA');
    });
  });

  describe('parseUpdate', () => {
    it('should parse an update string correctly', () => {
      const update = '$A1 1';
      const parsed = parseUpdate(update);
      expect(parsed).toEqual({ row: 0, col: 0, value: '1' });
    });

    it('should throw an error for invalid update format', () => {
      expect(() => parseUpdate('invalid')).toThrow('Invalid update format');
    });
  });
});
