"use client";

import { Background, BackgroundType } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Edit, FileText, Scissors } from "lucide-react";
import { useState } from "react";
import { BackgroundsFormSheet } from "../forms/backgrounds-form-sheet";

interface BackgroundsCardProps {
  backgrounds?: Background[];
  medicalHistoryId: number;
  onUpdate: () => void;
}

export function BackgroundsCard({
  backgrounds,
  medicalHistoryId,
  onUpdate,
}: BackgroundsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const clinicalBackgrounds = backgrounds?.filter(
    (b) => b.backgroundType === BackgroundType.CLINICAL
  );
  const surgicalBackgrounds = backgrounds?.filter(
    (b) => b.backgroundType === BackgroundType.SURGICAL
  );

  return (
    <>
      <Card className="border-2 border-purple-500/50">
        <CardHeader className="bg-purple-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              ANTECEDENTES CLÍNICOS Y QUIRÚRGICOS
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Antecedentes Clínicos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold">
                  🔴 ANTECEDENTES CLÍNICOS (SNOMED/Fire):
                </span>
              </div>
              {!clinicalBackgrounds || clinicalBackgrounds.length === 0 ? (
                <p className="text-sm ml-6 italic text-muted-foreground">
                  [Campo autocompletado]
                </p>
              ) : (
                <div className="ml-6 space-y-1">
                  <p className="text-sm">Términos seleccionados:</p>
                  <ul className="list-disc list-inside text-sm">
                    {clinicalBackgrounds.map((bg) => (
                      <li key={bg.id}>{bg.termCode}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Antecedentes Quirúrgicos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold">
                  🟣 ANTECEDENTES QUIRÚRGICOS:
                </span>
              </div>
              {!surgicalBackgrounds || surgicalBackgrounds.length === 0 ? (
                <p className="text-sm ml-6 italic text-muted-foreground">
                  [Campo libre para descripción]
                </p>
              ) : (
                <div className="ml-6 space-y-1">
                  <p className="text-sm">Términos seleccionados:</p>
                  <ul className="list-disc list-inside text-sm">
                    {surgicalBackgrounds.map((bg) => (
                      <li key={bg.id}>
                        • {bg.termCode}
                        {bg.createdAt && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({new Date(bg.createdAt).getFullYear()})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <BackgroundsFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        backgrounds={backgrounds || []}
        medicalHistoryId={medicalHistoryId}
        onSuccess={() => {
          onUpdate();
          setIsOpen(false);
        }}
      />
    </>
  );
}
