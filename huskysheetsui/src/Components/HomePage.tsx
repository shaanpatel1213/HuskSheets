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

/**
 * The HomePage component renders the main dashboard for users.
 * It allows users to view, create, and delete their sheets, as well as view sheets from other publishers.
 * 
 * @component
 * @returns {JSX.Element} The rendered component
 * @author BrandonPetersen
 */
const HomePage: React.FC = () => {
  const userName = sessionStorage.getItem('userName') || ''; // Get the userName from sessionStorage
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]); // State to store user's sheets
  const [otherSheets, setOtherSheets] = useState<{ publisher: string; sheets: { id: string; name: string }[] }[]>([]); // State to store other publishers' sheets
  const [newSheetName, setNewSheetName] = useState(''); // State to store the new sheet name input
  const [sheetCounter, setSheetCounter] = useState(1); // State to store the sheet counter for default names
  const [error, setError] = useState(''); // State to store error messages
  const [isRegistered, setIsRegistered] = useState(false); // State to store the registration status
  const history = useHistory(); // useHistory hook to handle navigation

  // useEffect to check if the user is a publisher and fetch their sheets and other publishers' sheets
  useEffect(() => {
    checkPublisher(userName, setIsRegistered, () => fetchSheets(userName, setSheets, setError), (userNames) => fetchOtherSheets(userNames, setOtherSheets), setError);
  }, [userName]);

  // Function to handle user logout
  const handleLogout = () => {
    sessionStorage.removeItem('userName'); // Clear userName from sessionStorage
    sessionStorage.removeItem('password'); // Clear password from sessionStorage
    history.push('/'); // Redirect to the login page
  };

  return (
    <div className="homepage-container">
      <div className="navbar">
        <h1>HomePage</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button> {/* Logout button */}
      </div>
      <div className="main-content">
        {error && <p className="error">{error}</p>} {/* Display error messages */}
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
                    <div className="sheet-item" key={sheet.id}>
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
