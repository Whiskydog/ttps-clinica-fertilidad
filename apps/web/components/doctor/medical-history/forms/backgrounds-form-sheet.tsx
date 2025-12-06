"use client";

import { useState } from "react";
import { Background, BackgroundType } from "@repo/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { X } from "lucide-react";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { createBackground } from "@/app/actions/doctor/medical-history/create-background";
import { deleteBackground } from "@/app/actions/doctor/medical-history/delete-background";
import { MedicalTermSelector } from "../medical-term-selector";

interface BackgroundsFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backgrounds: Background[];
  medicalHistoryId: number;
  onSuccess: () => void;
}

export function BackgroundsFormSheet({
  open,
  onOpenChange,
  backgrounds,
  medicalHistoryId,
  onSuccess,
}: BackgroundsFormSheetProps) {
  const queryClient = useQueryClient();

  const clinicalBg = backgrounds.filter(
    (b) => b.backgroundType === BackgroundType.CLINICAL
  );
  const surgicalBg = backgrounds.filter(
    (b) => b.backgroundType === BackgroundType.SURGICAL
  );

  const [clinicalTerms, setClinicalTerms] = useState<
    Array<{ id?: number; term: string }>
  >(clinicalBg.map((b) => ({ id: b.id, term: b.termCode || "" })));

  const [surgicalTerms, setSurgicalTerms] = useState<
    Array<{ id?: number; term: string }>
  >(surgicalBg.map((b) => ({ id: b.id, term: b.termCode || "" })));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClinical = (term: string) => {
    // Evitar duplicados
    if (!clinicalTerms.some((t) => t.term === term)) {
      setClinicalTerms([...clinicalTerms, { term }]);
    }
  };

  const handleAddSurgical = (term: string) => {
    // Evitar duplicados
    if (!surgicalTerms.some((t) => t.term === term)) {
      setSurgicalTerms([...surgicalTerms, { term }]);
    }
  };

  const handleRemoveClinical = (index: number) => {
    setClinicalTerms(clinicalTerms.filter((_, i) => i !== index));
  };

  const handleRemoveSurgical = (index: number) => {
    setSurgicalTerms(surgicalTerms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Delete removed backgrounds
      const existingClinicalIds = clinicalBg.map((b) => b.id);
      const currentClinicalIds = clinicalTerms
        .filter((t) => t.id)
        .map((t) => t.id as number);
      const clinicalToDelete = existingClinicalIds.filter(
        (id) => !currentClinicalIds.includes(id)
      );

      const existingSurgicalIds = surgicalBg.map((b) => b.id);
      const currentSurgicalIds = surgicalTerms
        .filter((t) => t.id)
        .map((t) => t.id as number);
      const surgicalToDelete = existingSurgicalIds.filter(
        (id) => !currentSurgicalIds.includes(id)
      );

      // Delete backgrounds
      for (const id of [...clinicalToDelete, ...surgicalToDelete]) {
        const result = await deleteBackground(id);
        if (!result.success) {
          toast.error(`Error al eliminar: ${result.error}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Create new backgrounds
      const newClinicalTerms = clinicalTerms.filter((t) => !t.id);
      for (const term of newClinicalTerms) {
        const result = await createBackground({
          medicalHistoryId,
          termCode: term.term,
          backgroundType: BackgroundType.CLINICAL,
        });
        if (!result.success) {
          toast.error(`Error al crear antecedente clínico: ${result.error}`);
          setIsSubmitting(false);
          return;
        }
      }

      const newSurgicalTerms = surgicalTerms.filter((t) => !t.id);
      for (const term of newSurgicalTerms) {
        const result = await createBackground({
          medicalHistoryId,
          termCode: term.term,
          backgroundType: BackgroundType.SURGICAL,
        });
        if (!result.success) {
          toast.error(`Error al crear antecedente quirúrgico: ${result.error}`);
          setIsSubmitting(false);
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
      toast.success("Antecedentes guardados correctamente");
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar antecedentes"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Antecedentes Clínicos y Quirúrgicos</SheetTitle>
          <SheetDescription>
            Actualiza los antecedentes médicos del paciente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Antecedentes Clínicos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              ANTECEDENTES CLÍNICOS (SNOMED/FHIR)
            </h3>

            <div className="space-y-2">
              <Label>Buscar y agregar término estandarizado</Label>
              <MedicalTermSelector
                onSelect={handleAddClinical}
                placeholder="Buscar antecedente clínico..."
                disabled={isSubmitting}
              />
            </div>

            {clinicalTerms.length > 0 && (
              <div className="space-y-2">
                <Label>Términos agregados:</Label>
                <div className="flex flex-wrap gap-2">
                  {clinicalTerms.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {item.term}
                      <button
                        type="button"
                        onClick={() => handleRemoveClinical(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Antecedentes Quirúrgicos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              ANTECEDENTES QUIRÚRGICOS (SNOMED/FHIR)
            </h3>

            <div className="space-y-2">
              <Label>Buscar y agregar procedimiento estandarizado</Label>
              <MedicalTermSelector
                onSelect={handleAddSurgical}
                placeholder="Buscar procedimiento quirúrgico..."
                disabled={isSubmitting}
              />
            </div>

            {surgicalTerms.length > 0 && (
              <div className="space-y-2">
                <Label>Procedimientos agregados:</Label>
                <div className="flex flex-wrap gap-2">
                  {surgicalTerms.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {item.term}
                      <button
                        type="button"
                        onClick={() => handleRemoveSurgical(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
