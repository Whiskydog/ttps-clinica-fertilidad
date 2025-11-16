"use client";

import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { MedicationProtocol } from '@/components/patient/treatment/medication-protocol';
import { MonitoringList } from '@/components/patient/treatment/monitoring-list';
import { DoctorNotes } from '@/components/patient/treatment/doctor-notes';
import { getTreatmentDetail } from '@/app/actions/patients/treatments/get-detail';
import type { TreatmentDetail } from '@repo/contracts';

export default function TreatmentDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["treatment-detail", id],
    queryFn: () => getTreatmentDetail(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando detalle del tratamiento...</div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error al cargar el tratamiento</div>
      </div>
    );
  }

  const treatmentData = response.data as TreatmentDetail;
  const { treatment, monitorings, protocol, doctorNotes } = treatmentData;

  return (
    <div className="space-y-6">
      <Link href="/patient">
        <Button variant="link">← Volver a inicio</Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">DETALLE DEL TRATAMIENTO #{treatment.id}</h1>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN GENERAL</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Badge className="bg-green-500 text-black text-sm px-3 py-1">
              Estado: {treatment.status?.toUpperCase() || 'VIGENTE'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-semibold">Objetivo inicial:</span>{' '}
                {treatment.initialObjective || 'No especificado'}
              </p>
              {treatment.startDate && (
                <p>
                  <span className="font-semibold">Fecha de inicio:</span>{' '}
                  {new Date(treatment.startDate).toLocaleDateString('es-AR')}
                </p>
              )}
              {treatment.initialDoctor && (
                <p>
                  <span className="font-semibold">Médico tratante:</span> Dr.{' '}
                  {treatment.initialDoctor.firstName} {treatment.initialDoctor.lastName}
                </p>
              )}
            </div>

            <div>
              {treatment.closureReason && (
                <p>
                  <span className="font-semibold">Motivo de cierre:</span> {treatment.closureReason}
                </p>
              )}
              {treatment.closureDate && (
                <p>
                  <span className="font-semibold">Fecha de cierre:</span>{' '}
                  {new Date(treatment.closureDate).toLocaleDateString('es-AR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {protocol && <MedicationProtocol protocol={protocol} />}

      {monitorings && monitorings.length > 0 && <MonitoringList monitorings={monitorings} />}

      {doctorNotes && doctorNotes.length > 0 && <DoctorNotes notes={doctorNotes} />}
    </div>
  );
}
