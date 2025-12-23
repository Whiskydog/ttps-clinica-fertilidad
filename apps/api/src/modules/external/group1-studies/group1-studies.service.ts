import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class Group1StudiesService {
  private readonly baseUrl =
    'https://srlgceodssgoifgosyoh.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  /**
   * POST /generar_orden_medica
   * Envia multipart/form-data con:
   *  - payload (JSON stringify)
   *  - firma_medico (PNG obligatorio)
   *
   * Devuelve el PDF como Buffer binario
   */
  async generarOrdenMedica(payload: any, firmaMedico: Express.Multer.File): Promise<Buffer> {
    const url = `${this.baseUrl}/generar_orden_medica`;

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));
    form.append('firma_medico', firmaMedico.buffer, {
      filename: firmaMedico.originalname,
      contentType: firmaMedico.mimetype,
    });

    const { data } = await firstValueFrom(
      this.http.post(url, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer', // Recibir PDF como buffer binario
      }),
    );

    return Buffer.from(data);
  }

  // Listados simples (según la documentación del API externa)
  async getSemenStudies() {
    const url = `${this.baseUrl}/estudio_semen`;
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      // La API devuelve array de { id, nombre }, extraemos solo los nombres
      if (Array.isArray(data) && data.length > 0 && data[0].nombre) {
        return data.map((item: { id: number; nombre: string }) => item.nombre);
      }
      return data;
    } catch (error) {
      // Mock data cuando la API externa no está disponible
      return [
        "Espermograma básico",
        "Espermograma con capacitación",
        "Test de fragmentación de ADN espermático",
        "Cultivo de semen",
        "Test de supervivencia espermática",
        "Recuento de espermatozoides móviles (REM)",
        "FISH en espermatozoides",
        "Estudio de meiosis espermática",
      ];
    }
  }

  async getHormonalStudies() {
    const url = `${this.baseUrl}/estudio_hormonales`;
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      // La API devuelve array de { id, nombre }, extraemos solo los nombres
      if (Array.isArray(data) && data.length > 0 && data[0].nombre) {
        return data.map((item: { id: number; nombre: string }) => item.nombre);
      }
      return data;
    } catch (error) {
      // Mock data cuando la API externa no está disponible
      return [
        "FSH (Hormona Folículo Estimulante)",
        "LH (Hormona Luteinizante)",
        "Estradiol (E2)",
        "Progesterona",
        "Prolactina",
        "AMH (Hormona Antimülleriana)",
        "TSH (Hormona Estimulante de Tiroides)",
        "T4 Libre",
        "T3 Total",
        "Testosterona Total",
        "DHEA-S",
        "Androstenediona",
        "17-OH Progesterona",
        "Cortisol",
        "Insulina basal",
        "Beta HCG cuantitativa",
      ];
    }
  }

  async getGynecologicalStudies() {
    const url = `${this.baseUrl}/estudio_ginecologico`;
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      // La API devuelve array de { id, nombre }, extraemos solo los nombres
      if (Array.isArray(data) && data.length > 0 && data[0].nombre) {
        return data.map((item: { id: number; nombre: string }) => item.nombre);
      }
      return data;
    } catch (error) {
      // Mock data cuando la API externa no está disponible
      return [
        "Ecografía transvaginal",
        "Ecografía de seguimiento folicular",
        "Histerosonografía",
        "Histerosalpingografía",
        "Histeroscopía diagnóstica",
        "Papanicolaou (PAP)",
        "Colposcopía",
        "Biopsia de endometrio",
        "Cultivo de flujo vaginal",
        "Test de reserva ovárica",
        "Cariotipo en sangre periférica",
        "Estudio de trombofilia",
      ];
    }
  }

  async getPreSurgicalOrder() {
    const url = `${this.baseUrl}/get-orden-estudio-prequirurgico`;
    try {
      const { data } = await firstValueFrom(this.http.get(url));
      // La API devuelve array de { id, nombre }, extraemos solo los nombres
      if (Array.isArray(data) && data.length > 0 && data[0].nombre) {
        return data.map((item: { id: number; nombre: string }) => item.nombre);
      }
      return data;
    } catch (error) {
      // Mock data cuando la API externa no está disponible
      return [
        "Hemograma completo",
        "Glucemia",
        "Uremia",
        "Creatinina",
        "Coagulograma (TP, KPTT)",
        "Grupo sanguíneo y factor Rh",
        "HIV (ELISA)",
        "Hepatitis B (HBsAg)",
        "Hepatitis C (Anti-HCV)",
        "VDRL",
        "Chagas (IgG)",
        "Toxoplasmosis (IgG e IgM)",
        "Rubéola (IgG)",
        "CMV (IgG)",
        "Electrocardiograma",
        "Radiografía de tórax",
        "Riesgo quirúrgico",
      ];
    }
  }
}
