import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorNote } from '../entities/doctor-note.entity';
import { Treatment } from '../entities/treatment.entity';
import { User } from '@users/entities/user.entity';

@Injectable()
export class DoctorNoteService {
  constructor(
    @InjectRepository(DoctorNote)
    private doctorNoteRepository: Repository<DoctorNote>,
  ) {}

  async create(data: {
    treatmentId: number;
    noteDate: string;
    note: string;
    doctorId: number;
  }): Promise<DoctorNote> {
    const doctorNote = this.doctorNoteRepository.create({
      treatment: { id: data.treatmentId } as Treatment,
      doctor: { id: data.doctorId } as User,
      noteDate: new Date(data.noteDate),
      note: data.note,
    });

    return await this.doctorNoteRepository.save(doctorNote);
  }

  async update(
    id: number,
    data: {
      noteDate?: string;
      note?: string;
    },
  ): Promise<DoctorNote> {
    const doctorNote = await this.doctorNoteRepository.findOne({
      where: { id },
    });

    if (!doctorNote) {
      throw new NotFoundException('Nota del doctor no encontrada');
    }

    if (data.noteDate) {
      doctorNote.noteDate = new Date(data.noteDate);
    }
    if (data.note !== undefined) {
      doctorNote.note = data.note;
    }

    return await this.doctorNoteRepository.save(doctorNote);
  }

  async remove(id: number): Promise<void> {
    const note = await this.doctorNoteRepository.findOne({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Nota del doctor no encontrada');
    }

    await this.doctorNoteRepository.remove(note);
  }
}
