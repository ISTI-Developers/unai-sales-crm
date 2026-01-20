export interface BaseMinutes {
  ID: number;
  unit_id: number;
  sales_unit_id: number;
  sales_unit: string;
  activity: string;
  week: number;
}

export interface RawMinutes extends BaseMinutes {
  created_at: string;
  modified_at: string;
}

export interface ParsedMinutes extends BaseMinutes {
  created_at: Date;
  modified_at: Date;
}

export interface MinutesTable {
  [key: string]: string | number | RawMinutes;
  sales_unit: string;
  sales_unit_id: number;
}
