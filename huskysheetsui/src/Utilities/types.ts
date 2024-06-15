/**
 * Types defined:
 * - Ref: Represents a cell reference with row and column indices.
 * - CellData: Represents the data contained in a single cell, as a string.
 * - TableData: Represents the entire table's data as a two-dimensional array of CellData.
 * 
 * @author syadav7173
 */

export type Ref = { row: number; col: number };
export type CellData = string;
export type TableData = CellData[][];
