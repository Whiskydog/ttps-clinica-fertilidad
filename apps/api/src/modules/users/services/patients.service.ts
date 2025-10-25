import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient } from "@users/entities/patient.entity";
import { Not, Repository } from "typeorm";
import { PatientCreateDto } from "@users/dto";
import argon2 from "argon2";
import { User } from "@users/entities/user.entity";
import { BiologicalSex, RoleCode } from "@repo/contracts";
import { Role } from "@users/entities/role.entity";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) { }

  async createPatient(dto: PatientCreateDto): Promise<Patient> {
    const passwordHash = await argon2.hash(dto.password);
    const patientRole = await this.roleRepo.findOne({ where: { code: RoleCode.PATIENT } });
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      passwordHash,
      isActive: true,
      role: patientRole!,
    });
    const savedUser = await this.userRepo.save(user);

    const newPatient = this.patientRepository.create({
      user: savedUser,
      dni: dto.dni,
      dateOfBirth: dto.dateOfBirth,
      occupation: dto.occupation,
      biologicalSex: dto.biologicalSex as BiologicalSex,
  // Optional insurance fields are not present in current DTO; defaulting to null
  medicalInsuranceId: null,
  coverageMemberId: null,
    });
    return this.patientRepository.save(newPatient);
  }

  async getPatients(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  // Helpers for inter-service consumption
  async findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findPatientById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }

  async findPatientByUserId(userId: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
  }

  async findDuplicateDni(dni: string, excludeUserId: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { dni, id: Not(excludeUserId) as any } });
  }

  async findUserByEmailExcludingId(email: string, excludeUserId: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { email, id: Not(excludeUserId) as any } });
  }

  async findNameDobDuplicate(firstName: string, lastName: string, dob: Date, excludeUserId: number): Promise<Patient | null> {
    return this.patientRepository
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .where('u.first_name = :fn AND u.last_name = :ln AND p.date_of_birth = :dob AND p.id != :uid', {
        fn: firstName,
        ln: lastName,
        dob,
        uid: excludeUserId,
      })
      .getOne();
  }

  async createPlaceholderPatient(): Promise<Patient> {
    const suffix = Math.random().toString(36).slice(2, 8);
    const tempEmail = `temp+${Date.now()}_${suffix}@example.local`;
    const patientRole = await this.roleRepo.findOne({ where: { code: RoleCode.PATIENT } });

    const user = this.userRepo.create({
      firstName: 'Temp',
      lastName: `Patient-${suffix}`,
      email: tempEmail,
      phone: null,
      passwordHash: `TEMP-${suffix}`,
      isActive: true,
      role: patientRole!,
    });
    const savedUser = await this.userRepo.save(user);

    const patient = this.patientRepository.create({
      user: savedUser,
      dni: `TMP${Math.random().toString().slice(2, 11)}`,
      dateOfBirth: new Date('1970-01-01T00:00:00.000Z'),
      occupation: 'N/A',
      biologicalSex: BiologicalSex.INTERSEX,
      medicalInsuranceId: null,
      coverageMemberId: null,
    });
    return this.patientRepository.save(patient);
  }
}