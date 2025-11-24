"use server";

export type DoctorAlert = {
  id: number;
  type: "urgent" | "warning" | "info" | "success";
  title: string;
  message: string;
  patientName?: string;
  createdAt: string;
};

export async function getAlerts(): Promise<{ data: DoctorAlert[] }> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const data: DoctorAlert[] = [
    {
      id: 1,
      type: "urgent",
      title: "Beta positiva",
      message: "Confirmar con ecografía",
      patientName: "Laura Fernández",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      type: "warning",
      title: "Monitoreo pendiente",
      message: "Programar día 12 de estimulación",
      patientName: "Ana Martínez",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      type: "info",
      title: "Resultados listos",
      message: "Estudios hormonales completos",
      patientName: "María González",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 4,
      type: "warning",
      title: "Consentimiento pendiente",
      message: "Firma de documentación requerida",
      patientName: "Carolina Pérez",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 5,
      type: "success",
      title: "PGT completado",
      message: "2 embriones euploides disponibles",
      patientName: "Sofía Rodríguez",
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 6,
      type: "info",
      title: "Turno por definir",
      message: "Programar transferencia",
      patientName: "Valeria López",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];

  console.log("[DOCTOR] GET Alerts:", data.length, "alerts");

  return { data };
}
