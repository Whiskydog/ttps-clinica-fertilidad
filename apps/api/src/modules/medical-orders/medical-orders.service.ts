import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalOrder, MedicalOrderStatus } from './entities/medical-order.entity';

@Injectable()
export class MedicalOrdersService {
  constructor(
    @InjectRepository(MedicalOrder)
    private medicalOrderRepository: Repository<MedicalOrder>,
  ) {}

  async findByPatient(patientId: number, status?: MedicalOrderStatus) {
    const where: any = { patientId };

    if (status) {
      where.status = status;
    }

    return await this.medicalOrderRepository.find({
      where,
      relations: ['doctor', 'treatment'],
      order: { issueDate: 'DESC' },
    });
  }

  async findOne(id: number, patientId: number) {
    const order = await this.medicalOrderRepository.findOne({
      where: { id, patientId },
      relations: ['doctor', 'treatment', 'patient'],
    });

    if (!order) {
      throw new NotFoundException('Medical order not found');
    }

    return order;
  }
}
