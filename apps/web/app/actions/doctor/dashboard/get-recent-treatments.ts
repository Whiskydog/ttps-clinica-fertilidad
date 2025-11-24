"use server";

export type RecentTreatment = {
  id: number;
  patientId: number;
  patientName: string;
  status: string;
  lastMovement: string;
  lastMovementDate: string;
};

export async function getRecentTreatments(): Promise<{
  data: RecentTreatment[];
}> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const data: RecentTreatment[] = [
    {
      id: 1,
      patientId: 101,
      patientName: "María González",
      status: "Estimulación",
      lastMovement: "Monitoreo día 7 - Respuesta adecuada",
      lastMovementDate: new Date().toISOString(),
    },
    {
      id: 2,
      patientId: 102,
      patientName: "Ana Martínez",
      status: "Resultados",
      lastMovement: "Estudios hormonales completados",
      lastMovementDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      patientId: 103,
      patientName: "Laura Fernández",
      status: "Transferencia",
      lastMovement: "Programada para próxima semana",
      lastMovementDate: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 4,
      patientId: 104,
      patientName: "Carolina Pérez",
      status: "Punción",
      lastMovement: "Recuperación de 12 oocitos",
      lastMovementDate: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 5,
      patientId: 105,
      patientName: "Sofía Rodríguez",
      status: "Completado",
      lastMovement: "Beta positiva confirmada",
      lastMovementDate: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  console.log(
    "[DOCTOR] GET Recent Treatments:",
    data.length,
    "treatments"
  );

  return { data };
}
