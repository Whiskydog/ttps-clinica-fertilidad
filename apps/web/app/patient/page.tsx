"use client";

import Link from "next/link";

export default function PatientDashboard() {
  const currentTreatment = {
    status: "VIGENTE",
    type: "Fertilización con gametos propios",
    doctor: "Dr. Juan Pérez",
    startDate: "01/09/2025",
    nextAppointment: "25/09/2025 - 10:00hs",
  };

  const previousTreatments = [
    {
      id: 1,
      name: "Tratamiento #1 - CERRADO",
      type: "Fertilización con gametos propios",
      doctor: "Dr. Juan Pérez",
      period: "01/2024 - 03/2024",
    },
  ];

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Current Treatment Card */}
          <div className="card">
            <div className="p-4 border-b">
              <h3 className="section-title">Tratamiento Actual</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <p className="text-black">
                  <span className="font-semibold">Estado:</span>{" "}
                  {currentTreatment.status}
                </p>
                <p className="text-black">
                  <span className="font-semibold">Tipo:</span>{" "}
                  {currentTreatment.type}
                </p>
                <p className="text-black">
                  <span className="font-semibold">Médico:</span>{" "}
                  {currentTreatment.doctor}
                </p>
                <p className="text-black">
                  <span className="font-semibold">Inicio:</span>{" "}
                  {currentTreatment.startDate}
                </p>
                <p className="text-black">
                  <span className="font-semibold">Próxima cita:</span>{" "}
                  {currentTreatment.nextAppointment}
                </p>
              </div>

              <div className="pt-4">
                <Link href="/patient/treatment/current" className="btn-primary">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>

          {/* Treatment History Card */}
          <div className="card">
            <h3 className="section-title">Historial Tratamientos</h3>
            <div className="space-y-4 mt-4">
              {previousTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{treatment.name}</p>
                    <p className="text-sm">Tipo: {treatment.type}</p>
                    <p className="text-sm">Médico: {treatment.doctor}</p>
                    <p className="text-sm">Período: {treatment.period}</p>
                  </div>
                  <Link
                    href={`/patient/treatment/${treatment.id}`}
                    className="btn-primary"
                  >
                    Ver Detalles
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="lg:col-span-1 space-y-3 order-1 lg:order-2">
          <Link
            href="/patient/appointments"
            className="btn-primary w-full text-center"
          >
            Sacar Turno
          </Link>

          <Link
            href="/patient/medical-history"
            className="btn-primary w-full text-center"
          >
            Historia Clínica
          </Link>

          <Link
            href="/patient/calendar"
            className="btn-primary w-full text-center"
          >
            Ver calendario
          </Link>

          <Link
            href="/patient/orders"
            className="btn-primary w-full text-center"
          >
            Ver Órdenes Médicas
          </Link>

          <Link
            href="/patient/cryo-products"
            className="btn-primary w-full text-center"
          >
            Mis Productos Criopreservados
          </Link>
        </div>
      </div>
    </div>
  );
}
