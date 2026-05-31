import { randomUUID } from 'crypto';
import { prisma } from '../../lib/prisma';

export class QRCodeRepository {
  async employeeExists(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });
    return Boolean(employee);
  }

  async findByEmployeeId(employeeId: string) {
    return prisma.employeeQRCode.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: { id: true, name: true, email: true, area: true, isActive: true },
        },
      },
    });
  }

  async ensureActiveForEmployee(employeeId: string) {
    return prisma.employeeQRCode.upsert({
      where: { employeeId },
      create: { employeeId },
      update: {
        status: 'ACTIVE',
        code: randomUUID(),
        issuedAt: new Date(),
        revokedAt: null,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, area: true, isActive: true },
        },
      },
    });
  }

  async revokeByEmployeeId(employeeId: string) {
    return prisma.employeeQRCode.update({
      where: { employeeId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, area: true, isActive: true },
        },
      },
    });
  }
}
