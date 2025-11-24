"use server";

export type TodayAppointment = {
  id: number;
  time: string;
  patientName: string;
  type: string;
  status: "pending" | "confirmed" | "completed";
};

export async function getTodayAppointments(): Promise<{
  data: TodayAppointment[];
}> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const data: TodayAppointment[] = [
    {
      id: 1,
      time: "09:00",
      patientName: "María González",
      type: "Primera consulta",
      status: "confirmed",
    },
    {
      id: 2,
      time: "09:30",
      patientName: "Ana Martínez",
      type: "Monitoreo día 7",
      status: "confirmed",
    },
    {
      id: 3,
      time: "10:00",
      patientName: "Laura Fernández",
      type: "Revisión resultados",
      status: "pending",
    },
    {
      id: 4,
      time: "10:30",
      patientName: "Carolina Pérez",
      type: "Transferencia",
      status: "confirmed",
    },
    {
      id: 5,
      time: "11:00",
      patientName: "Sofía Rodríguez",
      type: "Control post-Beta",
      status: "pending",
    },
    {
      id: 6,
      time: "11:30",
      patientName: "Valeria López",
      type: "Monitoreo día 10",
      status: "confirmed",
    },
  ];

  console.log("[DOCTOR] GET Today Appointments:", data.length, "appointments");

  return { data };
}
