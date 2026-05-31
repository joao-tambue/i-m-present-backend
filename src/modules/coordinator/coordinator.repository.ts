import { prisma } from '../../lib/prisma';
import { ListEmployeesQuery, ManualAttendanceDTO, UpsertScheduleDTO, UpdateEmployeeDTO } from './coordinator.model';
import { Area } from '../auth/auth.model';

export class CoordinatorRepository {

  async findAllEmployees(query: ListEmployeesQuery) {
    const { area, isActive, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (area) where['area'] = area;
    if (isActive !== undefined) where['isActive'] = isActive;
    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          area: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return { employees, total, page, limit };
  }

  async findEmployeeById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        schedule: true,
        qrCode: {
          select: { id: true, status: true, issuedAt: true, revokedAt: true },
        },
      },
    });
  }

  async updateEmployee(id: string, data: UpdateEmployeeDTO) {
    return prisma.employee.update({ where: { id }, data });
  }

  async setEmployeeActive(id: string, isActive: boolean) {
    return prisma.employee.update({ where: { id }, data: { isActive } });
  }

  async countByArea(): Promise<{ area: Area; _count: number }[]> {
    const result = await prisma.employee.groupBy({
      by: ['area'],
      _count: { id: true },
      where: { isActive: true },
    });
    return result.map((r) => ({ area: r.area as Area, _count: r._count.id }));
  }

  async countEmployees() {
    const [total, active] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async upsertSchedule(employeeId: string, data: UpsertScheduleDTO) {
    return prisma.workSchedule.upsert({
      where: { employeeId },
      create: { employeeId, ...data },
      update: data,
    });
  }

  async deleteSchedule(employeeId: string) {
    return prisma.workSchedule.deleteMany({ where: { employeeId } });
  }

  async getTodayAttendance(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return prisma.attendanceRecord.findMany({
      where: { date: { gte: start, lte: end } },
      include: {
        employee: {
          select: { id: true, name: true, email: true, area: true, phone: true },
        },
      },
      orderBy: { checkInAt: 'asc' },
    });
  }

  async getAttendanceHistory(employeeId: string, from: Date, to: Date) {
    return prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getDailyStats(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [records, totalActive] = await Promise.all([
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { date: { gte: start, lte: end } },
      }),
      prisma.employee.count({ where: { isActive: true } }),
    ]);

    const byStatus = Object.fromEntries(
      records.map((r) => [r.status, r._count.id]),
    );

    return { byStatus, totalActive };
  }

  async manualAttendanceUpsert(data: ManualAttendanceDTO) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const checkInAt = data.checkInAt
      ? new Date(`${data.date}T${data.checkInAt}:00`)
      : undefined;
    const checkOutAt = data.checkOutAt
      ? new Date(`${data.date}T${data.checkOutAt}:00`)
      : undefined;

    let workedMinutes: number | undefined;
    if (checkInAt && checkOutAt) {
      workedMinutes = Math.floor((checkOutAt.getTime() - checkInAt.getTime()) / 60000);
    }

    return prisma.attendanceRecord.upsert({
      where: { employeeId_date: { employeeId: data.employeeId, date } },
      create: {
        employeeId: data.employeeId,
        date,
        checkInAt,
        checkOutAt,
        checkInMethod: 'MANUAL',
        checkOutMethod: checkOutAt ? 'MANUAL' : undefined,
        status: checkInAt ? 'PRESENT' : 'ABSENT',
        workedMinutes,
        notes: data.notes,
      },
      update: {
        checkInAt,
        checkOutAt,
        checkInMethod: 'MANUAL',
        checkOutMethod: checkOutAt ? 'MANUAL' : undefined,
        status: checkInAt ? 'PRESENT' : 'ABSENT',
        workedMinutes,
        notes: data.notes,
        updatedAt: new Date(),
      },
    });
  }

  async addAttendanceNote(recordId: string, notes: string) {
    return prisma.attendanceRecord.update({
      where: { id: recordId },
      data: { notes, updatedAt: new Date() },
    });
  }
}