import { Body, Controller, Get, Post } from "@nestjs/common";
import { DoctorsService } from "@users/services/doctors.service";
import { Doctor } from "@users/entities/doctor.entity";

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) { }

  @Post()
  async createDoctor(@Body() dto): Promise<Doctor> {
    return this.doctorsService.createDoctor(dto);
  }

  @Get()
  async getDoctors(): Promise<Doctor[]> {
    return this.doctorsService.getDoctors();
  }
}