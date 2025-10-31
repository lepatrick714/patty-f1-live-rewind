export interface LapData {
  date_start: string;
  driver_number: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  i1_speed?: number;
  i2_speed?: number;
  is_pit_out_lap: boolean;
  lap_duration?: number;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  st_speed?: number;
}
