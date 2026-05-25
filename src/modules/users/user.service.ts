import { UserRepository } from './user.repository';
import { CreateUserDTO, UserResponseDTO } from './user.model';
import { AppError } from '../../shared/utils/AppError';

const repo = new UserRepository();

export class UserService {
  async getAllUsers(): Promise<UserResponseDTO[]> {
    const users = await repo.findAll();
    return users.map(({ password, ...user }) => user);
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await repo.findById(id);
    if (!user) throw new AppError('Utilizador não encontrado', 404);
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    const exists = await repo.findByEmail(data.email);
    if (exists) throw new AppError('Email já registado', 409);

    const user = await repo.create(data);
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Utilizador não encontrado', 404);
  }
}