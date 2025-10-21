'use client';

export default function AdminDashboard() {
  const user = {
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@admin.com',
    role: 'Admin',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Bienvenido, Administrador</h2>
        <p className="text-gray-600">
          Este es tu panel de administración. Aquí podrás gestionar usuarios,
          configuraciones y visualizar reportes del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Usuarios</h3>
          <p className="text-3xl font-bold text-blue-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold text-green-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Pacientes Activos</h3>
          <p className="text-3xl font-bold text-purple-600">--</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Información del Usuario</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Rol</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
