import { Card, CardContent } from "@repo/ui/card";
import { Users, Calendar, Activity, FileText } from "lucide-react";
import type { DashboardKPIs } from "@/app/actions/doctor/dashboard/get-kpis";

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: "PACIENTES ACTIVOS",
      value: kpis.activePatients,
      subtitle: "en tratamiento",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "TURNOS HOY",
      value: kpis.todayAppointments,
      subtitle: "consultas programadas",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "MONITOREOS",
      value: kpis.activeMonitorings,
      subtitle: "estimulaciones activas",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "PENDIENTES",
      value: kpis.pendingResults,
      subtitle: "resultados por revisar",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold mb-1">{card.value}</h3>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
