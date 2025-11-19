import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Clock } from "lucide-react";
import type { TodayAppointment } from "@/app/actions/doctor/dashboard/get-today-appointments";

interface DailyAgendaProps {
  appointments: TodayAppointment[];
}

export function DailyAgenda({ appointments }: DailyAgendaProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
  };

  const statusLabels = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Agenda del Día
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay turnos programados para hoy
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                  <span className="text-lg font-bold text-primary">
                    {appointment.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {appointment.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.type}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[appointment.status]}
                >
                  {statusLabels[appointment.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
