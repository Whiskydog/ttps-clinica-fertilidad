import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async resetLoginAttempts(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLogin: null,
    });
  }

  async recordFailedLogin(
    userId: number,
    attempts: number,
    lockUntil: Date | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: attempts,
      lockedUntil: lockUntil,
      lastFailedLogin: new Date(),
    });
  }
}
