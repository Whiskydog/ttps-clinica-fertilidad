import Link from "next/link";
import {
  TestTube,
  FileText,
  TrendingUp,
  Activity,
  Microscope,
} from "lucide-react";

export default function LabTechnicianDashboard() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Microscope className="h-8 w-8 text-blue-600" />
          </div>
          Dashboard Técnico de Laboratorio
        </h1>
        <p className="text-muted mt-1">
          Panel de control para técnicos de laboratorio. Gestiona análisis,
          resultados y procedimientos.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Análisis Pendientes
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">Análisis Hoy</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Resultados Listos
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">Eficiencia</p>
                <p className="text-2xl font-bold text-foreground">0%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Laboratory Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Gestión de Laboratorio</h2>
            <p className="text-small text-muted-foreground">
              Funciones principales del laboratorio clínico
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/laboratory-technician/tests"
                className="btn-primary justify-start h-auto p-4"
              >
                <TestTube className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Análisis Clínicos</div>
                  <div className="text-sm opacity-90">
                    Gestiona pruebas de laboratorio
                  </div>
                </div>
              </Link>

              <Link
                href="/laboratory-technician/results"
                className="btn-secondary justify-start h-auto p-4"
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Resultados</div>
                  <div className="text-sm opacity-90">
                    Registra y valida resultados
                  </div>
                </div>
              </Link>

              <Link
                href="/laboratory-technician/equipment"
                className="btn-secondary justify-start h-auto p-4"
              >
                <Microscope className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Equipos</div>
                  <div className="text-sm opacity-90">
                    Mantenimiento y calibración
                  </div>
                </div>
              </Link>

              <Link
                href="/laboratory-technician/reports"
                className="btn-secondary justify-start h-auto p-4"
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Reportes</div>
                  <div className="text-sm opacity-90">
                    Estadísticas de laboratorio
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Actividad Reciente</h2>
            <p className="text-small text-muted-foreground">
              Últimos análisis y procedimientos realizados
            </p>
          </div>
          <div className="card-content">
            <div className="empty-state py-8">
              <div className="empty-state-icon">
                <TestTube className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="empty-state-title">Sin actividad reciente</h3>
              <p className="empty-state-description">
                Comienza realizando análisis clínicos para ver tu actividad
                aquí.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Laboratory Guidelines */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="text-heading-3">Protocolos de Laboratorio</h2>
          <p className="text-small text-muted-foreground">
            Guías y procedimientos estándar para el trabajo en laboratorio
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2">Verificación de Muestras</h3>
              <p className="text-small text-muted-foreground">
                Confirma la integridad y correcta identificación de las muestras
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2">Control de Calidad</h3>
              <p className="text-small text-muted-foreground">
                Realiza controles de calidad antes de procesar muestras
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2">Validación de Resultados</h3>
              <p className="text-small text-muted-foreground">
                Verifica y valida todos los resultados antes de liberar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
