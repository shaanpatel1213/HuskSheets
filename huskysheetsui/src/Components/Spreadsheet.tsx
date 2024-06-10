import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
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

  const [data, setData] = useState<TableData>(initialData);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const updates = useRef<string>("");
  const [sheetId, setSheetId] = useState<number | null>(sheet.id);

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
      setData(newData);
    } else {
      console.error('Failed to fetch updates');
    }
  };

  const parseUpdate = (update: string) => {
    const match = update.match(/\$([A-Z]+)(\d+)\s(.+)/);
    if (!match) throw new Error('Invalid update format');
    const [, colLetter, rowIndex, value] = match;
    const row = parseInt(rowIndex, 10) - 1;
    const col = colToIndex(colLetter);
    return { row, col, value };
  };

  const colToIndex = (col: string): number => {
    col = col.replace('$', '');
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
  };

  const addUpdates = (rowIndex: number, colIndex: number, value: string) => {
    if (value !== '') {
      updates.current = updates.current + "$" + getColumnLetter(colIndex) + (rowIndex + 1) + " " + value + "\n";
    }
  };

  // Ownership : Shaanpatel1213
  const handleChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setData(newData);
  };

  const handleBlur = (rowIndex: number, colIndex: number, value: string) => {
    CalculateCell(rowIndex, colIndex, value);
    addUpdates(rowIndex, colIndex, value);
  };
  // Ownership : Shaanpatel1213
  const CalculateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? evaluateCell(value) : cell))
    );
    setData(newData);
  };
  // Ownership : Shaanpatel1213
  const evaluateCell = (cell: string) => {
    if (cell.startsWith('=')) {
      const formula = cell.slice(1);
      let value = parseAndEvaluateExpression(formula, data);
      return value;
    }
    return cell;
  };
  // Ownership : Shaanpatel1213
  const addRow = () => {
    const newRow: RowData = new Array(data[0].length).fill('');
    setData([...data, newRow]);
  };
  // Ownership : Shaanpatel1213
  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
  };
  // Ownership : Shaanpatel1213
  const removeRow = () => {
    if (data.length > 1) {
      setData(data.slice(0, -1));
    }
  };
  // Ownership : Shaanpatel1213
  const removeColumn = () => {
    if (data[0].length > 1) {
      const newData = data.map(row => row.slice(0, -1));
      setData(newData);
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

  useEffect(() => {
    fetchUpdates();
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
                          handleBlur(rowIndex, colIndex, e.target.value)
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
