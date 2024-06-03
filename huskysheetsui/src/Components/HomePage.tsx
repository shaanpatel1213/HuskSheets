
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

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
`;

const AddSheetButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 30px;
  cursor: pointer;
  font-size: 50px;
`;

const HomePage: React.FC = () => {
    const [sheets, setSheets] = useState<string[]>(['Sheet1', 'Sheet2']);

    const addSheet = () => {
        const newSheet = `Sheet${sheets.length + 1}`;
        setSheets([...sheets, newSheet]);
    };

    return (
        <HomePageContainer>
            <NavBar>
                <h1>HomePage</h1>
            </NavBar>
            <MainContent>
                <SheetList>
                    {sheets.map(sheet => (
                        <SheetItem key={uuidv4()}>
                            <Link to={`/spreadsheet`}>{sheet}</Link>
                        </SheetItem>
                    ))}
                    <SheetItem>
                        <AddSheetButton onClick={addSheet}>+</AddSheetButton>
                    </SheetItem>
                </SheetList>
            </MainContent>
        </HomePageContainer>
    );
};

export {HomePage};
