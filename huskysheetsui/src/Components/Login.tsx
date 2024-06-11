import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { handleSubmit } from '../componentHelpers/loginHelpers';
import '../css/login.css';

const Login = () => {
  const history = useHistory();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(userName, password, setError, history);
  };

  // Ownership: Shaanpatel1213
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
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
