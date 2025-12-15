import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MonitoringPlan,
  MonitoringPlanStatus,
} from '../entities/monitoring-plan.entity';

@Injectable()
export class MonitoringPlanService {
  constructor(
    @InjectRepository(MonitoringPlan)
    private readonly repo: Repository<MonitoringPlan>,
  ) {}

  async create(data: Partial<MonitoringPlan>) {
    const plan = this.repo.create({
      ...data,
      status: MonitoringPlanStatus.PENDING,
    });
    return this.repo.save(plan);
  }

  async findByTreatment(treatmentId: number) {
    return this.repo.find({
      where: { treatmentId },
      order: { sequence: 'ASC' },
    });
  }

  async update(id: number, data: Partial<MonitoringPlan>) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Monitoring plan not found');

    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async remove(id: number) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Monitoring plan not found');
    await this.repo.remove(plan);
  }
}
