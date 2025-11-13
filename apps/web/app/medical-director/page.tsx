import Link from "next/link";
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  Stethoscope,
  BarChart3,
} from "lucide-react";

export default function MedicalDirectorDashboard() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          Dashboard Director Médico
        </h1>
        <p className="text-muted mt-1">
          Panel de control ejecutivo. Supervisa operaciones médicas, calidad y
          rendimiento institucional.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Pacientes Atendidos
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Tasa de Éxito
                </p>
                <p className="text-2xl font-bold text-foreground">0%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Reportes Médicos
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
                <p className="text-small text-muted-foreground">
                  Citas Programadas
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medical Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Gestión Médica</h2>
            <p className="text-small text-muted-foreground">
              Supervisión y control de actividades médicas
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/medical-director/patients"
                className="btn-primary justify-start h-auto p-4"
              >
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Pacientes</div>
                  <div className="text-sm opacity-90">
                    Vista general de pacientes
                  </div>
                </div>
              </Link>

              <Link
                href="/medical-director/reports"
                className="btn-secondary justify-start h-auto p-4"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Reportes Clínicos</div>
                  <div className="text-sm opacity-90">
                    Análisis y estadísticas
                  </div>
                </div>
              </Link>

              <Link
                href="/medical-director/quality"
                className="btn-secondary justify-start h-auto p-4"
              >
                <Activity className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Control de Calidad</div>
                  <div className="text-sm opacity-90">
                    Monitoreo de estándares
                  </div>
                </div>
              </Link>

              <Link
                href="/medical-director/protocols"
                className="btn-secondary justify-start h-auto p-4"
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Protocolos</div>
                  <div className="text-sm opacity-90">
                    Guías y procedimientos
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Indicadores Clave</h2>
            <p className="text-small text-muted-foreground">
              Métricas importantes para la toma de decisiones
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">
                    Satisfacción Pacientes
                  </p>
                  <p className="text-sm text-blue-600">Promedio de encuestas</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-800">0%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Tiempo de Espera</p>
                  <p className="text-sm text-green-600">Promedio de consulta</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-800">0 min</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-medium text-purple-800">Casos Resueltos</p>
                  <p className="text-sm text-purple-600">Este mes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="text-heading-3">Iniciativas Estratégicas</h2>
          <p className="text-small text-muted-foreground">
            Objetivos y proyectos prioritarios para el desarrollo institucional
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2">Mejora Continua</h3>
              <p className="text-small text-muted-foreground">
                Implementar procesos de mejora basados en evidencia
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2">Innovación Tecnológica</h3>
              <p className="text-small text-muted-foreground">
                Adoptar nuevas tecnologías para mejorar la atención
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2">Desarrollo Profesional</h3>
              <p className="text-small text-muted-foreground">
                Capacitación continua del personal médico
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
