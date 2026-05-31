import { prisma } from '../../lib/prisma';

export class AttendanceRepository {
  async findActiveQRCode(code: string) {
    return prisma.employeeQRCode.findUnique({
      where: { code },
      include: {
        employee: {
          include: { schedule: true },
        },
      },
    });
  }

  async findTodayRecord(employeeId: string, date: Date) {
    return prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date,
        },
      },
    });
  }

  async createCheckIn(data: {
    employeeId: string;
    date: Date;
    checkInAt: Date;
    status: 'PRESENT' | 'LATE';
    lateMinutes: number;
  }) {
    return prisma.attendanceRecord.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        checkInAt: data.checkInAt,
        checkInMethod: 'QR_CODE',
        status: data.status,
        lateMinutes: data.lateMinutes,
      },
    });
  }

  async updateCheckIn(recordId: string, data: {
    checkInAt: Date;
    status: 'PRESENT' | 'LATE';
    lateMinutes: number;
  }) {
    return prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        checkInAt: data.checkInAt,
        checkInMethod: 'QR_CODE',
        status: data.status,
        lateMinutes: data.lateMinutes,
      },
    });
  }

  async updateCheckOut(recordId: string, checkOutAt: Date, workedMinutes: number) {
    return prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        checkOutAt,
        checkOutMethod: 'QR_CODE',
        workedMinutes,
      },
    });
  }

  async getHistory(employeeId: string, from: Date, to: Date) {
    return prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getActiveEmployeesWithTodayRecord(date: Date) {
    return prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        area: true,
        attendance: {
          where: { date },
          take: 1,
        },
      },
    });
  }
}
