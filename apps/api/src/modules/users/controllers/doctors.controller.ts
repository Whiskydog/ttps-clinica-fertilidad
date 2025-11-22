import { Body, Controller, Get, Post } from '@nestjs/common';
import { Doctor } from '@users/entities/doctor.entity';
import { DoctorsService } from '@users/services/doctors.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { DoctorsResponseDto } from '../dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Post()
  async createDoctor(@Body() dto): Promise<Doctor> {
    return this.doctorsService.createDoctor(dto);
  }

  @Get()
  @ZodSerializerDto(DoctorsResponseDto)
  async getDoctors(): Promise<Doctor[]> {
    return this.doctorsService.getDoctors();
  }
}
