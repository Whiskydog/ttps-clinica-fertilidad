import { Fenotype } from "@repo/contracts";

interface FenotypeSectionProps {
  fenotypes: Fenotype[];
}

export function FenotypeSection({ fenotypes }: FenotypeSectionProps) {
  if (!fenotypes || fenotypes.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="section-title">Información Fenotípica</h3>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            No hay información fenotípica registrada
          </p>
        </div>
      </div>
    );
  }

  // Separar fenotipos del paciente y de la pareja
  const patientFenotypes = fenotypes.filter((f) => !f.partnerDataId);
  const partnerFenotypes = fenotypes.filter((f) => f.partnerDataId);

  return (
    <div className="mb-4">
      <h3 className="section-title">Información Fenotípica</h3>

      {/* Fenotipos del Paciente */}
      {patientFenotypes.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-pink-50 border border-pink-200">
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
                  <strong>Color de ojos:</strong> {fenotype.eyeColor ?? "-"}
                </div>
                <div>
                  <strong>Color de cabello:</strong> {fenotype.hairColor ?? "-"}
                </div>
                <div>
                  <strong>Tipo de cabello:</strong> {fenotype.hairType ?? "-"}
                </div>
                <div>
                  <strong>Altura:</strong>{" "}
                  {fenotype.height ? `${fenotype.height} cm` : "-"}
                </div>
                <div>
                  <strong>Complexión:</strong> {fenotype.complexion ?? "-"}
                </div>
                <div>
                  <strong>Etnia:</strong> {fenotype.ethnicity ?? "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fenotipos de la Pareja (ROPA) */}
      {partnerFenotypes.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
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
                  <strong>Color de ojos:</strong> {fenotype.eyeColor ?? "-"}
                </div>
                <div>
                  <strong>Color de cabello:</strong> {fenotype.hairColor ?? "-"}
                </div>
                <div>
                  <strong>Tipo de cabello:</strong> {fenotype.hairType ?? "-"}
                </div>
                <div>
                  <strong>Altura:</strong>{" "}
                  {fenotype.height ? `${fenotype.height} cm` : "-"}
                </div>
                <div>
                  <strong>Complexión:</strong> {fenotype.complexion ?? "-"}
                </div>
                <div>
                  <strong>Etnia:</strong> {fenotype.ethnicity ?? "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
