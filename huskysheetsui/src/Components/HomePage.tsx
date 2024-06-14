import React, {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import {
  checkPublisher,
  fetchSheets,
  fetchOtherSheets,
  handleCreateSheet,
  handleDeleteSheet,
  handleRegister
} from '../componentHelpers/homePageHelpers';
import '../css/HomePage.css';
import events from "node:events";
import {updatePublished} from "../Utilities/utils";


// Ownership: @author : Shaanpatel1213 
const HomePage: React.FC = () => {
  const userName = localStorage.getItem('userName') || '';
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]);
  const [otherSheets, setOtherSheets] = useState<{ publisher: string; sheets: { id: string; name: string }[] }[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [sheetCounter, setSheetCounter] = useState(1);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    checkPublisher(userName, setIsRegistered, () => fetchSheets(userName, setSheets, setError), (userNames) => fetchOtherSheets(userNames, setOtherSheets), setError);
  }, []);

  function concatenateStrings(array: string[][]): string {
    let result = '';

    for (let row = 0; row < array.length; row++) {
      for (let col = 0; col < array[row].length; col++) {
        const cellValue = array[row][col];
        const cellReference = `$${String.fromCharCode(65 + col)}${row + 1}`;
        result += `${cellReference} \\ "${cellValue}" `;
      }
    }

    return result.trim();
  }

  const handleButtonClick = () => {
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  };

  const ReadFileContent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    let dataTable = new Array<Array<string>>()
    let fileContent = "";
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
       fileContent = e.target?.result as string;
      };
      reader.readAsText(file)

    }
    return fileContent
  };

  return (
    <div className="homepage-container">
      <div className="navbar">
        <h1>HomePage</h1>
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
              <button onClick={handleButtonClick}>
                Upload Sheet
              </button>
              <input
                  type="file"
                  ref={fileInputRef}
                  style={{display: 'none'}}
                  onChange={(e)=> {
                    const data = ReadFileContent(e)
                    const returns = handleCreateSheet(
                        userName,
                        "IMPORTED :" + newSheetName,
                        setNewSheetName,
                        sheetCounter,
                        setSheetCounter,
                        setError,
                        () => fetchSheets(userName, setSheets, setError)
                    )
                    updatePublished(userName, newSheetName, data)
                  }}
              />
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
