import { AppError } from '../../shared/utils/AppError';
import { CoordinatorRepository } from './coordinator.repository';
import {
  DailyAttendanceSummaryDTO,
  EmployeeDetailDTO,
  EmployeeListItemDTO,
  EmployeeStatsDTO,
  ListEmployeesQuery,
  ManualAttendanceDTO,
  UpdateEmployeeDTO,
  UpsertScheduleDTO,
} from './coordinator.model';
import { Area } from '../auth/auth.model';

const repo = new CoordinatorRepository();

export class CoordinatorService {
  async listEmployees(query: ListEmployeesQuery) {
    const { employees, total, page, limit } = await repo.findAllEmployees(query);

    const data: EmployeeListItemDTO[] = employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      area: e.area as Area,
      isActive: e.isActive,
      createdAt: e.createdAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployee(id: string): Promise<EmployeeDetailDTO> {
    const e = await repo.findEmployeeById(id);
    if (!e) throw new AppError('Funcionário não encontrado', 404);

    return {
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      area: e.area as Area,
      role: e.role as import('../auth/auth.model').Role,
      isActive: e.isActive,
      createdAt: e.createdAt,
      schedule: e.schedule
        ? {
            id: e.schedule.id,
            expectedCheckIn: e.schedule.expectedCheckIn,
            expectedCheckOut: e.schedule.expectedCheckOut,
            lateToleranceMinutes: e.schedule.lateToleranceMinutes,
          }
        : null,
      qrCode: e.qrCode
        ? {
            id: e.qrCode.id,
            status: e.qrCode.status,
            issuedAt: e.qrCode.issuedAt,
            revokedAt: e.qrCode.revokedAt,
          }
        : null,
    };
  }
  async updateEmployee(id: string, data: UpdateEmployeeDTO) {
    const exists = await repo.findEmployeeById(id);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);
    return repo.updateEmployee(id, data);
  }
  async toggleEmployeeActive(id: string, isActive: boolean) {
    const exists = await repo.findEmployeeById(id);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);
    return repo.setEmployeeActive(id, isActive);
  }
  async getStats(): Promise<EmployeeStatsDTO> {
    const [counts, byArea] = await Promise.all([
      repo.countEmployees(),
      repo.countByArea(),
    ]);

    const areaMap: Record<string, number> = {};
    for (const row of byArea) {
      areaMap[row.area] = row._count;
    }

    return {
      totalEmployees: counts.total,
      activeEmployees: counts.active,
      inactiveEmployees: counts.inactive,
      byArea: areaMap,
    };
  }

  async upsertSchedule(employeeId: string, data: UpsertScheduleDTO) {
    const exists = await repo.findEmployeeById(employeeId);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);

    // Validar formato HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(data.expectedCheckIn) || !timeRegex.test(data.expectedCheckOut)) {
      throw new AppError('Formato de hora inválido. Use HH:MM (ex: 08:00)', 422);
    }

    if (
      data.lateToleranceMinutes !== undefined
      && (!Number.isInteger(data.lateToleranceMinutes) || data.lateToleranceMinutes < 0)
    ) {
      throw new AppError('A tolerância de atraso deve ser um número inteiro positivo', 422);
    }

    return repo.upsertSchedule(employeeId, data);
  }

  async deleteSchedule(employeeId: string) {
    const exists = await repo.findEmployeeById(employeeId);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);
    await repo.deleteSchedule(employeeId);
  }
  async getTodayAttendance() {
    const today = new Date();
    const records = await repo.getTodayAttendance(today);

    return records.map((r) => ({
      id: r.id,
      employee: r.employee,
      date: r.date,
      checkInAt: r.checkInAt,
      checkOutAt: r.checkOutAt,
      checkInMethod: r.checkInMethod,
      checkOutMethod: r.checkOutMethod,
      status: r.status,
      lateMinutes: r.lateMinutes,
      workedMinutes: r.workedMinutes,
      notes: r.notes,
    }));
  }
  async getDailySummary(dateStr?: string): Promise<DailyAttendanceSummaryDTO> {
    const date = dateStr ? new Date(dateStr) : new Date();
    const { byStatus, totalActive } = await repo.getDailyStats(date);

    const present = byStatus['PRESENT'] ?? 0;
    const late = byStatus['LATE'] ?? 0;
    const recordedAbsent = byStatus['ABSENT'] ?? 0;
    const incomplete = byStatus['INCOMPLETE'] ?? 0;
    const registered = present + late + recordedAbsent + incomplete;
    const absent = recordedAbsent + Math.max(totalActive - registered, 0);

    return {
      date: date.toISOString().split('T')[0],
      total: totalActive,
      present,
      late,
      absent,
      incomplete,
      attendanceRate: totalActive > 0 ? Math.round(((present + late) / totalActive) * 100) : 0,
    };
  }

  async getEmployeeHistory(employeeId: string, from: string, to: string) {
    const exists = await repo.findEmployeeById(employeeId);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError('Datas inválidas. Use o formato YYYY-MM-DD', 422);
    }

    return repo.getAttendanceHistory(employeeId, fromDate, toDate);
  }
  async manualAttendance(data: ManualAttendanceDTO) {
    const exists = await repo.findEmployeeById(data.employeeId);
    if (!exists) throw new AppError('Funcionário não encontrado', 404);

    return repo.manualAttendanceUpsert(data);
  }

  async addNote(recordId: string, notes: string) {
    return repo.addAttendanceNote(recordId, notes);
  }
}
