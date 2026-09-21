const mockUsers = [
  {
    id: "1",
    name: "Admin Demo",
    email: "admin@demo.minutadigital.com",
    roleCode: "ROLE_COMPLEX_ADMIN",
  },
  {
    id: "2",
    name: "Javier Rojas",
    email: "javier@demo.minutadigital.com",
    roleCode: "ROLE_SECURITY",
  },
  {
    id: "3",
    name: "Laura Soto",
    email: "laura@demo.minutadigital.com",
    roleCode: "ROLE_RESIDENT",
  },
];

export function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Gestión de Usuarios
        </h1>
        <button className="rounded-xl bg-sky-600 px-4 py-2 font-medium text-white">
          Invitar usuario
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                    {user.roleCode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
