// src/App.tsx
import React from 'react';
import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom';
import { Spreadsheet } from './Components/Spreadsheet';
import './App.css';
import './css/login.css';
import { Login } from "./Components/Login";
import { HomePage } from "./Components/HomePage";



/**
 * SpreadsheetPage component that retrieves parameters from the URL and renders the Spreadsheet component.
 *
 * @author BrandonPetersen
 */
const SpreadsheetPage: React.FC = () => {
  const { id, name, publisher, isSubscriber } = useParams<{ publisher: string, name: string, id: string, isSubscriber: string }>();
  return (
    <Spreadsheet sheet={{ publisher, name, id: Number(id)}} isSubscriber={isSubscriber === 'true'} />
  );
};
// Ownership : Shaanpatel1213
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <Login />
        </Route>
        <Route path="/home">
          <HomePage />
        </Route>
        <Route path="/spreadsheet/:publisher/:name/:id/:isSubscriber">
          <SpreadsheetPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
