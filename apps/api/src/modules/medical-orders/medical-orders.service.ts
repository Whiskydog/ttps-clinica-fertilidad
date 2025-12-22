import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MedicalOrder, MedicalOrderStatus, Study } from './entities/medical-order.entity';
import { StudyResultService } from './services/study-result.service';
import { InformedConsentService } from '@modules/treatments/services/informed-consent.service';
import { Group1StudiesService } from '@external/group1-studies/group1-studies.service';
import { Group8NoticesService } from '@external/group8-notices/group8-notices.service';
import { parseDateFromString } from '@common/utils/date.utils';
import { User } from '@users/entities/user.entity';
import { Doctor } from '@users/entities/doctor.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MedicalOrdersService {
  private readonly logger = new Logger(MedicalOrdersService.name);

  constructor(
    @InjectRepository(MedicalOrder)
    private medicalOrderRepository: Repository<MedicalOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly studyResultService: StudyResultService,
    private readonly informedConsentService: InformedConsentService,
    private readonly group1StudiesService: Group1StudiesService,
    private readonly group8NoticesService: Group8NoticesService,
  ) { }

  async create(data: {
    patientId: number;
    doctorId: number;
    treatmentId?: number;
    category: string;
    description?: string;
    studies?: Study[];
    diagnosis?: string;
    justification?: string;
  }): Promise<MedicalOrder> {
    // Verificar consentimiento si la orden está asociada a un tratamiento
    if (data.treatmentId) {
      const hasConsent = await this.informedConsentService.hasValidConsent(data.treatmentId);
      if (!hasConsent) {
        throw new ForbiddenException(
          'No se puede crear una orden médica sin consentimiento informado firmado. ' +
          'Por favor, suba el consentimiento firmado antes de continuar.'
        );
      }
    }

    // Generate unique code
    const year = new Date().getFullYear();
    const count = await this.medicalOrderRepository.count();
    const code = `OM-${year}-${String(count + 1).padStart(5, '0')}`;

    const medicalOrder = this.medicalOrderRepository.create({
      code,
      issueDate: new Date(),
      status: 'pending',
      patientId: data.patientId,
      doctorId: data.doctorId,
      treatmentId: data.treatmentId ?? null,
      category: data.category,
      description: data.description ?? null,
      studies: data.studies ?? null,
      diagnosis: data.diagnosis ?? null,
      justification: data.justification ?? null,
    });

    return await this.medicalOrderRepository.save(medicalOrder);
  }

  async update(
    id: number,
    data: {
      category?: string;
      description?: string;
      studies?: Study[];
      diagnosis?: string;
      justification?: string;
      status?: MedicalOrderStatus;
      completedDate?: Date | null;
    },
  ): Promise<MedicalOrder> {
    const medicalOrder = await this.medicalOrderRepository.findOne({
      where: { id },
    });

    if (!medicalOrder) {
      throw new NotFoundException('Orden médica no encontrada');
    }

    if (data.category !== undefined) {
      medicalOrder.category = data.category;
    }
    if (data.description !== undefined) {
      medicalOrder.description = data.description;
    }
    if (data.studies !== undefined) {
      medicalOrder.studies = data.studies;
    }
    if (data.diagnosis !== undefined) {
      medicalOrder.diagnosis = data.diagnosis;
    }
    if (data.justification !== undefined) {
      medicalOrder.justification = data.justification;
    }
    if (data.status !== undefined) {
      medicalOrder.status = data.status;
    }
    if (data.completedDate !== undefined) {
      medicalOrder.completedDate = data.completedDate
        ? parseDateFromString(data.completedDate)
        : null;
    }

    return await this.medicalOrderRepository.save(medicalOrder);
  }

  async findByPatient(
    patientId: number,
    status?: MedicalOrderStatus,
    unassigned: boolean = false,
  ) {
    const where: any = { patientId };

    if (status) {
      where.status = status;
    }

    if (unassigned) {
      where.treatmentId = IsNull();
    }

    return await this.medicalOrderRepository.find({
      where,
      relations: ['doctor', 'treatment', 'studyResults'],
      order: { issueDate: 'DESC' },
    });
  }

  /**
   * Obtiene todas las órdenes médicas con filtros opcionales (para Director Médico)
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: MedicalOrderStatus;
    category?: string;
    doctorId?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.doctorId) {
      where.doctorId = options.doctorId;
    }

    const [data, total] = await this.medicalOrderRepository.findAndCount({
      where,
      relations: ['doctor', 'patient', 'treatment'],
      order: { issueDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findByTreatment(treatmentId: number, status?: MedicalOrderStatus) {
    const where: any = { treatmentId };

    if (status) {
      where.status = status;
    }

    return await this.medicalOrderRepository.find({
      where,
      relations: ['doctor', 'treatment', 'patient', 'studyResults'],
      order: { issueDate: 'DESC' },
    });
  }

  async findOne(id: number, patientId: number) {
    const order = await this.medicalOrderRepository.findOne({
      where: { id, patientId },
      relations: ['doctor', 'treatment', 'patient'],
    });

    if (!order) {
      throw new NotFoundException('Medical order not found');
    }

    // Fetch study results for this medical order
    const studyResults = await this.studyResultService.findByMedicalOrderId(id);

    return {
      ...order,
      studyResults,
    };
  }

  async findOneForDoctor(id: number) {
    const order = await this.medicalOrderRepository.findOne({
      where: { id },
      relations: ['doctor', 'treatment', 'patient'],
    });

    if (!order) {
      throw new NotFoundException('Medical order not found');
    }

    // Fetch study results for this medical order
    const studyResults = await this.studyResultService.findByMedicalOrderId(id);

    return {
      ...order,
      studyResults,
    };
  }

  /**
   * Genera el PDF de la orden médica usando el servicio externo
   * Requiere la firma del médico en formato PNG
   */
  async generatePdf(
    orderId: number,
    doctorSignature?: Express.Multer.File,
  ): Promise<MedicalOrder> {
    this.logger.log(`Buscando orden médica con ID: ${orderId}`);

    const order = await this.medicalOrderRepository.findOne({
      where: { id: orderId },
      relations: ['doctor', 'patient'],
    });

    if (!order) {
      this.logger.warn(`Orden médica con ID ${orderId} no encontrada`);
      throw new NotFoundException(`Orden médica con ID ${orderId} no encontrada`);
    }

    this.logger.log(`Orden encontrada: ${order.code}, paciente: ${order.patient?.firstName} ${order.patient?.lastName}`);

    // Si no se proporciona firma, buscar la firma guardada del doctor
    let signatureToUse = doctorSignature;
    if (!signatureToUse) {
      this.logger.log(`No se proporcionó firma, buscando firma guardada para doctor ID: ${order.doctor.id}`);

      const doctor = await this.userRepository.findOne({
        where: { id: order.doctor.id },
      });

      const doctorSignatureUri = (doctor as Doctor)?.signatureUri;

      if (!doctorSignatureUri) {
        throw new BadRequestException(
          'No se proporcionó firma y el médico no tiene una firma guardada. Por favor, configure su firma en el sistema.'
        );
      }

      // Leer el archivo de firma guardada
      const signaturePath = path.join(process.cwd(), doctorSignatureUri);
      if (!fs.existsSync(signaturePath)) {
        throw new BadRequestException(
          'La firma guardada del médico no se encuentra en el sistema. Por favor, vuelva a cargar su firma.'
        );
      }

      const signatureBuffer = fs.readFileSync(signaturePath);
      const ext = path.extname(signaturePath);
      const mimetype = ext === '.png' ? 'image/png' : 'image/jpeg';

      // Crear un objeto File-like para la firma guardada
      signatureToUse = {
        buffer: signatureBuffer,
        originalname: `doctor-${order.doctor.id}-signature${ext}`,
        mimetype,
        size: signatureBuffer.length,
      } as Express.Multer.File;

      this.logger.log(`Usando firma guardada del doctor: ${doctorSignatureUri}`);
    }

    // Mapear categoría al tipo_estudio esperado por la API externa
    const categoryToTipoEstudio: Record<string, string> = {
      // Valores exactos del selector del frontend
      'Estudios Hormonales': 'estudios_hormonales',
      'Estudios Ginecológicos': 'estudios_ginecologicos',
      'Estudios de Semen': 'estudios_semen',
      'Estudios Prequirúrgicos': 'estudios_prequirurgicos',
      // Valores legacy por compatibilidad
      'semen': 'estudios_semen',
      'hormonal': 'estudios_hormonales',
      'hormonales': 'estudios_hormonales',
      'prequirurgico': 'estudios_prequirurgicos',
      'prequirurgicos': 'estudios_prequirurgicos',
      'ginecologico': 'estudios_ginecologicos',
      'ginecologicos': 'estudios_ginecologicos',
    };

    const tipoEstudio = categoryToTipoEstudio[order.category] || 'estudios_hormonales';
    this.logger.log(`Categoría: ${order.category} -> tipo_estudio: ${tipoEstudio}`);

    // Construir payload según el formato esperado por la API externa
    // La API espera: medico, paciente, tipo_estudio, determinaciones
    const patientDni = (order.patient as any).dni || String(order.patient.id);
    const doctorDni = (order.doctor as any).dni || (order.doctor as any).licenseNumber || String(order.doctor.id);

    // Convertir estudios al formato de determinaciones esperado por la API
    // Formato: [{ nombre: "estudio1" }, { nombre: "estudio2" }]
    const determinaciones = order.studies
      ?.filter(s => s.checked)
      .map(s => ({ nombre: s.name })) || [];

    const payload = {
      medico: {
        nombre: `${order.doctor.firstName} ${order.doctor.lastName}`,
        dni: doctorDni,
      },
      paciente: {
        nombre: `${order.patient.firstName} ${order.patient.lastName}`,
        dni: patientDni,
      },
      tipo_estudio: tipoEstudio,
      determinaciones: determinaciones,
    };

    this.logger.log(`Payload para API externa: ${JSON.stringify(payload)}`);

    try {
      const pdfBuffer = await this.group1StudiesService.generarOrdenMedica(
        payload,
        signatureToUse,
      );

      // La API devuelve el PDF como Buffer binario
      this.logger.log(`PDF recibido como buffer de ${pdfBuffer.length} bytes`);

      // Crear directorio si no existe
      const uploadDir = './uploads/medical-orders';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const filename = `${order.code.replace(/\//g, '-')}-${Date.now()}.pdf`;
      const filepath = path.join(uploadDir, filename);

      // Guardar el PDF como buffer binario
      fs.writeFileSync(filepath, pdfBuffer);

      // Generar URL relativa
      const pdfUrl = `/uploads/medical-orders/${filename}`;
      this.logger.log(`PDF guardado en: ${pdfUrl}`);

      order.pdfUrl = pdfUrl;
      order.pdfGeneratedAt = new Date();

      await this.medicalOrderRepository.save(order);

      this.logger.log(`PDF generado para orden ${order.code}: ${order.pdfUrl}`);

      // Enviar email al paciente con el PDF
      if (order.patient.email && order.pdfUrl) {
        try {
          await this.group8NoticesService.sendEmail({
            group: 1, // Grupo de la clínica
            toEmails: [order.patient.email],
            subject: `Orden Médica ${order.code} - PDF Disponible`,
            htmlBody: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Clínica de Fertilidad Amelia</h2>
                <p>Estimado/a <strong>${order.patient.firstName} ${order.patient.lastName}</strong>,</p>
                <p>Le informamos que su orden médica <strong>${order.code}</strong> ha sido generada y está disponible para su descarga.</p>
                <p><strong>Detalles de la orden:</strong></p>
                <ul>
                  <li><strong>Código:</strong> ${order.code}</li>
                  <li><strong>Categoría:</strong> ${order.category}</li>
                  <li><strong>Médico:</strong> Dr. ${order.doctor.firstName} ${order.doctor.lastName}</li>
                  <li><strong>Fecha de emisión:</strong> ${new Date(order.issueDate).toLocaleDateString('es-AR')}</li>
                </ul>
                <p>Puede descargar el PDF de su orden médica desde el siguiente enlace:</p>
                <p style="text-align: center;">
                  <a href="${order.pdfUrl}"
                     style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Descargar PDF
                  </a>
                </p>
                <p>También puede acceder a su orden desde el portal de pacientes.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                  Este es un mensaje automático, por favor no responda a este correo.
                </p>
              </div>
            `,
          });

          this.logger.log(`Email enviado al paciente ${order.patient.email} para orden ${order.code}`);
        } catch (emailError) {
          // Log error but don't fail the PDF generation
          this.logger.error(
            `Error enviando email para orden ${order.code}: ${JSON.stringify(emailError)}`,
            emailError,
          );
        }
      }

      return order;
    } catch (error) {
      this.logger.error(`Error generando PDF para orden ${order.code}`, error);
      throw error;
    }
  }

  /**
   * Obtiene la URL del PDF de una orden médica
   */
  async getPdfUrl(orderId: number, patientId?: number): Promise<string | null> {
    const where: any = { id: orderId };
    if (patientId) {
      where.patientId = patientId;
    }

    const order = await this.medicalOrderRepository.findOne({
      where,
      select: ['id', 'pdfUrl'],
    });

    if (!order) {
      throw new NotFoundException('Orden médica no encontrada');
    }

    return order.pdfUrl;
  }
}
