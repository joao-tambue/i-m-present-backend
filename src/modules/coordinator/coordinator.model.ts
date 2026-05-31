import { Area, Role } from '../auth/auth.model';

export interface EmployeeDetailDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: Area;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  schedule: WorkScheduleDTO | null;
  qrCode: QRCodeSummaryDTO | null;
}

export interface EmployeeListItemDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: Area;
  isActive: boolean;
  createdAt: Date;
}

export interface WorkScheduleDTO {
  id: string;
  expectedCheckIn: string;   // "08:00"
  expectedCheckOut: string;  // "17:00"
  lateToleranceMinutes: number;
}

export interface UpsertScheduleDTO {
  expectedCheckIn: string;
  expectedCheckOut: string;
  lateToleranceMinutes?: number;
}

export interface QRCodeSummaryDTO {
  id: string;
  status: string;
  issuedAt: Date;
  revokedAt: Date | null;
}

export interface UpdateEmployeeDTO {
  name?: string;
  phone?: string;
  area?: Area;
}

export interface ListEmployeesQuery {
  area?: Area;
  isActive?: boolean;
  search?: string;   // nome ou email
  page?: number;
  limit?: number;
}

export interface EmployeeStatsDTO {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  byArea: Record<string, number>;
}

export interface DailyAttendanceSummaryDTO {
  date: string; // "YYYY-MM-DD"
  total: number;
  present: number;
  late: number;
  absent: number;
  incomplete: number;
  attendanceRate: number;
}

export interface ManualAttendanceDTO {
  employeeId: string;
  date: string;           // "YYYY-MM-DD"
  checkInAt?: string;     // "08:30"
  checkOutAt?: string;    // "17:15"
  notes?: string;
}
