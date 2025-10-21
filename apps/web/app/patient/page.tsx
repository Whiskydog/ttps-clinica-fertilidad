'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

export default function PatientDashboard() {
  const currentTreatment = {
    status: 'VIGENTE',
    type: 'Fertilización con gametos propios',
    doctor: 'Dr. Juan Pérez',
    startDate: '01/09/2025',
    nextAppointment: '25/09/2025 - 10:00hs',
  };

  const previousTreatments = [
    {
      id: 1,
      name: 'Tratamiento #1 - CERRADO',
      type: 'Fertilización con gametos propios',
      doctor: 'Dr. Juan Pérez',
      period: '01/2024 - 03/2024',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Side */}
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        {/* Current Treatment Card */}
        <Card className="bg-slate-400 border-slate-500">
          <CardHeader>
            <CardTitle className="text-black text-xl">
              Tratamiento Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-black">
                <span className="font-semibold">Estado:</span>{' '}
                {currentTreatment.status}
              </p>
              <p className="text-black">
                <span className="font-semibold">Tipo:</span>{' '}
                {currentTreatment.type}
              </p>
              <p className="text-black">
                <span className="font-semibold">Médico:</span>{' '}
                {currentTreatment.doctor}
              </p>
              <p className="text-black">
                <span className="font-semibold">Inicio:</span>{' '}
                {currentTreatment.startDate}
              </p>
              <p className="text-black">
                <span className="font-semibold">Próxima cita:</span>{' '}
                {currentTreatment.nextAppointment}
              </p>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/patient/treatment/current">Ver detalles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Treatment History Card */}
        <Card className="bg-purple-300 border-purple-400">
          <CardHeader>
            <CardTitle className="text-black text-xl text-center">
              Historial Tratamientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previousTreatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-gray-900 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="text-white space-y-1">
                  <p className="font-semibold">{treatment.name}</p>
                  <p className="text-sm">Tipo: {treatment.type}</p>
                  <p className="text-sm">Médico: {treatment.doctor}</p>
                  <p className="text-sm">Período: {treatment.period}</p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                >
                  <Link href={`/patient/treatment/${treatment.id}`}>
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Right Side */}
      <div className="lg:col-span-1 space-y-3 order-1 lg:order-2">
        <Button
          asChild
          className="w-full bg-red-400 hover:bg-red-500 text-black font-semibold py-6 text-base"
        >
          <Link href="/patient/appointments">Sacar Turno</Link>
        </Button>

        <Button
          asChild
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 text-base"
        >
          <Link href="/patient/medical-history">Historia Clínica</Link>
        </Button>

        <Button
          asChild
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-6 text-base"
        >
          <Link href="/patient/calendar">Ver calendario</Link>
        </Button>

        <Button
          asChild
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-6 text-base"
        >
          <Link href="/patient/orders">Ver Órdenes Médicas</Link>
        </Button>

        <Button
          asChild
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-6 text-base"
        >
          <Link href="/patient/cryo-products">
            Mis Productos Criopreservados
          </Link>
        </Button>
      </div>
    </div>
  );
}
