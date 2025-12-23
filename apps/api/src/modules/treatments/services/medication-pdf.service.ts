import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { MedicationProtocol } from '../entities/medication-protocol.entity';
import { Treatment } from '../entities/treatment.entity';
import { Group8NoticesService } from '../../external/group8-notices/group8-notices.service';

interface GeneratePdfData {
  treatmentId: number;
  doctorSignature: Express.Multer.File;
  doctorId: number;
}

@Injectable()
export class MedicationPdfService {
  private readonly uploadsDir = path.join(
    process.cwd(),
    'uploads',
    'medication-protocols',
  );

  constructor(
    @InjectRepository(MedicationProtocol)
    private protocolRepository: Repository<MedicationProtocol>,
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
    private readonly noticesService: Group8NoticesService,
  ) {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generatePdf(data: GeneratePdfData): Promise<MedicationProtocol> {
    // 1. Obtener tratamiento con relaciones
    const treatment = await this.treatmentRepository.findOne({
      where: { id: data.treatmentId },
      relations: [
        'initialDoctor',
        'medicalHistory',
        'medicalHistory.patient',
      ],
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    // 2. Obtener protocolo de medicación
    const protocol = await this.protocolRepository.findOne({
      where: { treatmentId: data.treatmentId },
    });

    if (!protocol) {
      throw new NotFoundException(
        'No existe protocolo de medicación para este tratamiento',
      );
    }

    // 3. Validar que tengamos los datos necesarios
    const patient = treatment.medicalHistory?.patient;
    const doctor = treatment.initialDoctor;

    if (!patient) {
      throw new BadRequestException('No se encontró información del paciente');
    }

    if (!doctor) {
      throw new BadRequestException('No se encontró información del médico');
    }

    // 4. Generar PDF
    const timestamp = Date.now();
    const fileName = `MED-${data.treatmentId}-${timestamp}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);
    const pdfUrl = `/uploads/medication-protocols/${fileName}`;

    await this.createPdfDocument({
      filePath,
      protocol,
      patient,
      doctor,
      treatmentId: data.treatmentId,
      timestamp,
      doctorSignature: data.doctorSignature,
    });

    // 5. Actualizar protocolo con URL del PDF
    protocol.pdfUrl = pdfUrl;
    protocol.pdfGeneratedAt = new Date();
    await this.protocolRepository.save(protocol);

    // 6. Enviar email al paciente
    if (patient.email) {
      await this.sendNotificationEmail({
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        code: `MED-${data.treatmentId}-${timestamp}`,
      });
    }

    return protocol;
  }

  private async createPdfDocument(params: {
    filePath: string;
    protocol: MedicationProtocol;
    patient: any;
    doctor: any;
    treatmentId: number;
    timestamp: number;
    doctorSignature: Express.Multer.File;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const stream = fs.createWriteStream(params.filePath);
      doc.pipe(stream);

      const { protocol, patient, doctor, treatmentId, timestamp } = params;

      // Header
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('CLÍNICA DE FERTILIDAD', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('ORDEN DE MEDICACIÓN', { align: 'center' });
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Código: MED-${treatmentId}-${timestamp}`, { align: 'center' });

      doc.moveDown(1);

      // Línea divisoria
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(0.5);

      // Datos del paciente
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('PACIENTE');
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nombre: ${patient.firstName} ${patient.lastName}`);
      doc.text(`DNI: ${patient.dni || 'No especificado'}`);

      doc.moveDown(1);

      // Línea divisoria
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(0.5);

      // Medicación prescrita
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('MEDICACIÓN PRESCRITA');
      doc.moveDown(0.5);

      // Medicamento principal
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Medicamento principal:');
      doc.moveDown(0.3);
      doc.font('Helvetica');
      doc.text(`• ${protocol.drugName}`);
      doc.text(`  Dosis: ${protocol.dose}`);
      doc.text(`  Vía de administración: ${protocol.administrationRoute}`);
      if (protocol.duration) {
        doc.text(`  Duración: ${protocol.duration}`);
      }
      if (protocol.startDate) {
        const startDateFormatted = new Date(protocol.startDate).toLocaleDateString('es-AR');
        doc.text(`  Fecha de inicio: ${startDateFormatted}`);
      }

      doc.moveDown(0.5);

      // Medicación adicional
      if (protocol.additionalMedication && protocol.additionalMedication.length > 0) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Medicación adicional:');
        doc.moveDown(0.3);
        doc.font('Helvetica');
        for (const med of protocol.additionalMedication) {
          doc.text(`• ${med}`);
        }
        doc.moveDown(0.5);
      }

      doc.moveDown(0.5);

      // Línea divisoria
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(0.5);

      // Tipo de protocolo
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Tipo de protocolo: ', { continued: true })
        .font('Helvetica')
        .text(protocol.protocolType);

      doc.moveDown(1);

      // Línea divisoria
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(0.5);

      // Datos del médico
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('MÉDICO PRESCRIPTOR');
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Dr. ${doctor.firstName} ${doctor.lastName}`);
      doc.text(`Matrícula: ${doctor.license || 'No especificada'}`);

      doc.moveDown(1);

      // Firma del médico
      if (params.doctorSignature && params.doctorSignature.buffer) {
        try {
          doc.image(params.doctorSignature.buffer, {
            width: 150,
            height: 75,
          });
        } catch (error) {
          doc.text('[Firma del médico]');
        }
      }

      doc.moveDown(1);

      // Fecha de emisión
      const emissionDate = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Fecha de emisión: ${emissionDate}`);

      // Finalizar documento
      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }

  private async sendNotificationEmail(params: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    code: string;
  }): Promise<void> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Orden de Medicación Disponible</h2>
        <p>Estimado/a ${params.patientName},</p>
        <p>Le informamos que su médico ha generado una nueva orden de medicación.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Código:</strong> ${params.code}</p>
          <p style="margin: 5px 0;"><strong>Médico:</strong> Dr. ${params.doctorName}</p>
        </div>
        <p>Puede descargar el PDF de su orden de medicación ingresando a su cuenta en el portal de pacientes,
        sección "Mi Tratamiento".</p>
        <p>Este documento puede ser presentado en la farmacia para adquirir los medicamentos indicados.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Este es un mensaje automático, por favor no responda a este correo.
        </p>
      </div>
    `;

    try {
      await this.noticesService.sendEmail({
        group: 8,
        toEmails: [params.patientEmail],
        subject: `Orden de Medicación ${params.code} - PDF Disponible`,
        htmlBody,
      });
    } catch (error) {
      // Log error pero no fallar la generación del PDF
      console.error('Error al enviar email de notificación:', error);
    }
  }

  async getProtocolPdf(treatmentId: number): Promise<string | null> {
    const protocol = await this.protocolRepository.findOne({
      where: { treatmentId },
    });

    if (!protocol) {
      throw new NotFoundException('Protocolo de medicación no encontrado');
    }

    return protocol.pdfUrl;
  }
}
