export interface QRCheckDTO {
  token: string;
}

export interface AttendanceHistoryQuery {
  from?: string;
  to?: string;
}

export interface AttendanceRecordDTO {
  id: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  status: string;
  lateMinutes: number | null;
  workedMinutes: number | null;
  notes: string | null;
}

export interface AttendanceEmployeeDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
}

export interface TodayStatusDTO {
  date: string;
  record: AttendanceRecordDTO | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

export interface AttendanceHistoryDTO {
  from: string;
  to: string;
  summary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    incomplete: number;
    workedMinutes: number;
  };
  records: AttendanceRecordDTO[];
}

export interface TodayListItemDTO {
  employee: AttendanceEmployeeDTO;
  date: string;
  recordId: string | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  status: string;
  lateMinutes: number | null;
  workedMinutes: number | null;
  notes: string | null;
}
