import { Background, BackgroundType } from "@repo/contracts";

interface BackgroundsSectionProps {
  backgrounds: Background[];
}

export function BackgroundsSection({ backgrounds }: BackgroundsSectionProps) {
  if (!backgrounds || backgrounds.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="section-title">Antecedentes Médicos</h3>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            No hay antecedentes médicos registrados
          </p>
        </div>
      </div>
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
    <div className="mb-4">
      <h3 className="section-title">Antecedentes Médicos</h3>

      {/* Antecedentes Clínicos */}
      {clinicalBackgrounds.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-base">
            Antecedentes Clínicos
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Código/Término
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinicalBackgrounds.map((background) => (
                  <tr key={background.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {background.termCode}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      Clínico
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Antecedentes quirúrgicos */}
      {surgicalBackgrounds.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-base">
            Antecedentes quirúrgicos
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Código/Término
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {surgicalBackgrounds.map((background) => (
                  <tr key={background.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {background.termCode}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      quirúrgico
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
