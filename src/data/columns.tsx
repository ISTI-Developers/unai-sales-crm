import { Row } from "@tanstack/react-table";

export const filterFn = (row: Row<any>, columnId: string, filterValue: any) => {
  const item = row.getValue(columnId);
  return filterValue.includes(item);
};
