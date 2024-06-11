import React, {useState, useEffect, useRef, ChangeEvent, MouseEventHandler} from 'react';
import './Spreadsheet.css';
import {
  parseAndEvaluateExpression,
  evaluateOperands,
  evaluateExpression,
  type TableData
} from '../Utilities/CellFunctionalities';
import {
  getUpdatesForSubscription,
  getUpdatesForPublished,
  updatePublished,
  updateSubscription
} from '../Utilities/utils';

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
  const [literalString, setliteralString ]= useState<TableData>(initialData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const updates = useRef<string>("");
  const [sheetId, setSheetId] = useState<number | null>(sheet.id);


  /**
   * Fetches updates from the server for the current sheet.
   * @returns {Promise<void>}
   *
   * Ownership: BrandonPetersen
   */
  const fetchUpdates = async () => {
    const result = isSubscriber
      ? await getUpdatesForSubscription(sheet.publisher, sheet.name, sheetId ? sheetId.toString() : '0')
      : await getUpdatesForSubscription(sheet.publisher, sheet.name, sheetId ? sheetId.toString() : '0');
    if (result && result.success) {
      const newData = initialData.map(row => [...row]);
      result.value.forEach((update: { publisher: string; sheet: string; id: string; payload: string }) => {
        update.payload.split('\n').forEach(line => {
          if (line.trim()) {
            const { row, col, value } = parseUpdate(line);
            newData[row][col] = value;
          }
        });
      });
      setliteralString(newData);
      setVisualData(newData);
    } else {
      console.error('Failed to fetch updates');
    }

  };
  const upDateAllCells = ()  =>{
    let newData = visualData
    for(let i = 0; i < visualData.length; i++){
      for (let j = 0; j < visualData[0].length; j++){
        newData = visualData.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === i && cIdx === j ? evaluateCell(literalString[i][j]) : cell))
    );
      }
    }
    setVisualData(newData);
  }
  /**
   * Parses an update string and returns the row, column, and value.
   * @param {string} update - The update string.
   * @returns {Object} The parsed update with row, column, and value.
   *
   * Ownership: BrandonPetersen
   */

  const parseUpdate = (update: string) => {
    const match = update.match(/\$([A-Z]+)(\d+)\s(.+)/);
    if (!match) throw new Error('Invalid update format');
    const [, colLetter, rowIndex, value] = match;
    const row = parseInt(rowIndex, 10) - 1;
    const col = colToIndex(colLetter);
    return { row, col, value };
  };


  /**
   * Converts a column letter to an index.
   * @param {string} col - The column letter.
   * @returns {number} The column index.
   *
   * Ownership: BrandonPetersen
   */
  const colToIndex = (col: string): number => {
    col = col.replace('$', '');
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };

    /**
   * Adds updates to the updates reference.
   * @param {number} rowIndex - The row index.
   * @param {number} colIndex - The column index.
   * @param {string} value - The cell value.
   *
   * Ownership: BrandonPetersen
   */
  const addUpdates = (rowIndex: number, colIndex: number, value: string) => {
    if (value !== '') {
      updates.current = updates.current + "$" + getColumnLetter(colIndex) + (rowIndex + 1) + " " + value + "\n";
    }
  };


    /**
   * Saves updates to the server.
   * @returns {Promise<void>}
   *
   * Ownership: BrandonPetersen
   */
  const saveUpdates = async () => {
    let allUpdates = updates.current.substring(0, updates.current.length);
    const result = isSubscriber
      ? await updateSubscription(sheet.publisher, sheet.name, allUpdates)
      : await updatePublished(sheet.publisher, sheet.name, allUpdates);
    if (result && result.success) {
      setSheetId(sheetId === null ? 1 : sheetId + 1);
      updates.current = "";
    } else {
      console.error('Failed to save updates');
    }
  }

  // Ownership : Shaanpatel1213
  const handleChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = literalString.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setliteralString(newData)
    setVisualData(newData);

  };

  // Ownership : Shaanpatel1213
  const handleBlur = (rowIndex: number, colIndex: number, value: string) => {
    CalculateCell(rowIndex, colIndex, value);
    addUpdates(rowIndex, colIndex, value);
  };
  // Ownership : Shaanpatel1213
  const CalculateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = visualData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? evaluateCell(value) : cell))
    );
    setVisualData(newData);
  };
  // Ownership : Shaanpatel1213
  const evaluateCell = (cell: string) => {
    while (cell.startsWith('=')) {
      const formula = cell.slice(1);
      cell = parseAndEvaluateExpression(formula, visualData);
    }
    return cell;
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
  // Ownership : Shaanpatel1213
  const getColumnLetter = (colIndex: number): string => {
    let letter = '';
    while (colIndex >= 0) {
      letter = String.fromCharCode((colIndex % 26) + 65) + letter;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
  };
  const handleFocus = (rows : number, col : number) =>{
    const newData = visualData.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === rows && cIdx === col ? literalString[rows][col] : cell))
    );
    setVisualData(newData);
  }



  useEffect(() => {
    fetchUpdates();
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
// Ownership : Shaanpatel1213
  return (
    <div className="spreadsheet-container">
      <div className="controls">
        <button onClick={addRow}>Add Row</button>
        <button onClick={removeRow}>Remove Row</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={removeColumn}>Remove Column</button>
        <button onClick={saveUpdates}>Save</button>
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
                        onClick={ (e ) =>
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

export { Spreadsheet, evaluateOperands, evaluateExpression, parseAndEvaluateExpression, type TableData, type SpreadsheetProps, type Sheet}
