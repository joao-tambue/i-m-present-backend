import { User, CreateUserDTO } from './user.model';

const users: User[] = [];

export class UserRepository {
  async findAll(): Promise<User[]> {
    return users;
  }

  async findById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
}