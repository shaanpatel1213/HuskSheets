// src/Spreadsheet.tsx
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import './Spreadsheet.css';

interface SpreadsheetProps {}

type CellData = string;
type RowData = CellData[];
type TableData = RowData[];

const Spreadsheet: React.FC<SpreadsheetProps> = () => {
  const initialRows = 10;
  const initialCols = 10;

  // Initialize the data with 10 rows and 10 columns
  const initialData: TableData = Array.from({ length: initialRows }, () => Array(initialCols).fill(''));

  const [data, setData] = useState<TableData>(initialData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);

  const evaluateFormula = (formula: string): string => {
    try {
      const result = Function('"use strict";return (' + formula + ')')();
      return result.toString();
    } catch {

    }
    return 'ERROR';
  };

  const parseCellReference = (ref: string): string => {
    ref = ref.substring(1)
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return ref;

    const colLetters = match[1];
    const rowIndex = parseInt(match[2], 10) - 1;

    let colIndex = 0;
    for (let i = 0; i < colLetters.length; i++) {
      colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
    }
    colIndex -= 1;

    if (rowIndex < 0 || rowIndex >= data.length || colIndex < 0 || colIndex >= data[0].length) {
      return 'ERROR';
    }

    return data[rowIndex][colIndex];
  };
  function evaluateCell(cell: string){
    if (cell.startsWith('=')) {
      const formula = cell.slice(1).replace(/\$[A-Z]+\d+/g, parseCellReference);
      let value = evaluateFormula(formula);
      if (value === "true"){
        value = "1"
      }
       if (value === "false"){
        value = "0"
      }
       return value
    }
    return cell;
  }
  const handleChange = (rowIndex: number, colIndex: number, value: string) => {
    // need to send string to
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setData(newData);
  };

  const CalculateCell = (rowIndex: number, colIndex: number, value: string) => {
    // need to send string to
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? evaluateCell(value) : cell))
    );
    setData(newData);
  };


  const addRow = () => {
    const newRow: RowData = new Array(data[0].length).fill('');
    setData([...data, newRow]);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
  };

  const removeRow = () => {
    if (data.length > 1) {
      setData(data.slice(0, -1));
    }
  };

  const removeColumn = () => {
    if (data[0].length > 1) {
      const newData = data.map(row => row.slice(0, -1));
      setData(newData);
    }
  };

  const getColumnLetter = (colIndex: number): string => {
    let letter = '';
    while (colIndex >= 0) {
      letter = String.fromCharCode((colIndex % 26) + 65) + letter;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
  };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const horizontalScrollbar = horizontalScrollbarRef.current;

    const syncScroll = () => {
      if (horizontalScrollbar && tableContainer) {
        horizontalScrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const syncTableScroll = () => {
      if (horizontalScrollbar && tableContainer) {
        tableContainer.scrollLeft = horizontalScrollbar.scrollLeft;
      }
    };

    if (tableContainer && horizontalScrollbar) {
      tableContainer.addEventListener('scroll', syncScroll);
      horizontalScrollbar.addEventListener('scroll', syncTableScroll);
    }

    return () => {
      if (tableContainer && horizontalScrollbar) {
        tableContainer.removeEventListener('scroll', syncScroll);
        horizontalScrollbar.removeEventListener('scroll', syncTableScroll);
      }
    };
  }, []);

  return (
    <div className="spreadsheet-container">
      <div className="controls">
        <button onClick={addRow}>Add Row</button>
        <button onClick={removeRow}>Remove Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={removeColumn}>Remove Column</button>
      </div>
      <div className="table-outer-container">
        <div className="table-container" ref={tableContainerRef}>
          <table>
            <thead>
              <tr>
                <th></th>
                {data[0].map((_, colIndex) => (
                  <th key={colIndex}>{getColumnLetter(colIndex)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{rowIndex + 1}</td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChange(rowIndex, colIndex, e.target.value)
                        }
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          CalculateCell(rowIndex, colIndex, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
