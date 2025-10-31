export interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_type: string;
  meeting_key: number;
  location: string;
  country_name: string;
  country_code: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}
