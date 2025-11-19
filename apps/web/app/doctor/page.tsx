"use client";

import { useQuery } from "@tanstack/react-query";
import { getKPIs } from "@/app/actions/doctor/dashboard/get-kpis";
import { getTodayAppointments } from "@/app/actions/doctor/dashboard/get-today-appointments";
import { getAlerts } from "@/app/actions/doctor/dashboard/get-alerts";
import { getMonthlyStats } from "@/app/actions/doctor/dashboard/get-monthly-stats";
import { getRecentTreatments } from "@/app/actions/doctor/dashboard/get-recent-treatments";
import { KPICards } from "@/components/doctor/dashboard/kpi-cards";
import { DailyAgenda } from "@/components/doctor/dashboard/daily-agenda";
import { AlertsPanel } from "@/components/doctor/dashboard/alerts-panel";
import { MonthlyStatsPanel } from "@/components/doctor/dashboard/monthly-stats";
import { QuickActions } from "@/components/doctor/dashboard/quick-actions";
import { RecentTreatments } from "@/components/doctor/dashboard/recent-treatments";

export default function DoctorDashboard() {
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ["doctor-kpis"],
    queryFn: () => getKPIs(),
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["doctor-today-appointments"],
    queryFn: () => getTodayAppointments(),
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["doctor-alerts"],
    queryFn: () => getAlerts(),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["doctor-monthly-stats"],
    queryFn: () => getMonthlyStats(),
  });

  const { data: treatmentsData, isLoading: treatmentsLoading } = useQuery({
    queryKey: ["doctor-recent-treatments"],
    queryFn: () => getRecentTreatments(),
  });

  const isLoading =
    kpisLoading ||
    appointmentsLoading ||
    alertsLoading ||
    statsLoading ||
    treatmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Médico</h1>
        <p className="text-muted-foreground">
          Resumen de tu actividad y pacientes
        </p>
      </div>

      {/* KPIs */}
      {kpisData?.data && <KPICards kpis={kpisData.data} />}

      {/* Accesos Rápidos */}
      <QuickActions />

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda del Día */}
        {appointmentsData?.data && (
          <DailyAgenda appointments={appointmentsData.data} />
        )}

        {/* Alertas */}
        {alertsData?.data && <AlertsPanel alerts={alertsData.data} />}
      </div>

      {/* Estadísticas del Mes */}
      {statsData?.data && <MonthlyStatsPanel stats={statsData.data} />}

      {/* Tratamientos Recientes */}
      {treatmentsData?.data && (
        <RecentTreatments treatments={treatmentsData.data} />
      )}
    </div>
  );
}
