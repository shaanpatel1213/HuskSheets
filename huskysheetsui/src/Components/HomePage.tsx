// src/Components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { createSheet, getSheets, deleteSheet, getPublishers, register } from '../Utilities/utils';

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const NavBar = styled.nav`
  width: 100%;
  background: #007bff;
  color: #fff;
  padding: 10px;
  text-align: center;
`;

const MainContent = styled.div`
  margin-top: 20px;
  width: 80%;
`;

const SheetList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

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

const AddSheetButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 30px;
  cursor: pointer;
  font-size: 50px;
`;

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

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const SheetInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const CreateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
`;

const RegisterButton = styled.button`
  background: green;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
`;

const HomePage: React.FC = () => {
  const userName = 'team18';
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([]);
  const [otherSheets, setOtherSheets] = useState<{ publisher: string; sheets: { id: string; name: string }[] }[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [sheetCounter, setSheetCounter] = useState(1);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkPublisher();
  }, []);

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

  const fetchSheets = async () => {
    const result = await getSheets(userName);
    if (result && result.success) {
      setSheets(result.value.map(sheet => ({ id: sheet.id, name: sheet.sheet })));
    } else {
      setError('Failed to fetch sheets');
    }
  };

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

  const handleSheetClick = (id: string) => {
    // Update this to navigate to the correct sheet
    // history.push(`/spreadsheet/${id}`);
  };

  return (
    <HomePageContainer>
      <NavBar>
        <h1>HomePage</h1>
      </NavBar>
      <MainContent>
        {error && <p className="error">{error}</p>}
        {isRegistered ? (
          <>
            <h2>My Sheets</h2>
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
                  <Link to={`/spreadsheet/${sheet.id}`}>{sheet.name}</Link>
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
                    <SheetItem key={sheet.id}>
                      <Link to={`/spreadsheet/${sheet.id}`}>{sheet.name}</Link>
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

export { HomePage };
