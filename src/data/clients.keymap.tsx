export interface KeyMap {
  id: string; //id of the object key to be manipulated
  label: string; //label for Label component
  type: "text" | "email" | "dropdown" | "combobox"; //the string value from the object
  value?: string; //the string value from the object
}

export const clientKeys: KeyMap[] = [
  { id: "name", label: "name", type: "text" },
  {
    id: "industry",
    label: "industry",
    value: "industry_name",
    type: "combobox",
  },
  { id: "brand", label: "brand", type: "text" },
  { id: "sales_unit_id", label: "sales unit", type: "dropdown" },
  { id: "account_id", label: "account executive", type: "dropdown" },
  { id: "status", label: "status", value: "status_name", type: "dropdown" },
  { id: "contact_person", label: "contact person", type: "text" },
  { id: "designation", label: "designation", type: "text" },
  { id: "contact_number", label: "contact number", type: "text" },
  { id: "email_address", label: "email address", type: "email" },
  { id: "type", label: "type", value: "type_name", type: "dropdown" },
  { id: "source", label: "source", value: "source_name", type: "dropdown" },
];

export const fieldTypes: {
  [key: string]: "text" | "email" | "select" | "combobox" | "multicombobox";
} = {
  name: "text",
  industry: "select",
  brand: "text",
  company: "select",
  sales_unit: "select",
  account_executive: "select",
  status: "select",
  mediums: "multicombobox",
  contact_person: "text",
  designation: "text",
  contact_number: "text",
  email_address: "email",
  address: "text",
  type: "select",
  source: "select",
};
