'use client';

export default function PatientDashboard() {
  const user = {
    firstName: 'Paciente',
    lastName: 'Paciente',
    email: 'paciente@paciente.com',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">
          Bienvenido, {user?.firstName}
        </h2>
        <p className="text-gray-600">
          Aquí podrás ver tus citas, historial médico y resultados de
          laboratorio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Próximas Citas</h3>
          <p className="text-gray-500">No tienes citas programadas</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Resultados Recientes</h3>
          <p className="text-gray-500">No hay resultados disponibles</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Mi Información</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
