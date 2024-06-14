import { 
  fetchUpdates,
  addUpdates,
  saveUpdates,
  evaluateCell,
  parseUpdate,
  getColumnLetter,
  evaluateAllCells,
  DependencyGraph
} from '../componentHelpers/spreadsheetHelpers';
import { getAuthHeader, updatePublished, getUpdatesForSubscription, updateSubscription } from '../Utilities/utils';

jest.mock('../Utilities/utils');

describe('Spreadsheet Helpers', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mocking authentication header
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 'mockAuth');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('fetchUpdates', () => {
    it('should handle errors in fetchUpdates', async () => {
      const mockSetLiteralString = jest.fn();
      const mockSetVisualData = jest.fn();
      const mockParseUpdate = jest.fn().mockImplementation(() => {
        new Error('Parsing error');
      });
      const initialData = [['']];

      // Mock implementation
      (getUpdatesForSubscription as jest.Mock).mockResolvedValueOnce({
        success: true,
        value: [
          { publisher: 'TestPublisher', sheet: 'TestSheet', id: '1', payload: 'InvalidUpdate' }
        ],
      });

      await fetchUpdates(
        { publisher: 'TestPublisher', name: 'TestSheet' },
        1,
        false,
        initialData,
        mockSetLiteralString,
        mockSetVisualData,
        mockParseUpdate
      );

      expect(consoleErrorSpy).toBeCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch updates');
    });
  });

  describe('addUpdates', () => {
    it('should add updates correctly', () => {
      const updates = { current: '' };
      const getColumnLetterMock = jest.fn().mockReturnValue('A');

      addUpdates(0, 0, 'NewValue', updates, getColumnLetterMock);

      expect(updates.current).toContain('$A1 NewValue');
      expect(getColumnLetterMock).toHaveBeenCalledWith(0);
    });
  });

  describe('saveUpdates', () => {
    it('should save updates correctly for a publisher', async () => {
      const updates = { current: '$A1 NewValue' };
      const setSheetIdMock = jest.fn();

      (updatePublished as jest.Mock).mockResolvedValueOnce({
        success: true,
        value: []
      });

      await saveUpdates(
        false,
        { name: 'TestSheet', publisher: 'TestPublisher' },
        updates,
        1,
        setSheetIdMock
      );

      // Assertions to verify that the updates are saved
      expect(updates.current).toBe('');
    });

    it('should save updates correctly for a subscriber', async () => {
      const updates = { current: '$A1 NewValue' };
      const setSheetIdMock = jest.fn();

      (updateSubscription as jest.Mock).mockResolvedValueOnce({
        success: true,
        value: []
      });

      await saveUpdates(
        true,
        { name: 'TestSheet', publisher: 'TestPublisher' },
        updates,
        1,
        setSheetIdMock
      );

      // Assertions to verify that the updates are saved
      expect(updates.current).toBe('');
    });
  });

  describe('evaluateCell', () => {
    it('should evaluate a cell correctly', () => {
      const data = [['1+1']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=1+1', 0, 0, data, dependencyGraph, visitedCells);
      expect(result).toBe('2');
    });
  
    it('should handle evaluation errors', () => {
      const data = [['invalid']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=2-', 0, 0, data, dependencyGraph, visitedCells);
      expect(result).toBe('ERROR');
    });
  });
  

  describe('parseUpdate', () => {
    it('should parse an update string correctly', () => {
      const result = parseUpdate('$A1 2');
      expect(result).toEqual({ row: 0, col: 0, value: '2' });
    });

    it('should handle invalid update strings', () => {
      expect(() => parseUpdate('invalid update')).toThrow('Invalid update format');
    });
  });

  describe('getColumnLetter', () => {
    it('should return the correct column letter', () => {
      expect(getColumnLetter(0)).toBe('A');
      expect(getColumnLetter(25)).toBe('Z');
      expect(getColumnLetter(26)).toBe('AA');
    });
  });

  describe('evaluateAllCells', () => {
    it('should evaluate all cells correctly', () => {
      const data = [['=1+1', '=2+2']];
      const dependencyGraph = new DependencyGraph();
      const result = evaluateAllCells(data, dependencyGraph);
      expect(result).toEqual([['2', '4']]);
    });

    it('should handle errors in cell evaluation', () => {
      const data = [['=invalid', '=2+2']];
      const dependencyGraph = new DependencyGraph();
      const result = evaluateAllCells(data, dependencyGraph);
      expect(result).toEqual([['ERROR', '4']]);
    });
  });

  describe('DependencyGraph', () => {
    it('should add and get dependencies correctly', () => {
      const graph = new DependencyGraph();
      graph.addDependency('A1', 'B1');
      expect(graph.getDependencies('A1')).toEqual(new Set(['B1']));
    });
  
    it('should handle circular dependencies', () => {
      const graph = new DependencyGraph();
      graph.addDependency('A1', 'B1');
      graph.addDependency('B1', 'A1');
      expect(graph.detectCycle('A1')).toBe(true);
    });
  });
});
