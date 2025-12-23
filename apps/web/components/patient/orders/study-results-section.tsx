import { StudyResult } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { getFileUrl } from "@/lib/upload-utils";

interface StudyResultsSectionProps {
  studyResults: StudyResult[];
}

export function StudyResultsSection({ studyResults }: StudyResultsSectionProps) {
  if (!studyResults || studyResults.length === 0) {
    return (
      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">RESULTADOS DE ESTUDIOS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">
            No hay resultados de estudios disponibles aún
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">RESULTADOS DE ESTUDIOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {studyResults.map((result) => (
            <div
              key={result.id}
              className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-base">
                    {result.studyName || "Estudio sin nombre"}
                  </h4>
                </div>
                {result.originalPdfUri && (
                  <a
                    href={getFileUrl(result.originalPdfUri) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </Button>
                  </a>
                )}
              </div>

              {result.determinationName && (
                <p className="text-sm mb-2">
                  <span className="font-semibold">Determinación:</span>{" "}
                  {result.determinationName}
                </p>
              )}

              {result.transcription && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-semibold mb-1">Transcripción:</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {result.transcription}
                  </p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                {result.transcriptionDate && (
                  <span>
                    Transcrito el:{" "}
                    {new Date(result.transcriptionDate).toLocaleDateString(
                      "es-AR"
                    )}
                  </span>
                )}
                {result.transcribedByLabTechnician && (
                  <span>
                    Por:{" "}
                    {result.transcribedByLabTechnician.firstName}{" "}
                    {result.transcribedByLabTechnician.lastName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
