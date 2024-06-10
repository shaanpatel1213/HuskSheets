import { AppDataSource } from "../data-source";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Cell } from "../entity/Cell";

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
