// src/Components/Login.tsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getPublishers } from '../Utilities/utils';
import './login.css';

// Ownership : Shaanpatel1213
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
    if (auth === btoa('team18:qdKoHqmiP@6x`_1Q')) {
      localStorage.setItem('auth', auth);
      history.push('/home');
    } else {
      setError('Incorrect username or password');
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
