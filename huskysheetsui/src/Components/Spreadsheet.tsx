import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import '../css/Spreadsheet.css';
import {
  fetchUpdates,
  addUpdates,
  saveUpdates,
  evaluateCell,
  parseUpdate,
  getColumnLetter,
  colToIndex
} from '../componentHelpers/spreadsheetHelpers';
import { type TableData } from '../Utilities/CellFunctionalities';

interface SpreadsheetProps {
  sheet: Sheet;
  isSubscriber: boolean;
}

interface Sheet {
  id: number | null;
  name: string;
  publisher: string;
}

type CellData = string;
type RowData = CellData[];

const Spreadsheet: React.FC<SpreadsheetProps> = ({ sheet, isSubscriber }) => {
  const initialRows = 10;
  const initialCols = 10;

  // Initialize the data with 10 rows and 10 columns
  const initialData: TableData = Array.from({ length: initialRows }, () => Array(initialCols).fill(''));

  const [visualData, setVisualData] = useState<TableData>(initialData);
  const [literalString, setLiteralString] = useState<TableData>(initialData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const updates = useRef<string>("");
  const [sheetId, setSheetId] = useState<number | null>(sheet.id);

  const upDateAllCells = () => {
    let newData = visualData;
    for (let i = 0; i < visualData.length; i++) {
      for (let j = 0; j < visualData[0].length; j++) {
        newData = visualData.map((row, rIdx) =>
          row.map((cell, cIdx) => (rIdx === i && cIdx === j ? evaluateCell(literalString[i][j], visualData) : cell))
        );
      }
    }
    setVisualData(newData);
  };

  // Ownership : Shaanpatel1213
  const handleChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = literalString.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setLiteralString(newData);
    setVisualData(newData);
  };

  // Ownership : Shaanpatel1213
  const handleBlur = (rowIndex: number, colIndex: number, value: string) => {
    CalculateCell(rowIndex, colIndex, value);
    addUpdates(rowIndex, colIndex, value, updates, getColumnLetter);
  };

  // Ownership : Shaanpatel1213
  const CalculateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = visualData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? evaluateCell(value, visualData) : cell))
    );
    setVisualData(newData);
  };

  const handleFocus = (rows: number, col: number) => {
    const newData = visualData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rows && cIdx === col ? literalString[rows][col] : cell))
    );
    setVisualData(newData);
  };

  // Ownership : Shaanpatel1213
  const addRow = () => {
    const newRow: RowData = new Array(visualData[0].length).fill('');
    setVisualData([...visualData, newRow]);
  };

  // Ownership : Shaanpatel1213
  const addColumn = () => {
    const newData = visualData.map(row => [...row, '']);
    setVisualData(newData);
  };

  // Ownership : Shaanpatel1213
  const removeRow = () => {
    if (visualData.length > 1) {
      setVisualData(visualData.slice(0, -1));
    }
  };

  // Ownership : Shaanpatel1213
  const removeColumn = () => {
    if (visualData[0].length > 1) {
      const newData = visualData.map(row => row.slice(0, -1));
      setVisualData(newData);
    }
  };

  useEffect(() => {
    fetchUpdates(sheet, sheetId, isSubscriber, initialData, setLiteralString, setVisualData, parseUpdate);
    upDateAllCells();
  }, []);

  // Ownership : Shaanpatel1213
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const horizontalScrollbar = horizontalScrollbarRef.current;

    const syncScroll = () => {
      if (horizontalScrollbar && tableContainer) {
        horizontalScrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };

    // Ownership : Shaanpatel1213
    const syncTableScroll = () => {
      if (horizontalScrollbar && tableContainer) {
        tableContainer.scrollLeft = horizontalScrollbar.scrollLeft;
      }
    };

    // Ownership : Shaanpatel1213
    if (tableContainer && horizontalScrollbar) {
      tableContainer.addEventListener('scroll', syncScroll);
      horizontalScrollbar.addEventListener('scroll', syncTableScroll);
    }

    // Ownership : Shaanpatel1213
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
        <button onClick={() => saveUpdates(isSubscriber, sheet, updates, sheetId, setSheetId)}>Save</button>
      </div>
      <div className="table-outer-container">
        <div className="table-container" ref={tableContainerRef}>
          <table>
            <thead>
              <tr>
                <th></th>
                {visualData[0].map((_, colIndex) => (
                  <th key={colIndex}>{getColumnLetter(colIndex)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visualData.map((row, rowIndex) => (
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
                          handleBlur(rowIndex, colIndex, e.target.value)
                        }
                        onClick={(e) =>
                          handleFocus(rowIndex, colIndex)
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

export { Spreadsheet, type TableData, type SpreadsheetProps, type Sheet };
