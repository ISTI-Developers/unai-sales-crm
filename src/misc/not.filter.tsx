import { Row } from "@tanstack/react-table";

export const notFilter = (
  row: Row<unknown>,
  columnId: string,
  filterValue: { query: string[]; condition: string }
) => {
  const rowValue = row.getValue(columnId);

  if (!filterValue || !filterValue.query?.length) return true; // show all if no filter

  const inList = filterValue.query.includes(rowValue);

  return filterValue.condition.includes("not") ? !inList : inList;
};
