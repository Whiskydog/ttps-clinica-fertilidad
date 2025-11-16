import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTransferMilestone } from '../entities/post-transfer-milestone.entity';

@Injectable()
export class PostTransferMilestoneService {
  constructor(
    @InjectRepository(PostTransferMilestone)
    private readonly milestoneRepository: Repository<PostTransferMilestone>,
  ) {}

  async findByTreatmentId(treatmentId: number): Promise<PostTransferMilestone[]> {
    return this.milestoneRepository.find({
      where: { treatment: { id: treatmentId } },
      relations: ['treatment', 'registeredByDoctor'],
      order: { milestoneDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PostTransferMilestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['treatment', 'registeredByDoctor'],
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }

  async create(
    milestoneData: Partial<PostTransferMilestone>,
  ): Promise<PostTransferMilestone> {
    const milestone = this.milestoneRepository.create(milestoneData);
    return this.milestoneRepository.save(milestone);
  }

  async update(
    id: number,
    milestoneData: Partial<PostTransferMilestone>,
  ): Promise<PostTransferMilestone> {
    const milestone = await this.findOne(id);
    Object.assign(milestone, milestoneData);
    return this.milestoneRepository.save(milestone);
  }

  async remove(id: number): Promise<void> {
    const milestone = await this.findOne(id);
    await this.milestoneRepository.remove(milestone);
  }
}
