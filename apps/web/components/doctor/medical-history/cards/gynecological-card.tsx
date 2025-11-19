"use client";

import { GynecologicalHistory } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Edit, Heart } from "lucide-react";
import { useState } from "react";
import { GynecologicalFormSheet } from "../forms/gynecological-form-sheet";

interface GynecologicalCardProps {
  gynecologicalHistory?: GynecologicalHistory | null;
  medicalHistoryId: number;
  partnerDataId?: number | null;
  onUpdate: () => void;
}

export function GynecologicalCard({
  gynecologicalHistory,
  medicalHistoryId,
  partnerDataId,
  onUpdate,
}: GynecologicalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="border-2 border-cyan-500/50">
        <CardHeader className="bg-cyan-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-cyan-600" />
              ANTECEDENTES GINECOLÓGICOS
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!gynecologicalHistory ? (
            <p className="text-sm text-muted-foreground italic">
              No hay información registrada
            </p>
          ) : (
            <div className="space-y-3">
              {/* Menarca */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">🔴 MENARCA: Edad [#] años</span>
                </div>
                <p className="text-sm ml-6">
                  Edad: {gynecologicalHistory.menarcheAge || "N/A"} años
                </p>
              </div>

              {/* Ciclos Menstruales */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">
                    🔵 CICLOS MENSTRUALES:
                  </span>
                </div>
                <p className="text-sm ml-6">
                  Regularidad: [
                  {gynecologicalHistory.cycleRegularity || "Normal, sin coágulos"}]
                </p>
                <p className="text-sm ml-6">
                  Duración: [{gynecologicalHistory.cycleDurationDays || "28"}] días
                </p>
                <p className="text-sm ml-6">
                  Características sangrado: [{gynecologicalHistory.bleedingCharacteristics || "Normal, sin coágulos"}]
                </p>
              </div>

              {/* Historial Obstétrico */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">
                    🟢 HISTORIAL OBSTÉTRICO:
                  </span>
                </div>
                <p className="text-sm ml-6">
                  G (Embarazos): [{gynecologicalHistory.gestations || "2"}] P
                  (Partos): [{gynecologicalHistory.births || "1"}]
                </p>
                <p className="text-sm ml-6">
                  AB (Abortos): [{gynecologicalHistory.abortions || "1"}] ST
                  (Ectópicos): [{gynecologicalHistory.ectopicPregnancies || "0"}]
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GynecologicalFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        gynecologicalHistory={gynecologicalHistory}
        medicalHistoryId={medicalHistoryId}
        partnerDataId={partnerDataId}
        onSuccess={() => {
          onUpdate();
          setIsOpen(false);
        }}
      />
    </>
  );
}
