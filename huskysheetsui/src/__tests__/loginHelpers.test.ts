import { handleSubmit } from '../componentHelpers/loginHelpers';
import { createMemoryHistory } from 'history';

describe('handleSubmit', () => {
  let setError: jest.Mock;
  let history: ReturnType<typeof createMemoryHistory>;

  beforeEach(() => {
    setError = jest.fn();
    history = createMemoryHistory();
    history.push = jest.fn(); // Mock the push function

    // Mock localStorage
    const localStorageMock = (function() {
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
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Spy on localStorage methods
    jest.spyOn(localStorage, 'setItem');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set auth and userName in localStorage and redirect if credentials are correct', async () => {
    await handleSubmit('team18', 'qdKoHqmiP@6x`_1Q', setError, history);

    expect(localStorage.setItem).toHaveBeenCalledWith('auth', btoa('team18:qdKoHqmiP@6x`_1Q'));
    expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'team18');
    expect(history.push).toHaveBeenCalledWith('/home');
  });

  test('should set error if credentials are incorrect', async () => {
    await handleSubmit('wrongUser', 'wrongPass', setError, history);

    expect(setError).toHaveBeenCalledWith('Incorrect username or password');
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
  });
});