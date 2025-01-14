import { ClientUpload } from "@/interfaces/client.interface";
import React from "react";
import { TableRow } from "../ui/table";
import Cell from "./cell.clients";

interface RowProps {
  item: ClientUpload;
  item_index: number;
  headers: string[];
  handleInputChange: (value: string, header: string, index: number) => void;
}

const Row = React.memo(
  ({ item, item_index, headers, handleInputChange }: RowProps) => {
    return (
      <TableRow>
        {Object.values(item).map((value, index) => (
          <Cell
            index={item_index}
            key={`${item_index}_${index}`}
            value={value}
            header={headers[index]}
            onChange={handleInputChange}
          />
        ))}
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.item === nextProps.item
    );
  }
);

export default Row;
