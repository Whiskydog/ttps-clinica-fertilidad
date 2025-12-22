"use client";

import type { Treatment } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { motion } from "motion/react";
import Link from "next/link";

interface TreatmentHistoryProps {
  treatments: Treatment[];
}

export function TreatmentHistory({ treatments }: TreatmentHistoryProps) {
  if (!treatments || treatments.length === 0) {
    return (
      <motion.div layout="position">
        <Card className="bg-purple-200 border-none">
          <CardHeader>
            <CardTitle>Historial Tratamientos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">No tienes tratamientos anteriores.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div layout="position">
      <Card className="bg-purple-200 border-none">
        <CardHeader>
          <CardTitle>Historial Tratamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div layout="position" className="space-y-3">
            {treatments.map((treatment) => {
              const period =
                treatment.startDate && treatment.closureDate
                  ? `${new Date(treatment.startDate).toLocaleDateString("es-AR")} - ${new Date(treatment.closureDate).toLocaleDateString("es-AR")}`
                  : treatment.startDate
                    ? `Desde ${new Date(treatment.startDate).toLocaleDateString("es-AR")}`
                    : "Sin especificar";

              return (
                <div
                  key={treatment.id}
                  className="bg-black text-white p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      Tratamiento #{treatment.id} -{" "}
                      {treatment.status.toUpperCase()}
                    </p>
                    {treatment.initialObjective && (
                      <p className="text-sm">
                        Tipo: {treatment.initialObjective}
                      </p>
                    )}
                    {treatment.initialDoctor && (
                      <p className="text-sm">
                        Médico: Dr. {treatment.initialDoctor.firstName}{" "}
                        {treatment.initialDoctor.lastName}
                      </p>
                    )}
                    <p className="text-sm">Período: {period}</p>
                  </div>
                  <Link href={`/patient/treatment/${treatment.id}`}>
                    <Button variant="secondary" size="sm">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
