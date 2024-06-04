import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { register, getPublishers } from '../Utilities/utils';
import './login.css';

const Login = () => {
  const history = useHistory();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!userName || !password) {
      setError('Please fill in both fields');
      return;
    }

    // Encode credentials and set it to localStorage
    const auth = btoa(`${userName}:${password}`);
    localStorage.setItem('auth', auth);

    // Register with the server
    const result = await register();
    console.log('Register result:', result); // Log the result of the register function
    if (result && result.success) {
      // Fetch publishers to validate user
      const publishersResult = await getPublishers();
      console.log('Get publishers result:', publishersResult); // Log the result of the getPublishers function
      if (publishersResult && publishersResult.success) {
        const userNames = publishersResult.value.map((publisher: { publisher: string }) => publisher.publisher);
        if (userNames.includes(userName)) {
          history.push('/home');
        } else {
          setError('Incorrect username or password');
        }
      } else {
        setError('Failed to fetch publishers.');
      }
    } else {
      setError('Failed to register.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="Username">Username:</label>
          <input
            type="text"
            id="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export { Login };
