import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { Doctor } from '@users/entities/doctor.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async resetLoginAttempts(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLogin: null,
    });
  }

  async recordFailedLogin(
    userId: number,
    attempts: number,
    lockUntil: Date | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: attempts,
      lockedUntil: lockUntil,
      lastFailedLogin: new Date(),
    });
  }

  async uploadDoctorSignature(
    doctorId: number,
    signatureFile: Express.Multer.File,
  ): Promise<string> {
    // Buscar el doctor o director
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      relations: ['role'],
    });

    if (!doctor || (doctor.role?.code !== 'doctor' && doctor.role?.code !== 'director')) {
      throw new NotFoundException('Doctor o Director no encontrado');
    }

    // Crear directorio si no existe
    const uploadDir = './uploads/signatures';
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Si ya tiene firma, eliminar la anterior
    if ((doctor as Doctor).signatureUri) {
      try {
        const oldFilePath = path.join(
          process.cwd(),
          (doctor as Doctor).signatureUri!,
        );
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (error) {
        console.error('Error eliminando firma anterior:', error);
      }
    }

    // Guardar nueva firma
    const ext = path.extname(signatureFile.originalname);
    const filename = `doctor-${doctorId}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, signatureFile.buffer);

    const signatureUri = `/uploads/signatures/${filename}`;

    // Actualizar en la base de datos
    await this.userRepository.update(doctorId, {
      signatureUri,
    } as any);

    return signatureUri;
  }

  async getDoctorSignature(doctorId: number): Promise<string | null> {
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      relations: ['role'],
    });

    if (!doctor || (doctor.role?.code !== 'doctor' && doctor.role?.code !== 'director')) {
      throw new NotFoundException('Doctor o Director no encontrado');
    }

    return (doctor as Doctor).signatureUri || null;
  }

  async deleteDoctorSignature(doctorId: number): Promise<void> {
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      relations: ['role'],
    });

    if (!doctor || (doctor.role?.code !== 'doctor' && doctor.role?.code !== 'director')) {
      throw new NotFoundException('Doctor o Director no encontrado');
    }

    // Eliminar archivo físico si existe
    if ((doctor as Doctor).signatureUri) {
      try {
        const filepath = path.join(
          process.cwd(),
          (doctor as Doctor).signatureUri!,
        );
        if (fs.existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (error) {
        console.error('Error eliminando archivo de firma:', error);
      }
    }

    // Actualizar en la base de datos
    await this.userRepository.update(doctorId, {
      signatureUri: null,
    } as any);
  }
}
