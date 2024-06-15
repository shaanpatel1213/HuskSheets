import { handleSubmit } from '../componentHelpers/loginHelpers';
import { createMemoryHistory } from 'history';

/**
 * Tests the login helpers file
 * 
 * Ownership: @auth BrandonPetersen
 */
describe('handleSubmit', () => {
  /**
   * Tests for the handleSubmit function, ensuring it handles login correctly, sets session storage, 
   * and redirects on success or sets an error message on failure.
   * @owner BrandonPetersen
   */
  let setError: jest.Mock;
  let history: ReturnType<typeof createMemoryHistory>;

  beforeEach(() => {
    setError = jest.fn();
    history = createMemoryHistory();
    history.push = jest.fn(); // Mock the push function

    // Mock sessionStorage
    const sessionStorageMock = (function() {
      let store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value;
        },
        clear() {
          store = {};
        },
        removeItem(key: string) {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    });

    // Spy on sessionStorage methods
    jest.spyOn(sessionStorage, 'setItem');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set auth and userName in sessionStorage and redirect if credentials are correct', async () => {
    await handleSubmit('team18', 'qdKoHqmiP@6x`_1Q', setError, history);

    expect(sessionStorage.setItem).toHaveBeenCalledWith('auth', btoa('team18:qdKoHqmiP@6x`_1Q'));
    expect(sessionStorage.setItem).toHaveBeenCalledWith('userName', 'team18');
    expect(history.push).toHaveBeenCalledWith('/home');
  });

  test('should set error if credentials are incorrect', async () => {
    await handleSubmit('wrongUser', 'wrongPass', setError, history);

    expect(setError).toHaveBeenCalledWith('Incorrect username or password');
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
  });
});
