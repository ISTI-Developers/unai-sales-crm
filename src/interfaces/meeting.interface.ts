export interface BaseMinutes {
  ID: number;
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
}

export type WeekRow = {
  [weekKey: string]: RawMinutes | null;
};
