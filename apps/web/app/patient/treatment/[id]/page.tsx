import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { TreatmentTimeline } from '@/components/patient/treatment/treatment-timeline';
import { MedicationProtocol } from '@/components/patient/treatment/medication-protocol';
import { MonitoringList } from '@/components/patient/treatment/monitoring-list';
import { DoctorNotes } from '@/components/patient/treatment/doctor-notes';
import { mockTreatmentDetail } from '../../lib/mock-data';

export default function TreatmentDetailPage() {
  const treatment = mockTreatmentDetail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient">
          <Button variant="outline">← Volver a inicio</Button>
        </Link>
        <h1 className="text-2xl font-bold">DETALLE DEL TRATAMIENTO {treatment.code}</h1>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN GENERAL</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Badge className="bg-green-500 text-black text-sm px-3 py-1">
              Estado: {treatment.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-semibold">Tipo de Tratamiento:</span> {treatment.type}
              </p>
              <p>
                <span className="font-semibold">Objetivo inicial:</span> {treatment.initialObjective}
              </p>
              <p>
                <span className="font-semibold">Fecha de inicio:</span>{' '}
                {new Date(treatment.startDate).toLocaleDateString('es-AR')}
              </p>
              <p>
                <span className="font-semibold">Médico tratante:</span> Dr. {treatment.doctor.firstName}{' '}
                {treatment.doctor.lastName}
              </p>
            </div>

            <div>
              <p>
                <span className="font-semibold">Pareja:</span> {treatment.partner.firstName}{' '}
                {treatment.partner.lastName}
              </p>
              <p>
                <span className="font-semibold">DNI Pareja:</span> {treatment.partner.dni}
              </p>
              <p>
                <span className="font-semibold">Datos de semen:</span> {treatment.partner.semenData}
              </p>
              <p>
                <span className="font-semibold">Donante requerido:</span>{' '}
                {treatment.partner.donorRequired ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TreatmentTimeline timeline={treatment.timeline} />

      <MedicationProtocol protocol={treatment.protocol} />

      <MonitoringList monitorings={treatment.monitorings} />

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">RESULTADOS DE PUNCIÓN (Pendiente)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              Fecha programada:{' '}
              {new Date(treatment.puncture.scheduledDate).toLocaleDateString('es-AR')} -{' '}
              {treatment.puncture.scheduledTime}hs
            </p>
            <p>Quirófano: {treatment.puncture.operatingRoom}</p>
            <p className="text-gray-500 italic">Anestesia: Sedación consciente</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">ÓVULOS Y EMBRIONES</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 italic">
            Sin datos aún - Pendiente de punción
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">SEGUIMIENTO POST-TRANSFERENCIA</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 italic">
            Sin datos aún - Pendiente de transferencia
          </p>
        </CardContent>
      </Card>

      <DoctorNotes notes={treatment.doctorNotes} />
    </div>
  );
}
