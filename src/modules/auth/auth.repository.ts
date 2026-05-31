import { prisma } from '../../lib/prisma';
import { RegisterCoordinatorDTO, RegisterEmployeeDTO } from './auth.model';

export class CoordinatorRepository {
  async findByEmail(email: string) {
    return prisma.coordinator.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.coordinator.findUnique({ where: { id } });
  }

  async create(data: RegisterCoordinatorDTO & { password: string }) {
    return prisma.coordinator.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
    });
  }
}

export class EmployeeRepository {
  async findByEmail(email: string) {
    return prisma.employee.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.employee.findUnique({ where: { id } });
  }

  async create(data: RegisterEmployeeDTO & { password: string }) {
    return prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        area: data.area,
        password: data.password,
        qrCode: {
          create: {},
        },
      },
    });
  }
}
