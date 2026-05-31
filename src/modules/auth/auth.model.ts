export enum Role {
  COORDINATOR = 'COORDINATOR',
  EMPLOYEE = 'EMPLOYEE',
}

export enum Area {
  DEV_FULLSTACK = 'DEV_FULLSTACK',
  AI_ENGINEER = 'AI_ENGINEER',
  FRONTEND_ENGINEER = 'FRONTEND_ENGINEER',
  BACKEND_ENGINEER = 'BACKEND_ENGINEER',
  DEVOPS = 'DEVOPS',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  OTHER = 'OTHER',
}

export interface JwtPayload {
  sub: string;   // id do utilizador
  email: string;
  role: Role;
}

export interface RegisterCoordinatorDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CoordinatorResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: Date;
}

export interface RegisterEmployeeDTO {
  name: string;
  email: string;
  phone: string;
  area: Area;
  password: string;
}

export interface EmployeeResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: Area;
  role: Role;
  createdAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: CoordinatorResponseDTO | EmployeeResponseDTO;
}