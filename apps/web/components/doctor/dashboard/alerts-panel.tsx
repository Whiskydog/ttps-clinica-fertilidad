import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Bell,
} from "lucide-react";
import { DoctorAlert } from "@repo/contracts";


interface AlertsPanelProps {
  alerts: DoctorAlert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const alertConfig = {
    urgent: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      label: "URGENTE",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: "ADVERTENCIA",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      label: "INFO",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      badgeColor: "bg-green-100 text-green-800 border-green-300",
      label: "COMPLETADO",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas y Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay alertas pendientes
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${config.textColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.badgeColor}`}
                      >
                        {config.label}
                      </Badge>
                      <p className="font-semibold text-sm">{alert.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                    {alert.patientName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paciente: {alert.patientName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
