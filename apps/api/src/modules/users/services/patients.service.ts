import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@users/entities/patient.entity";
import { Repository } from "typeorm";
import { PatientCreateDto } from "@users/dto";
import argon2 from "argon2";

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private patientRepository: Repository<Patient>) { }

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    const passwordHash = await argon2.hash(dto.password);
    const newPatient = this.patientRepository.create({ ...dto, passwordHash });
    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }
}