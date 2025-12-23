import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { RecentTreatment } from "@repo/contracts";

interface RecentTreatmentsProps {
  treatments: RecentTreatment[];
}

export function RecentTreatments({ treatments }: RecentTreatmentsProps) {
  const statusColors: Record<string, string> = {
    "Estimulación": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Resultados": "bg-blue-100 text-blue-800 border-blue-300",
    "Transferencia": "bg-purple-100 text-purple-800 border-purple-300",
    "Punción": "bg-orange-100 text-orange-800 border-orange-300",
    "Completado": "bg-green-100 text-green-800 border-green-300",
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tratamientos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay tratamientos recientes
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{treatment.patientName}</p>
                    <Badge
                      variant="outline"
                      className={
                        statusColors[treatment.status] || "bg-gray-100"
                      }
                    >
                      {treatment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {treatment.lastMovement}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(treatment.lastMovementDate)}
                  </p>
                </div>
                <Link href={`/doctor/patients/${treatment.patientId}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
