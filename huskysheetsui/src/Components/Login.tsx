
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'
import {register} from "../Utilies/spreadsheets";
import {getPublishers} from "../Utilies/spreadsheets";


interface ILogin{}
const Login = () => {
    const history = useHistory();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        // Simple validation
        if (!userName || !password) {
            setError('Please fill in both fields');
            return;
        }
        const userNames  = getPublishers
        // if (userNames.includes(userName)) {
        //     history.push("/home")
        // }else{
        //     setError('Incorrect username or password');
        // }




        // for now just go to the dashboard later we will check if login is valid here.
        history.push("/home")
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="Username">Username:</label>
                    <input
                        type="Username"
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

export {Login};
