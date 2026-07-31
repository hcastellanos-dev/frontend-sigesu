import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">SIGESU</h1>
      <nav className="space-y-2">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/usuarios">Usuarios</Link>
        <Link href="/dashboard/roles">Roles</Link>
        <Link href="/dashboard/productos">Productos</Link>
      </nav>
    </aside>
  );
}
