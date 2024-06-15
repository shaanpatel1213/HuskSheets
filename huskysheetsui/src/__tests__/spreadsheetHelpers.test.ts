import { 
  fetchUpdates,
  addUpdates,
  saveUpdates,
  evaluateCell,
  parseUpdate,
  getColumnLetter,
  evaluateAllCells,
  DependencyGraph,
  parseCellReference,
  getDependenciesFromFormula
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
    it('should fetch updates correctly', async () => {
      const mockSetLiteralString = jest.fn();
      const mockSetVisualData = jest.fn();
      const initialData = [['']];

      (getUpdatesForSubscription as jest.Mock).mockResolvedValueOnce({
        success: true,
        value: [
          { publisher: 'TestPublisher', sheet: 'TestSheet', id: '1', payload: '$A1 2' }
        ],
      });

      await fetchUpdates(
        { publisher: 'TestPublisher', name: 'TestSheet' },
        1,
        false,
        initialData,
        mockSetLiteralString,
        mockSetVisualData,
        parseUpdate
      );

      expect(mockSetLiteralString).toBeCalledTimes(1);
      expect(mockSetVisualData).toBeCalledTimes(1);
    });

    it('should handle errors in fetchUpdates', async () => {
      const mockSetLiteralString = jest.fn();
      const mockSetVisualData = jest.fn();
      const initialData = [['']];

      (getUpdatesForSubscription as jest.Mock).mockResolvedValueOnce({
        success: false,
        value: []
      });

      await fetchUpdates(
        { publisher: 'TestPublisher', name: 'TestSheet' },
        1,
        false,
        initialData,
        mockSetLiteralString,
        mockSetVisualData,
        parseUpdate
      );

      expect(consoleErrorSpy).toBeCalledWith('Failed to fetch updates');
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

    it('should handle save updates error for a publisher', async () => {
      const updates = { current: '$A1 NewValue' };
      const setSheetIdMock = jest.fn();

      (updatePublished as jest.Mock).mockResolvedValueOnce({
        success: false,
        value: []
      });

      await saveUpdates(
        false,
        { name: 'TestSheet', publisher: 'TestPublisher' },
        updates,
        1,
        setSheetIdMock
      );

      expect(consoleErrorSpy).toBeCalledWith('Failed to save updates');
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

    it('should handle save updates error for a subscriber', async () => {
      const updates = { current: '$A1 NewValue' };
      const setSheetIdMock = jest.fn();

      (updateSubscription as jest.Mock).mockResolvedValueOnce({
        success: false,
        value: []
      });

      await saveUpdates(
        true,
        { name: 'TestSheet', publisher: 'TestPublisher' },
        updates,
        1,
        setSheetIdMock
      );

      expect(consoleErrorSpy).toBeCalledWith('Failed to save updates');
    });
  });

  describe('evaluateCell', () => {
    it('should evaluate a cell correctly', () => {
      const data = [['=1+1']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=1+1', 0, 0, data, dependencyGraph, visitedCells);
      expect(result).toBe('2');
    });

    it('should handle circular references', () => {
      const data = [['=A2'], ['=A1']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=A2', 0, 0, data, dependencyGraph, visitedCells);
      expect(result).toBe('ERROR');
    });

    it('should handle missing dependencies gracefully', () => {
      const data = [['=B1']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=B1', 0, 0, data, dependencyGraph, visitedCells);
      expect(result).toBe('0');
    });

    it('should handle invalid formulas gracefully', () => {
      const data = [['=invalid']];
      const dependencyGraph = new DependencyGraph();
      const visitedCells: Set<string> = new Set();
      const result = evaluateCell('=invalid', 0, 0, data, dependencyGraph, visitedCells);
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

  describe('parseCellReference', () => {
    it('should parse a cell reference correctly', () => {
      const result = parseCellReference('A1');
      expect(result).toEqual({ row: 0, col: 0 });
    });

    it('should handle invalid cell references', () => {
      expect(() => parseCellReference('invalid')).toThrow('Invalid cell reference');
    });
  });

  describe('getDependenciesFromFormula', () => {
    it('should extract dependencies from a formula correctly', () => {
      const formula = '=A1+B2';
      const result = getDependenciesFromFormula(formula);
      expect(result).toEqual(['A1', 'B2']);
    });

    it('should return an empty array for formulas without dependencies', () => {
      const formula = '=1+2';
      const result = getDependenciesFromFormula(formula);
      expect(result).toEqual([]);
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
