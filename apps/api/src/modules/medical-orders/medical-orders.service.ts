import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalOrder, MedicalOrderStatus } from './entities/medical-order.entity';
import { StudyResultService } from './services/study-result.service';

@Injectable()
export class MedicalOrdersService {
  constructor(
    @InjectRepository(MedicalOrder)
    private medicalOrderRepository: Repository<MedicalOrder>,
    private readonly studyResultService: StudyResultService,
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

    // Fetch study results for this medical order
    const studyResults = await this.studyResultService.findByMedicalOrderId(id);

    return {
      ...order,
      studyResults,
    };
  }
}
