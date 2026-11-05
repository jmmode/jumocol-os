import { requirePage } from "@/server/auth/access";
import { audit, listUsers } from "@/server/auth/store";
import { UserControls } from "@/features/identity/user-controls";
import { CreateOperatorForm } from "@/features/identity/create-operator-form";
export default async function UsersPage() {
  const actor = await requirePage("/administracion/usuarios");
  const users = listUsers(actor);
  audit(actor.id, "users", "read", "SUCCESS");
  return <div><h1 className="text-2xl font-semibold">Administración de usuarios</h1><p className="my-4">Cada titular define su contraseña en /activar. Restablecer revoca todas sus sesiones y credenciales anteriores.</p>
    <CreateOperatorForm />
    {users.map(user => <article key={user.id} className="my-4 rounded-xl border p-5"><h2 className="font-bold">{user.name} · {user.role}</h2><p>Usuario: {user.id} · {user.active ? "Activo" : "Inactivo"} · {user.hasPassword ? "Credenciales definidas" : "Pendiente de activación"}</p><UserControls id={user.id} /></article>)}
  </div>;
}
