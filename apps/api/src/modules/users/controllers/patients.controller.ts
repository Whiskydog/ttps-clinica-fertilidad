import { Body, Controller, Get, Post } from "@nestjs/common";
import { PatientsService } from "@modules/users/services/patients.service";
import { PatientCreateDto, PatientResponseDto } from "@modules/users/dto";
import { Patient } from "@modules/users/entities/patient.entity";
import { ZodSerializerDto } from "nestjs-zod";

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) { }

  @Post()
  @ZodSerializerDto(PatientResponseDto)
  async createPatient(@Body() dto: PatientCreateDto): Promise<Patient> {
    return this.patientsService.createPatient(dto);
  }

  @Get()
  @ZodSerializerDto([PatientResponseDto])
  async getPatients(): Promise<Patient[]> {
    return this.patientsService.getPatients();
  }
}