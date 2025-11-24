"use client";

import { PartnerData } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Edit, Users, Heart } from "lucide-react";
import { useState } from "react";
import { PartnerDataFormSheet } from "../forms/partner-data-form-sheet";

interface PartnerDataCardProps {
  partnerData?: PartnerData | null;
  medicalHistoryId: number;
  onUpdate: () => void;
}

export function PartnerDataCard({
  partnerData,
  medicalHistoryId,
  onUpdate,
}: PartnerDataCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getBiologicalSexLabel = (sex: string) => {
    const labels: Record<string, string> = {
      male: "Masculino",
      female: "Femenino",
      intersex: "Intersex",
    };
    return labels[sex] || sex;
  };

  return (
    <>
      <Card className="border-2 border-purple-500/50">
        <CardHeader className="bg-purple-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              DATOS DE LA PAREJA
              {partnerData?.biologicalSex === "female" && (
                <Badge variant="secondary" className="ml-2">
                  <Heart className="h-3 w-3 mr-1" />
                  ROPA
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!partnerData ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                No hay información de pareja registrada
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
              >
                Agregar Datos de Pareja
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-semibold">
                    Nombre completo:
                  </span>
                  <p className="text-sm ml-2">
                    {partnerData.firstName} {partnerData.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold">DNI:</span>
                  <p className="text-sm ml-2">{partnerData.dni || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold">Sexo biológico:</span>
                  <p className="text-sm ml-2">
                    {getBiologicalSexLabel(partnerData.biologicalSex)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    Fecha de nacimiento:
                  </span>
                  <p className="text-sm ml-2">{partnerData.birthDate}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold">Ocupación:</span>
                  <p className="text-sm ml-2">
                    {partnerData.occupation || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold">Teléfono:</span>
                  <p className="text-sm ml-2">{partnerData.phone || "N/A"}</p>
                </div>
                {partnerData.email && (
                  <div className="col-span-2">
                    <span className="text-sm font-semibold">Email:</span>
                    <p className="text-sm ml-2">{partnerData.email}</p>
                  </div>
                )}
              </div>

              {/* Antecedentes genitales (solo para pareja masculina) */}
              {partnerData.biologicalSex === "male" &&
                partnerData.genitalBackgrounds && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm font-semibold">
                      Antecedentes genitales:
                    </span>
                    <p className="text-sm ml-2 mt-1 italic">
                      {partnerData.genitalBackgrounds}
                    </p>
                  </div>
                )}

              {/* Indicador ROPA */}
              {partnerData.biologicalSex === "female" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">
                      Caso ROPA (Recepción de Óvulos de la Pareja)
                    </span>
                  </div>
                  <p className="text-sm ml-6 text-muted-foreground mt-1">
                    Ver antecedentes ginecológicos en la sección correspondiente
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PartnerDataFormSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        partnerData={partnerData}
        medicalHistoryId={medicalHistoryId}
        onSuccess={() => {
          onUpdate();
          setIsOpen(false);
        }}
      />
    </>
  );
}
