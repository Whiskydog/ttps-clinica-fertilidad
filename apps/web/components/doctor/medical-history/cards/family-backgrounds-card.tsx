"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Edit, Users } from "lucide-react";
import { useState } from "react";
import { FamilyBackgroundsFormSheet } from "../forms/family-backgrounds-form-sheet";

interface FamilyBackgroundsCardProps {
  familyBackgrounds?: string | null;
  medicalHistoryId: number;
  onUpdate: () => void;
}

export function FamilyBackgroundsCard({
  familyBackgrounds,
  medicalHistoryId,
  onUpdate,
}: FamilyBackgroundsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="border-2 border-pink-500/50">
        <CardHeader className="bg-pink-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-600" />
              ANTECEDENTES FAMILIARES
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Antecedentes Familiares */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">
                  🧑‍🧑‍🧒 ANTECEDENTES FAMILIARES:
                </span>
              </div>
              {!familyBackgrounds ? (
                <p className="text-sm ml-6 italic text-muted-foreground">
                  [Campo libre para descripción]
                </p>
              ) : (
                <div className="ml-6 space-y-2 text-sm">
                  <p>{familyBackgrounds}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <FamilyBackgroundsFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        familyBackgrounds={familyBackgrounds}
        medicalHistoryId={medicalHistoryId}
        onSuccess={() => {
          onUpdate();
          setIsOpen(false);
        }}
      />
    </>
  );
}
