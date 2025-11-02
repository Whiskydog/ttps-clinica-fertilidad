import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '@users/entities/admin.entity';
import { Doctor } from '@users/entities/doctor.entity';
import { Director } from '@users/entities/director.entity';
import { LabTechnician } from '@users/entities/lab-technician.entity';
import { Role } from '@users/entities/role.entity';
import { User } from '@users/entities/user.entity';
import argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UserValidationService } from './user-validation.service';
import { RoleCode, type AdminUserCreate } from '@repo/contracts';

@Injectable()
export class StaffUsersService {
  constructor(
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Director)
    private directorRepository: Repository<Director>,
    @InjectRepository(LabTechnician)
    private labTechnicianRepository: Repository<LabTechnician>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private userValidationService: UserValidationService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllStaffUsers(
    page: number = 1,
    perPage: number = 10,
  ): Promise<{ data: User[]; meta: any }> {
    const skip = (page - 1) * perPage;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.role != :patientRole', { patientRole: RoleCode.PATIENT })
      .skip(skip)
      .take(perPage)
      .getManyAndCount();

    const totalPages = Math.ceil(total / perPage);

    return {
      data: users,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    };
  }

  async createStaffUser(dto: AdminUserCreate): Promise<User> {
    await this.userValidationService.ensureStaffUserUniqueness({
      email: dto.email,
    });

    const passwordHash = await argon2.hash(dto.password);
    const role = await this.roleRepository.findOneBy({
      code: this.getRoleCodeForUserType(dto.userType),
    });

    const baseData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      isActive: dto.isActive,
      role,
    };

    switch (dto.userType) {
      case 'doctor':
        return this.doctorRepository.save(
          this.doctorRepository.create({
            ...baseData,
            specialty: dto.specialty!,
            licenseNumber: dto.licenseNumber!,
          }),
        );
      case 'lab_technician':
        return this.labTechnicianRepository.save(
          this.labTechnicianRepository.create({
            ...baseData,
            labArea: dto.labArea!,
          }),
        );
      case 'admin':
        return this.adminRepository.save(this.adminRepository.create(baseData));
      case 'director':
        return this.directorRepository.save(
          this.directorRepository.create({
            ...baseData,
            licenseNumber: dto.licenseNumber!,
          }),
        );
      default:
        throw new Error(`Tipo de usuario no soportado: ${(dto as any).userType}`);
    }
  }

  private getRoleCodeForUserType(userType: string): RoleCode {
    const roleMap: Record<string, RoleCode> = {
      doctor: RoleCode.DOCTOR,
      lab_technician: RoleCode.LAB_TECHNICIAN,
      admin: RoleCode.ADMIN,
      director: RoleCode.DIRECTOR,
    };
    return roleMap[userType];
  }
}
