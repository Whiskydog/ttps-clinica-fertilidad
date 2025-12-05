import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Body, Controller, Get, Post, UseGuards, Query, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { RoleCode } from '@repo/contracts';
import {
  PatientCreateDto,
  PatientResponseDto,
  PatientsQueryDto,
} from '@users/dto';
import { Patient } from '@users/entities/patient.entity';
import { User } from '@users/entities/user.entity';
import { PatientsService } from '@users/services/patients.service';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Public()
  @Post()
  @EnvelopeMessage('Paciente registrado exitosamente')
  @ZodSerializerDto(PatientResponseDto)
  async createPatient(@Body() dto: PatientCreateDto): Promise<Patient> {
    return this.patientsService.createPatient(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async getPatients(
    @Query() query: PatientsQueryDto,
    @CurrentUser() user: User,
  ) {
    return (await this.patientsService.getPatients(query, user.id, user.role.code as RoleCode)).data;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  @EnvelopeMessage('Paciente obtenido exitosamente')
  async getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientById(id);
  }

  @Get(':id/treatments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  @EnvelopeMessage('Tratamientos del paciente obtenidos exitosamente')
  async getPatientTreatments(
    @Param('id', ParseIntPipe) patientId: number,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.getPatientTreatments(patientId, user.id, user.role.code as RoleCode);
  }
}
