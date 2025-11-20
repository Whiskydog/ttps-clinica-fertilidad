"use client";

import { Fenotype } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Edit, User } from "lucide-react";
import { useState } from "react";
import { PhysicalExamFormSheet } from "../forms/physical-exam-form-sheet";

interface PhysicalExamCardProps {
  fenotype?: Fenotype | null;
  physicalExamNotes?: string | null;
  medicalHistoryId: number;
  onUpdate: () => void;
}

export function PhysicalExamCard({
  fenotype,
  physicalExamNotes,
  medicalHistoryId,
  onUpdate,
}: PhysicalExamCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="border-2 border-gray-500/50">
        <CardHeader className="bg-gray-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              EXAMEN FÍSICO Y FENOTIPO
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Examen Físico */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">👤 EXAMEN FÍSICO:</span>
              </div>
              <p className="text-sm ml-6">{physicalExamNotes || "N/A"}</p>
            </div>

            {/* Fenotipo */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">
                  🧬 FENOTIPO (para compatibilidad donantes):
                </span>
              </div>
              {!fenotype ? (
                <p className="text-sm ml-6 italic text-muted-foreground">
                  No hay información registrada
                </p>
              ) : (
                <div className="ml-6 space-y-1 text-sm">
                  <p>Color ojos: {fenotype.eyeColor || "Marrones"}</p>
                  <p>Color pelo: {fenotype.hairColor || "Castaño oscuro"}</p>
                  <p>Tipo pelo: {fenotype.hairType || "Liso"}</p>
                  <p>Altura: {fenotype.height || "165"}cm</p>
                  <p>Complexión: {fenotype.complexion || "Media"}</p>
                  <p>Rasgos étnicos: {fenotype.ethnicity || "Caucásica"}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {fenotype && (
        <PhysicalExamFormSheet
          open={isOpen}
          onOpenChange={setIsOpen}
          fenotype={fenotype}
          physicalExamNotes={physicalExamNotes}
          medicalHistoryId={medicalHistoryId}
          onSuccess={() => {
            onUpdate();
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
