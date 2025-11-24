"use server";

export type DashboardKPIs = {
  activePatients: number;
  todayAppointments: number;
  activeMonitorings: number;
  pendingResults: number;
};

export async function getKPIs(): Promise<{ data: DashboardKPIs }> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const data: DashboardKPIs = {
    activePatients: 28,
    todayAppointments: 12,
    activeMonitorings: 8,
    pendingResults: 5,
  };

  console.log("[DOCTOR] GET KPIs:", data);

  return { data };
}
