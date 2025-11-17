"use client";

import { Habits } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Edit, Cigarette, Beer, Pill } from "lucide-react";
import { useState } from "react";
import { HabitsFormSheet } from "../forms/habits-form-sheet";

interface HabitsCardProps {
  habits?: Habits | null;
  medicalHistoryId: number;
  onUpdate: () => void;
}

export function HabitsCard({
  habits,
  medicalHistoryId,
  onUpdate,
}: HabitsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="border-2 border-orange-500/50">
        <CardHeader className="bg-orange-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Beer className="h-5 w-5 text-orange-600" />
              HÁBITOS Y FACTORES DE RIESGO
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!habits ? (
            <p className="text-sm text-muted-foreground italic">
              No hay información registrada
            </p>
          ) : (
            <div className="space-y-3">
              {/* Tabaquismo */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Cigarette className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold">TABAQUISMO:</span>
                </div>
                <p className="text-sm ml-6">
                  {habits.cigarettesPerDay && habits.cigarettesPerDay > 0
                    ? `¿Fuma? Sí ${habits.cigarettesPerDay > 0 ? "☑" : "☐"} No ${habits.cigarettesPerDay === 0 ? "☑" : "☐"}`
                    : "¿Fuma? Sí ☐ No ☑"}
                </p>
                {habits.cigarettesPerDay !== null &&
                  habits.cigarettesPerDay > 0 && (
                    <p className="text-sm ml-6">
                      Pack-Días: [Cigarrillos/día x años ={" "}
                      {habits.packDaysValue || 0}] = [
                      {habits.cigarettesPerDay || 0} x{" "}
                      {habits.yearsSmoking || 0}]
                    </p>
                  )}
              </div>

              {/* Consumo de Alcohol */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Beer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold">
                    CONSUMO DE ALCOHOL:
                  </span>
                </div>
                <p className="text-sm ml-6">
                  Frecuencia:{" "}
                  {habits.alcoholConsumption || "Nunca/Ocasional/Frecuente"}
                </p>
              </div>

              {/* Drogas Recreativas */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold">
                    DROGAS RECREATIVAS:
                  </span>
                </div>
                <p className="text-sm ml-6">
                  {habits.recreationalDrugs || "Ninguna"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <HabitsFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        habits={habits}
        medicalHistoryId={medicalHistoryId}
        onSuccess={() => {
          onUpdate();
          setIsOpen(false);
        }}
      />
    </>
  );
}
