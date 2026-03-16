import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserStatus } from '../constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const password_hash = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password_hash,
      role_id: createUserDto.role_id,
      status: createUserDto.status ?? UserStatus.ACTIVE,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        role_id: true,
        status: true,
        created_at: true,
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        role_id: true,
        status: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    const updatePayload: Partial<User> = {};

    if (updateUserDto.email !== undefined) {
      updatePayload.email = updateUserDto.email;
    }
    if (updateUserDto.role_id !== undefined) {
      updatePayload.role_id = updateUserDto.role_id;
    }
    if (updateUserDto.status !== undefined) {
      updatePayload.status = updateUserDto.status;
    }
    if (updateUserDto.password !== undefined) {
      updatePayload.password_hash = await bcrypt.hash(
        updateUserDto.password,
        12,
      );
    }

    await this.userRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(user.id);
  }
}
