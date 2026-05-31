import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { AppError } from '../../shared/utils/AppError';
import { CoordinatorRepository, EmployeeRepository } from './auth.repository';
import {
  Area,
  AuthResponseDTO,
  CoordinatorResponseDTO,
  EmployeeResponseDTO,
  JwtPayload,
  LoginDTO,
  RegisterCoordinatorDTO,
  RegisterEmployeeDTO,
  Role,
} from './auth.model';

const coordinatorRepo = new CoordinatorRepository();
const employeeRepo = new EmployeeRepository();

const SALT_ROUNDS = 12;

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function toCoordinatorResponse(c: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
}): CoordinatorResponseDTO {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    role: c.role as Role,
    createdAt: c.createdAt,
  };
}

function toEmployeeResponse(e: {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  role: string;
  createdAt: Date;
}): EmployeeResponseDTO {
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    area: e.area as Area,
    role: e.role as Role,
    createdAt: e.createdAt,
  };
}


export class AuthService {
  async registerCoordinator(data: RegisterCoordinatorDTO): Promise<AuthResponseDTO> {
    const existing = await coordinatorRepo.findByEmail(data.email);
    if (existing) throw new AppError('Email já registado', 409);

    const existingEmployee = await employeeRepo.findByEmail(data.email);
    if (existingEmployee) throw new AppError('Email já registado como Funcionário', 409);

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const coordinator = await coordinatorRepo.create({ ...data, password: hashedPassword });

    const payload: JwtPayload = {
      sub: coordinator.id,
      email: coordinator.email,
      role: Role.COORDINATOR,
    };

    return {
      token: generateToken(payload),
      user: toCoordinatorResponse(coordinator),
    };
  }

  async registerEmployee(data: RegisterEmployeeDTO): Promise<AuthResponseDTO> {
    const existing = await employeeRepo.findByEmail(data.email);
    if (existing) throw new AppError('Email já registado', 409);

    const existingCoordinator = await coordinatorRepo.findByEmail(data.email);
    if (existingCoordinator) throw new AppError('Email já registado como Coordenador', 409);

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const employee = await employeeRepo.create({ ...data, password: hashedPassword });

    const payload: JwtPayload = {
      sub: employee.id,
      email: employee.email,
      role: Role.EMPLOYEE,
    };

    return {
      token: generateToken(payload),
      user: toEmployeeResponse(employee),
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const coordinator = await coordinatorRepo.findByEmail(data.email);
    if (coordinator) {
      const valid = await bcrypt.compare(data.password, coordinator.password);
      if (!valid) throw new AppError('Credenciais inválidas', 401);

      const payload: JwtPayload = {
        sub: coordinator.id,
        email: coordinator.email,
        role: Role.COORDINATOR,
      };

      return {
        token: generateToken(payload),
        user: toCoordinatorResponse(coordinator),
      };
    }

    const employee = await employeeRepo.findByEmail(data.email);
    if (employee) {
      const valid = await bcrypt.compare(data.password, employee.password);
      if (!valid) throw new AppError('Credenciais inválidas', 401);

      const payload: JwtPayload = {
        sub: employee.id,
        email: employee.email,
        role: Role.EMPLOYEE,
      };

      return {
        token: generateToken(payload),
        user: toEmployeeResponse(employee),
      };
    }

    throw new AppError('Credenciais inválidas', 401);
  }

  async getMe(id: string, role: Role): Promise<CoordinatorResponseDTO | EmployeeResponseDTO> {
    if (role === Role.COORDINATOR) {
      const coordinator = await coordinatorRepo.findById(id);
      if (!coordinator) throw new AppError('Utilizador não encontrado', 404);
      return toCoordinatorResponse(coordinator);
    }

    const employee = await employeeRepo.findById(id);
    if (!employee) throw new AppError('Utilizador não encontrado', 404);
    return toEmployeeResponse(employee);
  }
}