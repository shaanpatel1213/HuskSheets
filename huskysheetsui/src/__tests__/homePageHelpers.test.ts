import { checkPublisher, fetchSheets, fetchOtherSheets, handleCreateSheet, handleDeleteSheet, handleRegister } from '../componentHelpers/homePageHelpers';
import { getPublishers, getSheets, createSheet, deleteSheet, register } from '../Utilities/utils';

jest.mock('../Utilities/utils');

/**
 * Tests for the homePageHelpers file
 * 
 * Ownership: @author BrandonPetersen
 */
describe('homePageHelpers', () => {
  let setError: jest.Mock;
  let setIsRegistered: jest.Mock;
  let setSheets: jest.Mock;
  let setOtherSheets: jest.Mock;
  let setNewSheetName: jest.Mock;
  let setSheetCounter: jest.Mock;
  let fetchSheetsMock: jest.Mock;
  let fetchOtherSheetsMock: jest.Mock;

  beforeEach(() => {
    setError = jest.fn();
    setIsRegistered = jest.fn();
    setSheets = jest.fn();
    setOtherSheets = jest.fn();
    setNewSheetName = jest.fn();
    setSheetCounter = jest.fn();
    fetchSheetsMock = jest.fn();
    fetchOtherSheetsMock = jest.fn();
    jest.clearAllMocks();
  });

  describe('checkPublisher', () => {
    /**
     * Tests for the checkPublisher function, ensuring it sets the registration status and fetches sheets
     * if the user is a publisher, and sets an error message if fetching publishers fails.
     * @author BrandonPetersen
     */
    it('should set registration status and fetch sheets if user is a publisher', async () => {
      (getPublishers as jest.Mock).mockResolvedValue({
        success: true,
        value: [{ publisher: 'testUser' }]
      });

      await checkPublisher('testUser', setIsRegistered, fetchSheetsMock, fetchOtherSheetsMock, setError);

      expect(setIsRegistered).toHaveBeenCalledWith(true);
      expect(fetchSheetsMock).toHaveBeenCalled();
      expect(fetchOtherSheetsMock).toHaveBeenCalledWith([]);
      expect(setError).not.toHaveBeenCalled();
    });

    it('should set error if fetching publishers fails', async () => {
      (getPublishers as jest.Mock).mockResolvedValue({ success: false });

      await checkPublisher('testUser', setIsRegistered, fetchSheetsMock, fetchOtherSheetsMock, setError);

      expect(setError).toHaveBeenCalledWith('Failed to fetch publishers');
      expect(setIsRegistered).not.toHaveBeenCalled();
      expect(fetchSheetsMock).not.toHaveBeenCalled();
      expect(fetchOtherSheetsMock).not.toHaveBeenCalled();
    });
  });

  describe('fetchSheets', () => {
    /**
     * Tests for the fetchSheets function, ensuring it fetches and sets sheets if successful,
     * and sets an error message if fetching sheets fails.
     * @author BrandonPetersen
     */
    it('should fetch and set sheets if successful', async () => {
      (getSheets as jest.Mock).mockResolvedValue({
        success: true,
        value: [{ id: '1', sheet: 'Sheet1' }]
      });

      await fetchSheets('testUser', setSheets, setError);

      expect(setSheets).toHaveBeenCalledWith([{ id: '1', name: 'Sheet1' }]);
      expect(setError).not.toHaveBeenCalled();
    });

    it('should set error if fetching sheets fails', async () => {
      (getSheets as jest.Mock).mockResolvedValue({ success: false });

      await fetchSheets('testUser', setSheets, setError);

      expect(setError).toHaveBeenCalledWith('Failed to fetch sheets');
      expect(setSheets).not.toHaveBeenCalled();
    });
  });

  describe('fetchOtherSheets', () => {
    /**
     * Tests for the fetchOtherSheets function, ensuring it fetches and sets other sheets if successful,
     * and sets empty sheets if fetching other sheets fails.
     * @author BrandonPetersen
     */
    it('should fetch and set other sheets if successful', async () => {
      (getSheets as jest.Mock).mockResolvedValue({
        success: true,
        value: [{ id: '1', sheet: 'Sheet1' }]
      });

      await fetchOtherSheets(['publisher1'], setOtherSheets);

      expect(setOtherSheets).toHaveBeenCalledWith([{ publisher: 'publisher1', sheets: [{ id: '1', name: 'Sheet1' }] }]);
    });

    it('should set empty sheets if fetching other sheets fails', async () => {
      (getSheets as jest.Mock).mockResolvedValue({ success: false });

      await fetchOtherSheets(['publisher1'], setOtherSheets);

      expect(setOtherSheets).toHaveBeenCalledWith([{ publisher: 'publisher1', sheets: [] }]);
    });
  });

  describe('handleCreateSheet', () => {
    /**
     * Tests for the handleCreateSheet function, ensuring it handles sheet creation, fetches sheets,
     * and resets new sheet name if successful, and sets an error message if creating sheet fails.
     * @author BrandonPetersen
     */
    it('should create a sheet, fetch sheets, and reset new sheet name if successful', async () => {
      (createSheet as jest.Mock).mockResolvedValue({ success: true });

      await handleCreateSheet('testUser', 'NewSheet', setNewSheetName, 1, setSheetCounter, setError, fetchSheetsMock);

      expect(createSheet).toHaveBeenCalledWith('testUser', 'NewSheet');
      expect(fetchSheetsMock).toHaveBeenCalled();
      expect(setNewSheetName).toHaveBeenCalledWith('');
      expect(setError).not.toHaveBeenCalled();
    });

    it('should set error if creating sheet fails', async () => {
      (createSheet as jest.Mock).mockResolvedValue({ success: false });

      await handleCreateSheet('testUser', 'NewSheet', setNewSheetName, 1, setSheetCounter, setError, fetchSheetsMock);

      expect(setError).toHaveBeenCalledWith('Failed to create sheet');
      expect(fetchSheetsMock).not.toHaveBeenCalled();
      expect(setNewSheetName).not.toHaveBeenCalled();
    });

    it('should create a sheet with default name if newSheetName is empty', async () => {
      (createSheet as jest.Mock).mockResolvedValue({ success: true });

      await handleCreateSheet('testUser', '', setNewSheetName, 1, setSheetCounter, setError, fetchSheetsMock);

      expect(createSheet).toHaveBeenCalledWith('testUser', 'Sheet1');
      expect(fetchSheetsMock).toHaveBeenCalled();
      expect(setNewSheetName).toHaveBeenCalledWith('');
      expect(setSheetCounter).toHaveBeenCalledWith(2);
      expect(setError).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteSheet', () => {
    /**
     * Tests for the handleDeleteSheet function, ensuring it handles sheet deletion and updates sheets if successful,
     * and sets an error message if deleting sheet fails.
     * @author BrandonPetersen
     */
    it('should delete a sheet and update sheets if successful', async () => {
      const sheets = [{ id: '1', name: 'Sheet1' }];
      (deleteSheet as jest.Mock).mockResolvedValue({ success: true });

      await handleDeleteSheet('testUser', 'Sheet1', setSheets, sheets, setError);

      expect(deleteSheet).toHaveBeenCalledWith('testUser', 'Sheet1');
      expect(setSheets).toHaveBeenCalledWith([]);
      expect(setError).not.toHaveBeenCalled();
    });

    it('should set error if deleting sheet fails', async () => {
      const sheets = [{ id: '1', name: 'Sheet1' }];
      (deleteSheet as jest.Mock).mockResolvedValue({ success: false });

      await handleDeleteSheet('testUser', 'Sheet1', setSheets, sheets, setError);

      expect(setError).toHaveBeenCalledWith('Failed to delete sheet');
      expect(setSheets).not.toHaveBeenCalled();
    });
  });

  describe('handleRegister', () => {
    /**
     * Tests for the handleRegister function, ensuring it handles registration, fetches sheets,
     * and sets registration status if successful, and sets an error message if registration fails.
     * @author BrandonPetersen
     */
    it('should register, fetch sheets, and set registration status if successful', async () => {
      (register as jest.Mock).mockResolvedValue({ success: true });

      await handleRegister(setIsRegistered, setError, fetchSheetsMock, fetchOtherSheetsMock);

      expect(register).toHaveBeenCalled();
      expect(setIsRegistered).toHaveBeenCalledWith(true);
      expect(fetchSheetsMock).toHaveBeenCalled();
      expect(fetchOtherSheetsMock).toHaveBeenCalledWith([]);
      expect(setError).not.toHaveBeenCalled();
    });

    it('should set error if registration fails', async () => {
      (register as jest.Mock).mockResolvedValue({ success: false });

      await handleRegister(setIsRegistered, setError, fetchSheetsMock, fetchOtherSheetsMock);

      expect(setError).toHaveBeenCalledWith('Failed to register');
      expect(setIsRegistered).not.toHaveBeenCalled();
      expect(fetchSheetsMock).not.toHaveBeenCalled();
      expect(fetchOtherSheetsMock).not.toHaveBeenCalled();
    });
  });
});
