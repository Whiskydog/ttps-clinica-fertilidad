import { Background, BackgroundType } from "@repo/contracts";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface BackgroundsSectionProps {
  backgrounds: Background[];
}

export function BackgroundsSection({ backgrounds }: BackgroundsSectionProps) {
  if (!backgrounds || backgrounds.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6 space-y-2">
          <h3 className="section-title">Antecedentes Médicos</h3>
          <p className="text-sm text-gray-600">
            No hay antecedentes médicos registrados
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar por tipo de antecedente
  const clinicalBackgrounds = backgrounds.filter(
    (b) => b.backgroundType === BackgroundType.CLINICAL
  );
  const surgicalBackgrounds = backgrounds.filter(
    (b) => b.backgroundType === BackgroundType.SURGICAL
  );

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="section-title">
          <CardTitle>Antecedentes Médicos</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Antecedentes Clínicos */}
          {clinicalBackgrounds.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Antecedentes Clínicos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {clinicalBackgrounds.map((background) => (
                    <Badge key={background.id}>{background.termCode}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Antecedentes quirúrgicos */}
          {surgicalBackgrounds.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Antecedentes Quirúrgicos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {surgicalBackgrounds.map((background) => (
                    <Badge key={background.id}>{background.termCode}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </>
  );
}
