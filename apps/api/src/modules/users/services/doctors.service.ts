import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Doctor } from "@users/entities/doctor.entity";
import { Repository } from "typeorm";

@Injectable()
export class DoctorsService {
  constructor(@InjectRepository(Doctor) private doctorsRepository: Repository<Doctor>) { }
  
  async createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    const newDoctor = this.doctorsRepository.create(doctorData);
    return this.doctorsRepository.save(newDoctor);
  }

  async getDoctors(): Promise<Doctor[]> {
    return this.doctorsRepository.find();
  }
}