import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gray-100 py-24">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Sistema de Gestión de Servicios Universitarios
        </h2>

        <p className="text-gray-700 text-lg mb-8">
          Plataforma institucional para la administración de usuarios,
          inventarios, áreas y resguardos de forma segura y centralizada.
        </p>

        <Link
          href="/login"
          className="inline-block bg-blue-900 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-800 transition"
        >
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
}
