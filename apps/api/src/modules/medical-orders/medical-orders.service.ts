import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalOrder, MedicalOrderStatus, Study } from './entities/medical-order.entity';
import { StudyResultService } from './services/study-result.service';
import { parseDateFromString } from '@common/utils/date.utils';

@Injectable()
export class MedicalOrdersService {
  constructor(
    @InjectRepository(MedicalOrder)
    private medicalOrderRepository: Repository<MedicalOrder>,
    private readonly studyResultService: StudyResultService,
  ) {}

  async create(data: {
    patientId: number;
    doctorId: number;
    treatmentId?: number;
    category: string;
    description?: string;
    studies?: Study[];
    diagnosis?: string;
    justification?: string;
  }): Promise<MedicalOrder> {
    // Generate unique code
    const year = new Date().getFullYear();
    const count = await this.medicalOrderRepository.count();
    const code = `OM-${year}-${String(count + 1).padStart(5, '0')}`;

    const medicalOrder = this.medicalOrderRepository.create({
      code,
      issueDate: new Date(),
      status: 'pending',
      patientId: data.patientId,
      doctorId: data.doctorId,
      treatmentId: data.treatmentId ?? null,
      category: data.category,
      description: data.description ?? null,
      studies: data.studies ?? null,
      diagnosis: data.diagnosis ?? null,
      justification: data.justification ?? null,
    });

    return await this.medicalOrderRepository.save(medicalOrder);
  }

  async update(
    id: number,
    data: {
      category?: string;
      description?: string;
      studies?: Study[];
      diagnosis?: string;
      justification?: string;
      status?: MedicalOrderStatus;
      completedDate?: Date | null;
    },
  ): Promise<MedicalOrder> {
    const medicalOrder = await this.medicalOrderRepository.findOne({
      where: { id },
    });

    if (!medicalOrder) {
      throw new NotFoundException('Orden médica no encontrada');
    }

    if (data.category !== undefined) {
      medicalOrder.category = data.category;
    }
    if (data.description !== undefined) {
      medicalOrder.description = data.description;
    }
    if (data.studies !== undefined) {
      medicalOrder.studies = data.studies;
    }
    if (data.diagnosis !== undefined) {
      medicalOrder.diagnosis = data.diagnosis;
    }
    if (data.justification !== undefined) {
      medicalOrder.justification = data.justification;
    }
    if (data.status !== undefined) {
      medicalOrder.status = data.status;
    }
    if (data.completedDate !== undefined) {
      medicalOrder.completedDate = data.completedDate
        ? parseDateFromString(data.completedDate)
        : null;
    }

    return await this.medicalOrderRepository.save(medicalOrder);
  }

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

  async findByTreatment(treatmentId: number, status?: MedicalOrderStatus) {
    const where: any = { treatmentId };

    if (status) {
      where.status = status;
    }

    return await this.medicalOrderRepository.find({
      where,
      relations: ['doctor', 'treatment', 'patient'],
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

  async findOneForDoctor(id: number) {
    const order = await this.medicalOrderRepository.findOne({
      where: { id },
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
