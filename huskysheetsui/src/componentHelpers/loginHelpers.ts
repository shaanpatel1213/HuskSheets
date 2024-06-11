import { useHistory } from 'react-router-dom';
import { getPublishers } from '../Utilities/utils';

/**
 * Handles the submission of the login form.
 * @param {string} userName - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @param {Function} setError - Function to set error messages.
 * @param {Function} history - React Router's useHistory hook.
 */
export const handleSubmit = async (
  userName: string,
  password: string,
  setError: (error: string) => void,
  history: ReturnType<typeof useHistory>
) => {
  if (!userName || !password) {
    setError('Please fill in both fields');
    return;
  }

  // Encode credentials and set it to localStorage
  const auth = btoa(`${userName}:${password}`);
  if (auth === btoa('team18:qdKoHqmiP@6x`_1Q')) {
    localStorage.setItem('auth', auth);
    localStorage.setItem('userName', userName);
    history.push('/home');
  } else {
    setError('Incorrect username or password');
  }
};