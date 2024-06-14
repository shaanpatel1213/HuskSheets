import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  checkPublisher,
  fetchSheets,
  fetchOtherSheets,
  handleCreateSheet,
  handleDeleteSheet,
  handleRegister
} from '../componentHelpers/homePageHelpers';
import '../css/HomePage.css';

// Ownership: @author : Shaanpatel1213 
const HomePage: React.FC = () => {
  const userName = localStorage.getItem('userName') || '';
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]);
  const [otherSheets, setOtherSheets] = useState<{ publisher: string; sheets: { id: string; name: string }[] }[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [sheetCounter, setSheetCounter] = useState(1);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const history = useHistory(); // useHistory hook

  useEffect(() => {
    checkPublisher(userName, setIsRegistered, () => fetchSheets(userName, setSheets, setError), (userNames) => fetchOtherSheets(userNames, setOtherSheets), setError);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName'); // Clear user data from local storage
    localStorage.removeItem('password'); // Clear user data from local storage
    history.push('/'); // Redirect to login page
  };

  return (
    <div className="homepage-container">
      <div className="navbar">
        <h1>HomePage</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button> {/* Add Logout button */}
      </div>
      <div className="main-content">
        {error && <p className="error">{error}</p>}
        {isRegistered ? (
          <>
            <h2>{userName}'s sheets</h2>
            <div className="input-container">
              <input
                type="text"
                className="sheet-input"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Enter new sheet name"
              />
              <button
                className="create-button"
                onClick={() =>
                  handleCreateSheet(
                    userName,
                    newSheetName,
                    setNewSheetName,
                    sheetCounter,
                    setSheetCounter,
                    setError,
                    () => fetchSheets(userName, setSheets, setError)
                  )
                }
              >
                Create Sheet
              </button>
            </div>
            <div className="sheet-list">
              {sheets.map((sheet) => (
                <div className="sheet-item" key={sheet.id}>
                  <Link to={`/spreadsheet/${userName}/${sheet.name}/${sheet.id}/false`}>{sheet.name}</Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSheet(userName, sheet.name, setSheets, sheets, setError)}
                  >
                    X
                  </button>
                </div>
              ))}
              <div className="sheet-item">
                <button
                  className="add-sheet-button"
                  onClick={() =>
                    handleCreateSheet(
                      userName,
                      newSheetName,
                      setNewSheetName,
                      sheetCounter,
                      setSheetCounter,
                      setError,
                      () => fetchSheets(userName, setSheets, setError)
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            <h2>Other Publishers' Sheets</h2>
            {otherSheets.map((publisherSheets) => (
              <div key={publisherSheets.publisher}>
                <h3>{publisherSheets.publisher}</h3>
                <div className="sheet-list">
                  {publisherSheets.sheets.map((sheet) => (
                    <div className="sheet-item" key={sheet.name}>
                      <Link to={`/spreadsheet/${publisherSheets.publisher}/${sheet.name}/${sheet.id}/true`}>
                        {sheet.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <button
            className="register-button"
            onClick={() =>
              handleRegister(
                setIsRegistered,
                setError,
                () => fetchSheets(userName, setSheets, setError),
                (userNames) => fetchOtherSheets(userNames, setOtherSheets)
              )
            }
          >
            Register as Publisher
          </button>
        )}
      </div>
    </div>
  );
};

export { HomePage };
