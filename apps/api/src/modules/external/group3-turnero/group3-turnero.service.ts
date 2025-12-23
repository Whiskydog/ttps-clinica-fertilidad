import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group3TurneroService {
  private readonly baseUrl =
    'https://ahlnfxipnieoihruewaj.supabase.co/functions/v1';

  private readonly token =
    process.env.TURNERO_API_TOKEN || 
    'DUMMY_TURNERO_TOKEN';

  constructor(private readonly http: HttpService) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // POST /post_turnos
  async crearTurnos(body: {
    id_medico: number;
    hora_inicio: string;
    hora_fin: string;
    dia_semana: number;
  }) {
    const url = `${this.baseUrl}/post_turnos`;
    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.headers() }),
    );
    return data;
  }

  // GET /get_turnos_medico?id_medico=#
  async turnosMedico(id_medico: number) {
    const url = `${this.baseUrl}/get_turnos_medico?id_medico=${id_medico}`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers() }),
    );
    return data;
  }

  // PATCH /reservar_turno
  async reservarTurno(body: { id_paciente: number; id_turno: number }) {
    const url = `${this.baseUrl}/reservar_turno`;
    const { data } = await firstValueFrom(
      this.http.patch(url, body, { headers: this.headers() }),
    );
    return data;
  }

  // PATCH /cancelar_turno?id_turno=#
  async cancelarTurno(id_turno: number) {
    const url = `${this.baseUrl}/cancelar_turno?id_turno=${id_turno}`;
    const { data } = await firstValueFrom(
      this.http.patch(url, {}, { headers: this.headers() }),
    );
    return data;
  }

  // GET /get_turnos_paciente?id_paciente=#
  async turnosPaciente(id_paciente: number) {
    const url = `${this.baseUrl}/get_turnos_paciente?id_paciente=${id_paciente}`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers() }),
    );
    return data;
  }

  // GET /get_medico_fecha?id_medico=#&fecha=YYYY-MM-DD
  async turnosPorFecha(id_medico: number, fecha: string) {
    const url = `${this.baseUrl}/get_medico_fecha?id_medico=${id_medico}&fecha=${fecha}`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers() }),
    );
    return data;
  }

  // DELETE /delete_turnos
  async borrarTurnos() {
    const url = `${this.baseUrl}/delete_turnos`;
    const { data } = await firstValueFrom(
      this.http.delete(url, { headers: this.headers() }),
    );
    return data;
  }
}
