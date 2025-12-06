"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import moment from "moment";

interface Appointment {
  id: number;
  date: string;
  time: string;
  type: string;
  doctor: string;
  operatingRoom: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white text-center">
          PRÓXIMOS TURNOS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between gap-4 p-4 bg-white rounded border border-gray-300"
            >
              <div className="flex items-center gap-4 flex-1">
                <Checkbox />
                <div className="text-sm text-gray-900">
                  <div className="font-semibold mb-1">
                    {moment.utc(appointment.date).format("dddd LL")} -{" "}
                    {appointment.time} hs
                  </div>
                  <div>
                    {appointment.type} - {appointment.doctor}{" "}
                    {appointment.operatingRoom
                      ? `- Sala: ${appointment.operatingRoom}`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Modificar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-rose-400 hover:bg-rose-500"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
