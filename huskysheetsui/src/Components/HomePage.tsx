// src/Components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { createSheet, getSheets, deleteSheet, getPublishers, register } from '../Utilities/utils';
// Ownership : Shaanpatel1213
const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;
// Ownership : Shaanpatel1213
const NavBar = styled.nav`
  width: 100%;
  background: #007bff;
  color: #fff;
  padding: 10px;
  text-align: center;
`;
// Ownership : Shaanpatel1213
const MainContent = styled.div`
  margin-top: 20px;
  width: 80%;
`;
// Ownership : Shaanpatel1213
const SheetList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
// Ownership : Shaanpatel1213
const SheetItem = styled.div`
  background: #f0f0ff;
  border: 1px solid #ccc;
  padding: 10px;
  width: 75px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
`;
// Ownership : Shaanpatel1213
const AddSheetButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 30px;
  cursor: pointer;
  font-size: 50px;
`;

//Ownership : BrandonPetersen
const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 5px;
`;

//Ownership : BrandonPetersen
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

//Ownership : BrandonPetersen
const SheetInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

//Ownership : BrandonPetersen
const CreateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
`;

//Ownership : BrandonPetersen
const RegisterButton = styled.button`
  background: green;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
`;
// HomePage component definition
// Ownership: Shaanpatel1213 and BrandonPetersen
const HomePage: React.FC = () => {
  const userName = localStorage.getItem('userName') || '';
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]);
  const [otherSheets, setOtherSheets] = useState<{ publisher: string; sheets: { id: string; name: string }[] }[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [sheetCounter, setSheetCounter] = useState(1);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkPublisher();
  }, []);


    /**
   * Checks if the current user is a registered publisher and fetches sheets.
   * Ownership: BrandonPetersen
   */
  const checkPublisher = async () => {
    const result = await getPublishers();
    if (result && result.success) {
      const userNames = result.value.map((publisher: { publisher: string }) => publisher.publisher);
      if (userNames.includes(userName)) {
        setIsRegistered(true);
        fetchSheets();
        fetchOtherSheets(userNames.filter((name: string) => name !== userName));
      }
    } else {
      setError('Failed to fetch publishers');
    }
  };

     /**
   * Fetches sheets for the current user.
   * @returns {sheets[]} - List of sheets beloning to each publisher with the user's name
   *
   * Ownership: BrandonPetersen
   */
  const fetchSheets = async () => {
    const result = await getSheets(userName);
    if (result && result.success) {
      setSheets(result.value.map(sheet => ({ id: sheet.id, name: sheet.sheet })));
    } else {
      setError('Failed to fetch sheets');
    }
  };

    /**
   * Fetches sheets for other publishers.
   * @param {string[]} otherPublishers - List of other publishers.
   * @returns {sheets[]} - List of sheets beloning to each publisher
   *
   * Ownership: BrandonPetersen
   */
  const fetchOtherSheets = async (otherPublishers: string[]) => {
    const allSheets = await Promise.all(otherPublishers.map(async (publisher) => {
      const result = await getSheets(publisher);
      if (result && result.success) {
        return { publisher, sheets: result.value.map(sheet => ({ id: sheet.id, name: sheet.sheet })) };
      } else {
        return { publisher, sheets: [] };
      }
    }));
    setOtherSheets(allSheets);
  };

  /**
   * Handles the creation of a new sheet using the sheet name in the input bar
   * Ownership: BrandonPetersen
   */
  const handleCreateSheet = async () => {
    let sheetName = newSheetName.trim();
    if (!sheetName) {
      sheetName = `Sheet${sheetCounter}`;
      setSheetCounter(sheetCounter + 1);
    }
    console.log('Attempting to create sheet with name:', sheetName); // Log the sheet name
    const result = await createSheet(userName, sheetName);
    console.log('Create sheet result:', result); // Log the result
    if (result && result.success) {
      fetchSheets();
      setNewSheetName('');
    } else {
      setError('Failed to create sheet');
    }
  };


  /**
   * Handles the deletion of a sheet.
   * @param {string} sheet - The name of the sheet to delete.
   * @returns {Promise<void>}
   *
   * Ownership: BrandonPetersen
   */
  const handleDeleteSheet = async (sheet: string) => {
    const sheetName = sheet;
    console.log('Attempting to delete sheet with name:', sheetName); // Log the sheet ID
    const result = await deleteSheet(userName, sheetName);
    console.log('Delete sheet result:', result); // Log the result
    if (result && result.success) {
      setSheets(sheets.filter(sheet => sheet.name !== sheetName)); // Update state immediately
    } else {
      setError('Failed to delete sheet');
    }
  };

    /**
   * Handles the registration of a new publisher.
   *
   * Ownership: BrandonPetersen
   */
  const handleRegister = async () => {
    const result = await register();
    if (result && result.success) {
      setIsRegistered(true);
      fetchSheets();
      fetchOtherSheets([]);
    } else {
      setError('Failed to register');
    }
  };
// Ownership : Shaanpatel1213
  return (
    <HomePageContainer>
      <NavBar>
        <h1>HomePage</h1>
      </NavBar>
      <MainContent>
        {error && <p className="error">{error}</p>}
        {isRegistered ? (
          <>
            <h2>{userName}'s sheets</h2>
            <InputContainer>
              <SheetInput
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Enter new sheet name"
              />
              <CreateButton onClick={handleCreateSheet}>Create Sheet</CreateButton>
            </InputContainer>
            <SheetList>
              {sheets.map((sheet) => (
                <SheetItem key={sheet.id}>
                  <Link to={`/spreadsheet/${userName}/${sheet.name}/${sheet.id}/false`}>{sheet.name}</Link>
                  <DeleteButton onClick={() => handleDeleteSheet(sheet.name)}>X</DeleteButton>
                </SheetItem>
              ))}
              <SheetItem>
                <AddSheetButton onClick={handleCreateSheet}>+</AddSheetButton>
              </SheetItem>
            </SheetList>

            <h2>Other Publishers' Sheets</h2>
            {otherSheets.map((publisherSheets) => (
              <div key={publisherSheets.publisher}>
                <h3>{publisherSheets.publisher}</h3>
                <SheetList>
                  {publisherSheets.sheets.map((sheet) => (
                    <SheetItem key={sheet.name}>
                     <Link to={`/spreadsheet/${publisherSheets.publisher}/${sheet.name}/${sheet.id}/true`}>{sheet.name}</Link>
                    </SheetItem>
                  ))}
                </SheetList>
              </div>
            ))}
          </>
        ) : (
          <RegisterButton onClick={handleRegister}>Register as Publisher</RegisterButton>
        )}
      </MainContent>
    </HomePageContainer>
  );
};

export { HomePage}
