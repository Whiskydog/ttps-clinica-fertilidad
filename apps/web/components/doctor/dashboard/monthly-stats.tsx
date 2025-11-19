import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { BarChart3 } from "lucide-react";
import type { MonthlyStats } from "@/app/actions/doctor/dashboard/get-monthly-stats";

interface MonthlyStatsProps {
  stats: MonthlyStats;
}

export function MonthlyStatsPanel({ stats }: MonthlyStatsProps) {
  const statsItems = [
    {
      label: "Tratamientos iniciados",
      value: stats.treatmentsStarted,
      showPercentage: false,
    },
    {
      label: "Procedimientos realizados",
      value: stats.proceduresPerformed,
      showPercentage: false,
    },
    {
      label: "Transferencias",
      value: stats.transfers,
      showPercentage: false,
    },
    {
      label: "Betas positivas",
      value: stats.positiveBetas,
      percentage: stats.positiveRate,
      showPercentage: true,
    },
    {
      label: "Embriones criopreservados",
      value: stats.cryoEmbryos,
      showPercentage: false,
    },
    {
      label: "Tasa de fecundación",
      value: `${stats.fecundationRate}%`,
      showPercentage: false,
      isPercentage: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas del Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statsItems.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {item.value}
                </p>
                {item.showPercentage && item.percentage !== undefined && (
                  <span className="text-sm font-semibold text-green-600">
                    ({item.percentage}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
