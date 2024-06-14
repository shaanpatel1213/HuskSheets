import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import '../css/Spreadsheet.css';
import {
  fetchUpdates,
  addUpdates,
  saveUpdates,
  evaluateCell,
  parseUpdate,
  getColumnLetter,
  evaluateAllCells,
  DependencyGraph
} from '../componentHelpers/spreadsheetHelpers';
import { type TableData } from '../Utilities';

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
  const initialRows = 25;
  const initialCols = 25;
  // Initialize the data with 25 rows and 25 columns
  const initialData: TableData = Array.from({ length: initialRows }, () => Array(initialCols).fill(''));

  const [visualData, setVisualData] = useState<TableData>(initialData);
  const [literalString, setLiteralString] = useState<TableData>(initialData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const updates = useRef<string>("");
  const [sheetId, setSheetId] = useState<number | null>(sheet.id);
  const [editingCell, setEditingCell] = useState<{ row: number, col: number } | null>(null);

  const dependencyGraph = useRef(new DependencyGraph());

  const updateAllCells = (data: TableData) => {
    const newData = evaluateAllCells(data, dependencyGraph.current);
    setVisualData(newData);
  };

  const handleChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = literalString.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setLiteralString(newData);
  };

  const handleBlur = (rowIndex: number, colIndex: number, value: string) => {
    calculateCell(rowIndex, colIndex, value, literalString, setLiteralString, setVisualData, dependencyGraph.current);
    addUpdates(rowIndex, colIndex, value, updates, getColumnLetter);
    setEditingCell(null);
  };

  const calculateCell = (
    rowIndex: number, colIndex: number, value: string, 
    data: TableData, setLiteralString: (data: TableData) => void, setVisualData: (data: TableData) => void, dependencyGraph: DependencyGraph
  ) => {
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
  
    setLiteralString(newData);
  
    // Rebuild the dependency graph and re-evaluate all cells
    dependencyGraph = new DependencyGraph();
    const evaluatedData = evaluateAllCells(newData, dependencyGraph);
    setVisualData(evaluatedData);
  };

  const handleFocus = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    const newData = visualData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? literalString[rowIndex][colIndex] : cell))
    );
    setVisualData(newData);
  };

  const addRow = () => {
    const newRow: RowData = new Array(visualData[0].length).fill('');
    const newData = [...visualData, newRow];
    setVisualData(newData);
    setLiteralString(newData);
  };

  const addColumn = () => {
    const newData = visualData.map(row => [...row, '']);
    setVisualData(newData);
    setLiteralString(newData);
  };

  const removeRow = () => {
    if (visualData.length > 1) {
      const newData = visualData.slice(0, -1);
      setVisualData(newData);
      setLiteralString(newData);
    }
  };

  const removeColumn = () => {
    if (visualData[0].length > 1) {
      const newData = visualData.map(row => row.slice(0, -1));
      setVisualData(newData);
      setLiteralString(newData);
    }
  };

  const fetchSheetUpdates = () => {
    fetchUpdates(sheet, sheetId, isSubscriber, initialData, setLiteralString, setVisualData, parseUpdate);
  };

  useEffect(() => {
    fetchSheetUpdates();
    updateAllCells(initialData);
  }, []);

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
        <div className="left-controls">
          <button onClick={() => saveUpdates(isSubscriber, sheet, updates, sheetId, setSheetId)}>Save</button>
          <button onClick={fetchSheetUpdates}>Update</button>
        </div>
        <div className="right-controls">
          <button onClick={addRow}>Add Row</button>
          <button onClick={removeRow}>Remove Row</button>
          <button onClick={addColumn}>Add Column</button>
          <button onClick={removeColumn}>Remove Column</button>
        </div>
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
                        value={
                          editingCell && editingCell.row === rowIndex && editingCell.col === colIndex
                            ? literalString[rowIndex][colIndex]
                            : cell
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChange(rowIndex, colIndex, e.target.value)
                        }
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleBlur(rowIndex, colIndex, e.target.value)
                        }
                        onFocus={() =>
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
      <div className="horizontal-scrollbar" ref={horizontalScrollbarRef}>
        <div className="horizontal-scrollbar-content"></div>
      </div>
    </div>
  );
};

export { Spreadsheet, type TableData, type SpreadsheetProps, type Sheet };
