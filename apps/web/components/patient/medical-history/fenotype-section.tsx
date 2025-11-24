import { Fenotype } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface FenotypeSectionProps {
  fenotypes: Fenotype[];
}

export function FenotypeSection({ fenotypes }: FenotypeSectionProps) {
  if (!fenotypes || fenotypes.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="section-title">
            Información Fenotípica
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-gray-600">
            No hay información fenotípica registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar fenotipos del paciente y de la pareja
  const patientFenotypes = fenotypes.filter((f) => !f.partnerDataId);
  const partnerFenotypes = fenotypes.filter((f) => f.partnerDataId);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="section-title">
            Información Fenotípica
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Fenotipos del Paciente */}
          {patientFenotypes.length > 0 && (
            <Card className="mb-4 bg-pink-50 border-pink-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-pink-700 mb-2 text-base">
                  Paciente
                </h4>
                {patientFenotypes.map((fenotype) => (
                  <div
                    key={fenotype.id}
                    className="mb-2 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                      <div>
                        <strong>Color de ojos:</strong>{" "}
                        {fenotype.eyeColor ?? "-"}
                      </div>
                      <div>
                        <strong>Color de cabello:</strong>{" "}
                        {fenotype.hairColor ?? "-"}
                      </div>
                      <div>
                        <strong>Tipo de cabello:</strong>{" "}
                        {fenotype.hairType ?? "-"}
                      </div>
                      <div>
                        <strong>Altura:</strong>{" "}
                        {fenotype.height ? `${fenotype.height} cm` : "-"}
                      </div>
                      <div>
                        <strong>Complexión:</strong>{" "}
                        {fenotype.complexion ?? "-"}
                      </div>
                      <div>
                        <strong>Etnia:</strong> {fenotype.ethnicity ?? "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {/* Fenotipos de la Pareja (ROPA) */}
          {partnerFenotypes.length > 0 && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-blue-700 mb-2 text-base">
                  Pareja (ROPA)
                </h4>
                {partnerFenotypes.map((fenotype) => (
                  <div
                    key={fenotype.id}
                    className="mb-2 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                      <div>
                        <strong>Color de ojos:</strong>{" "}
                        {fenotype.eyeColor ?? "-"}
                      </div>
                      <div>
                        <strong>Color de cabello:</strong>{" "}
                        {fenotype.hairColor ?? "-"}
                      </div>
                      <div>
                        <strong>Tipo de cabello:</strong>{" "}
                        {fenotype.hairType ?? "-"}
                      </div>
                      <div>
                        <strong>Altura:</strong>{" "}
                        {fenotype.height ? `${fenotype.height} cm` : "-"}
                      </div>
                      <div>
                        <strong>Complexión:</strong>{" "}
                        {fenotype.complexion ?? "-"}
                      </div>
                      <div>
                        <strong>Etnia:</strong> {fenotype.ethnicity ?? "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </>
  );
}
