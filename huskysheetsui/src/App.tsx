// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Spreadsheet from './Components/Spreadsheet';
import './App.css';
import './Components/login.css';
import {Login} from "./Components/Login";
import {HomePage} from "./Components/HomePage";

interface Sheet {
  id: number;
  name: string;
}

const App: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([{ id: 1, name: 'Sheet 1' }]);
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const [nextSheetId, setNextSheetId] = useState<number>(2);

  const addSheet = () => {
    const newSheet: Sheet = { id: nextSheetId, name: `Sheet ${nextSheetId}` };
    setSheets([...sheets, newSheet]);
    setActiveSheet(newSheet.id);
    setNextSheetId(nextSheetId + 1);
  };

  const removeSheet = (id: number) => {
    if (sheets.length > 1) {
      const newSheets = sheets.filter(sheet => sheet.id !== id);
      setSheets(newSheets);
      if (activeSheet === id) {
        setActiveSheet(newSheets[0].id);
      }
    }
  };

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <Login />
        </Route>
        <Route path="/home">
          <HomePage />
        </Route>
        <Route path="/spreadsheet/">
          <Spreadsheet />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
