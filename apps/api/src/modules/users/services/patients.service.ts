import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@modules/users/entities/patient.entity";
import { Repository } from "typeorm";

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private patientRepository: Repository<Patient>) { }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    const newPatient = this.patientRepository.create(patientData);
    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }
}