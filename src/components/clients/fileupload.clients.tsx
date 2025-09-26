import { ClientUpload } from "@/interfaces/client.interface";
import { ChangeEvent, Dispatch, useState } from "react";
import { read, utils } from "xlsx";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RotateCw } from "lucide-react";

interface FileUpload {
  setData: Dispatch<React.SetStateAction<ClientUpload[] | null>>;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
}

const FileUpload = ({ setData, setLoading }: FileUpload) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setLoading(true);

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target) return;

      const data = event.target.result;
      const processedData = processData(data);

      setFile(file);
      setLoading(false);
      setData(processedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = (data: string | ArrayBuffer | null) => {
    const workbook = read(data, { type: "binary" });
    const sheet = workbook.Sheets["Client Form"];
    const records: string[][] = utils.sheet_to_json(sheet, { header: 1 });

    const headers: string[] = records[0];
    const rows = records.slice(1).filter((record) => record.length !== 0);

    const formattedData: ClientUpload[] = rows
      .map((row) => {
        return headers.reduce((obj: ClientUpload, header, index) => {
          header = header.split("*")[0].split(" ").join("_").toLowerCase();

          if (header === "status") {
            const status = row[index].toUpperCase();
            if (status === "FOR ELECTIONS") {
              obj[header] = "FOR ELECTIONS";
            } else {
              obj[header] = row[index].toUpperCase();
            }
          } else {
            obj[header] = row[index] ?? "";
          }
          return obj;
        }, {} as ClientUpload);
      });

    return formattedData;
  };
  return (
    <div className="flex items-center gap-4 p-4 border-4 rounded-md border-dashed">
      {!file ? (
        <>
          <Label htmlFor="file" className="font-semibold">
            Upload the completed template here:
          </Label>
          <Input
            type="file"
            accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
        </>
      ) : (
        <>
          <Label htmlFor="file" className="font-semibold">
            Selected file:
          </Label>
          <p id="file" className="text-sm">
            {file.name}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="bg-main-400 text-white hover:bg-main-700 hover:text-white"
            onClick={() => {
              setFile(null);
              setData(null);
            }}
          >
            <div className="flex gap-2 items-center">
              <RotateCw size={16} />
              <span>Change file</span>
            </div>
          </Button>
        </>
      )}
    </div>
  );
};

export default FileUpload;
