'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import Link from 'next/link';

interface TreatmentCardProps {
  treatment: {
    id: number;
    status: string;
    initialObjective: string;
    startDate: string;
    doctor: {
      firstName: string;
      lastName: string;
    };
    nextAppointment?: {
      date: string;
      time: string;
      type: string;
    };
  };
}

const objectiveLabels: Record<string, string> = {
  gametos_propios: 'Fertilización con gametos propios',
  couple_female: 'Pareja mismo sexo',
  method_ropa: 'Método ROPA',
  woman_single: 'Mujer sin pareja',
  preservation_ovocytes_embryos: 'Preservación',
};

export function TreatmentCard({ treatment }: TreatmentCardProps) {
  return (
    <Card className="bg-slate-600 text-white border-none">
      <CardHeader>
        <CardTitle className="text-2xl">Tratamiento Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <p>
            <span className="font-semibold">Estado:</span> {treatment.status.toUpperCase()}
          </p>
          <p>
            <span className="font-semibold">Tipo:</span>{' '}
            {objectiveLabels[treatment.initialObjective]}
          </p>
          <p>
            <span className="font-semibold">Médico:</span> Dr. {treatment.doctor.firstName}{' '}
            {treatment.doctor.lastName}
          </p>
          <p>
            <span className="font-semibold">Inicio:</span>{' '}
            {new Date(treatment.startDate).toLocaleDateString('es-AR')}
          </p>
        </div>

        {treatment.nextAppointment && (
          <div className="mt-4 pt-4 border-t border-slate-500">
            <p className="font-semibold">Próxima cita:</p>
            <p>
              {new Date(treatment.nextAppointment.date).toLocaleDateString('es-AR')} -{' '}
              {treatment.nextAppointment.time}hs
            </p>
          </div>
        )}

        <div className="pt-4">
          <Link href={`/patient/treatment/${treatment.id}`}>
            <Button variant="secondary" className="w-full">
              Ver detalles
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
