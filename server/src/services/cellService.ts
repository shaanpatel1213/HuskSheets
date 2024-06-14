import { AppDataSource } from "../data-source";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Cell } from "../entity/Cell";

/**
 * Parses the given payload and updates the cells of the specified spreadsheet.
 * Each update in the payload should be in the format of "ref term", where "ref" is the cell reference
 * and "term" is the content to be updated in that cell.
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet to update.
 * @param {string} payload - The update payload containing cell references and their new contents.
 * @returns {Promise<void>} A promise that resolves when the cells have been updated.
 * 
 * @author BrandonPetersen
 */
export const parseAndUpdateCells = async (spreadsheet: Spreadsheet, payload: string) => {
  const updates = payload.split("\n");
  for (const update of updates) {
    const [ref, term] = update.split(" ");
    if (!ref || !term) continue;

    const columnMatch = ref.match(/\$([A-Z]+)/);
    const rowMatch = ref.match(/\d+/);

    if (!columnMatch || !rowMatch) {
      continue;
    }

    const column = columnMatch[1]
      .split("")
      .reduce(
        (acc, char) => acc * 26 + (char.charCodeAt(0) - "A".charCodeAt(0) + 1),
        0
      );
    const row = parseInt(rowMatch[0], 10);

    let cell =
      (await AppDataSource.manager.findOneBy(Cell, {
        spreadsheet: spreadsheet,
        column: column,
        row: row,
      })) || new Cell();
    cell.spreadsheet = spreadsheet;
    cell.column = column;
    cell.row = row;
    cell.content = term;

    await AppDataSource.manager.save(cell);
  }
};
