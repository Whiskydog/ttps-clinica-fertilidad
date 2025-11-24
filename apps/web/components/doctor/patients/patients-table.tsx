import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth?: string;
}

interface PatientsTableProps {
  patients: Patient[];
}

// Función helper para calcular edad
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Función helper para generar datos fake consistentes basados en ID
function getFakeDataForPatient(id: number) {
  const objectives = [
    "Gametos propios",
    "Donación de óvulos",
    "Método ROPA",
    "Preservación",
  ];
  const statuses = ["Vigente", "Estimulación", "Completado", "Transferencia"];
  const movements = [
    "Monitoreo día 7",
    "Estudios completados",
    "Beta positiva",
    "Inicio de protocolo",
    "Transferencia programada",
  ];

  return {
    objective: objectives[id % objectives.length],
    status: statuses[id % statuses.length],
    lastMovement: movements[id % movements.length],
  };
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const statusColors: Record<string, string> = {
    Vigente: "bg-green-100 text-green-800 border-green-300",
    Estimulación: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Completado: "bg-gray-100 text-gray-800 border-gray-300",
    Transferencia: "bg-purple-100 text-purple-800 border-purple-300",
    Cerrado: "bg-red-100 text-red-800 border-red-300",
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No se encontraron pacientes</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wider">
                PACIENTE
              </th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wider">
                DNI
              </th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wider">
                EDAD
              </th>
              <th className="w-fit text-right p-3 text-xs font-bold uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map((patient) => {
              const fakeData = getFakeDataForPatient(patient.id);
              const age = patient.dateOfBirth
                ? calculateAge(patient.dateOfBirth)
                : null;

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-sm">
                    {patient.dni}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {age ? `${age} años` : "N/A"}
                  </td>
                  <td className="p-3 w-fit">
                    <div className="flex justify-end gap-2">
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link
                        href={`/doctor/patients/${patient.id}/medical-history`}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
