import { AppError } from '../../shared/utils/AppError';
import { AttendanceRepository } from './attendance.repository';
import {
  AttendanceHistoryDTO,
  AttendanceHistoryQuery,
  AttendanceRecordDTO,
  QRCheckDTO,
  TodayListItemDTO,
  TodayStatusDTO,
} from './attendance.model';

const repo = new AttendanceRepository();

function startOfDay(date = new Date()) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function endOfDay(date = new Date()) {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
}

function toDateString(date: Date) {
  return date.toISOString().split('T')[0]!;
}

function mapRecord(record: {
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
}): AttendanceRecordDTO {
  return {
    id: record.id,
    date: record.date,
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    checkInMethod: record.checkInMethod,
    checkOutMethod: record.checkOutMethod,
    status: record.status,
    lateMinutes: record.lateMinutes,
    workedMinutes: record.workedMinutes,
    notes: record.notes,
  };
}

function parseDate(value: string, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError('Data inválida. Use o formato YYYY-MM-DD', 422);
  }
  return date;
}

function getExpectedCheckIn(date: Date, expectedCheckIn: string) {
  const [hour, minute] = expectedCheckIn.split(':').map(Number);
  const expected = new Date(date);
  expected.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return expected;
}

function calculateCheckInStatus(now: Date, schedule?: {
  expectedCheckIn: string;
  lateToleranceMinutes: number;
} | null) {
  if (!schedule) {
    return { status: 'PRESENT' as const, lateMinutes: 0 };
  }

  const expected = getExpectedCheckIn(now, schedule.expectedCheckIn);
  expected.setMinutes(expected.getMinutes() + schedule.lateToleranceMinutes);

  const lateMinutes = Math.max(
    0,
    Math.floor((now.getTime() - expected.getTime()) / 60000),
  );

  return {
    status: lateMinutes > 0 ? 'LATE' as const : 'PRESENT' as const,
    lateMinutes,
  };
}

function formatWorkedMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}min`;
}

export class AttendanceService {
  async checkIn(employeeId: string, data: QRCheckDTO) {
    const qrCode = await this.getValidQRCodeForEmployee(employeeId, data.token);
    const now = new Date();
    const today = startOfDay(now);
    const existing = await repo.findTodayRecord(employeeId, today);

    if (existing?.checkInAt) {
      throw new AppError('Check-in já realizado hoje. Use o endpoint de check-out.', 409);
    }

    const { status, lateMinutes } = calculateCheckInStatus(now, qrCode.employee.schedule);
    const record = existing
      ? await repo.updateCheckIn(existing.id, { checkInAt: now, status, lateMinutes })
      : await repo.createCheckIn({
          employeeId,
          date: today,
          checkInAt: now,
          status,
          lateMinutes,
        });

    return {
      message: lateMinutes > 0
        ? `Check-in efectuado com sucesso. Atraso de ${lateMinutes} minuto(s).`
        : 'Check-in efectuado com sucesso.',
      data: {
        record: mapRecord(record),
        employee: this.mapEmployee(qrCode.employee),
      },
    };
  }

  async checkOut(employeeId: string, data: QRCheckDTO) {
    const qrCode = await this.getValidQRCodeForEmployee(employeeId, data.token);
    const now = new Date();
    const today = startOfDay(now);
    const record = await repo.findTodayRecord(employeeId, today);

    if (!record?.checkInAt) {
      throw new AppError('Check-in não encontrado para hoje.', 400);
    }

    if (record.checkOutAt) {
      throw new AppError('Check-out já realizado hoje.', 409);
    }

    const workedMinutes = Math.max(
      0,
      Math.floor((now.getTime() - record.checkInAt.getTime()) / 60000),
    );
    const updated = await repo.updateCheckOut(record.id, now, workedMinutes);

    return {
      message: `Check-out efectuado. Trabalhou ${formatWorkedMinutes(workedMinutes)} hoje.`,
      data: {
        workedMinutes,
        record: mapRecord(updated),
        employee: this.mapEmployee(qrCode.employee),
      },
    };
  }

  async myToday(employeeId: string): Promise<TodayStatusDTO> {
    const today = startOfDay();
    const record = await repo.findTodayRecord(employeeId, today);

    return {
      date: toDateString(today),
      record: record ? mapRecord(record) : null,
      canCheckIn: !record?.checkInAt,
      canCheckOut: Boolean(record?.checkInAt && !record.checkOutAt),
    };
  }

  async myHistory(employeeId: string, query: AttendanceHistoryQuery): Promise<AttendanceHistoryDTO> {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = startOfDay(parseDate(query.from ?? '', defaultFrom));
    const to = endOfDay(parseDate(query.to ?? '', now));

    if (from.getTime() > to.getTime()) {
      throw new AppError('A data inicial não pode ser posterior à data final', 422);
    }

    const records = await repo.getHistory(employeeId, from, to);
    const summary = records.reduce(
      (acc, record) => {
        acc.total += 1;
        acc.workedMinutes += record.workedMinutes ?? 0;

        if (record.status === 'PRESENT') acc.present += 1;
        if (record.status === 'LATE') acc.late += 1;
        if (record.status === 'ABSENT') acc.absent += 1;
        if (record.status === 'INCOMPLETE') acc.incomplete += 1;

        return acc;
      },
      { total: 0, present: 0, late: 0, absent: 0, incomplete: 0, workedMinutes: 0 },
    );

    return {
      from: toDateString(from),
      to: toDateString(to),
      summary,
      records: records.map(mapRecord),
    };
  }

  async todayFullList(): Promise<TodayListItemDTO[]> {
    const today = startOfDay();
    const employees = await repo.getActiveEmployeesWithTodayRecord(today);

    return employees.map((employee) => {
      const record = employee.attendance[0];

      return {
        employee: this.mapEmployee(employee),
        date: toDateString(today),
        recordId: record?.id ?? null,
        checkInAt: record?.checkInAt ?? null,
        checkOutAt: record?.checkOutAt ?? null,
        status: record?.status ?? 'NOT_REGISTERED',
        lateMinutes: record?.lateMinutes ?? 0,
        workedMinutes: record?.workedMinutes ?? null,
        notes: record?.notes ?? null,
      };
    });
  }

  private async getValidQRCodeForEmployee(employeeId: string, token: string) {
    if (!token?.trim()) {
      throw new AppError('Token do QR Code é obrigatório', 422);
    }

    const qrCode = await repo.findActiveQRCode(token.trim());
    if (!qrCode) {
      throw new AppError('QR Code inválido', 400);
    }

    if (qrCode.status !== 'ACTIVE') {
      throw new AppError('QR Code revogado', 400);
    }

    if (!qrCode.employee.isActive) {
      throw new AppError('Funcionário desactivado', 403);
    }

    if (qrCode.employeeId !== employeeId) {
      throw new AppError('QR Code não pertence ao funcionário autenticado', 403);
    }

    return qrCode;
  }

  private mapEmployee(employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    area: string;
  }) {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      area: employee.area,
    };
  }
}
