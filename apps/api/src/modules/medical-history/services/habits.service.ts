import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habits } from '../entities/habits.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habits)
    private readonly habitsRepository: Repository<Habits>,
  ) {}

  async findByMedicalHistoryId(medicalHistoryId: number): Promise<Habits[]> {
    return this.habitsRepository.find({
      where: { medicalHistory: { id: medicalHistoryId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Habits> {
    const habits = await this.habitsRepository.findOne({
      where: { id },
      relations: ['medicalHistory'],
    });

    if (!habits) {
      throw new NotFoundException(`Habits con ID ${id} no encontrado`);
    }

    return habits;
  }

  async create(habitsData: Partial<Habits>): Promise<Habits> {
    const habits = this.habitsRepository.create(habitsData);
    return this.habitsRepository.save(habits);
  }

  async update(id: number, habitsData: Partial<Habits>): Promise<Habits> {
    const habits = await this.findOne(id);
    Object.assign(habits, habitsData);
    return this.habitsRepository.save(habits);
  }

  async remove(id: number): Promise<void> {
    const habits = await this.findOne(id);
    await this.habitsRepository.remove(habits);
  }
}
