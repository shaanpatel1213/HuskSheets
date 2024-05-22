const express = require('express');

const router = express.Router();

interface Spreadsheet {
  id: string;
  name: string;
  data: string[][];
}

const spreadsheets: Spreadsheet[] = [];
let nextId = 1;

router.post('/create', (req, res) => {
  const name = req.body.name;
  const newSpreadsheet: Spreadsheet = {
    id: nextId.toString(),
    name,
    data: Array(10).fill(Array(10).fill('')),
  };
  spreadsheets.push(newSpreadsheet);
  nextId += 1;
  res.json({ success: true, spreadsheet: newSpreadsheet });
});

router.get('/list', (req, res) => {
  res.json({ success: true, spreadsheets });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const spreadsheet = spreadsheets.find((sheet) => sheet.id === id);
  if (spreadsheet) {
    res.json({ success: true, spreadsheet });
  } else {
    res.json({ success: false, message: 'Spreadsheet not found' });
  }
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body.data;
  const spreadsheet = spreadsheets.find((sheet) => sheet.id === id);
  if (spreadsheet) {
    spreadsheet.data = data;
    res.json({ success: true, spreadsheet });
  } else {
    res.json({ success: false, message: 'Spreadsheet not found' });
  }
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = spreadsheets.findIndex((sheet) => sheet.id === id);
  if (index !== -1) {
    spreadsheets.splice(index, 1);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Spreadsheet not found' });
  }
});

export default router;