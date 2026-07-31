export default function Footer() {
  return (
    <footer className="bg-blue-950 text-gray-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-semibold mb-2">SIGESU</h3>
          <p>
            Sistema Institucional de Gestión de Servicios Universitarios.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Contacto</h3>
          <p>Correo: soporte@sigesu.edu.mx</p>
          <p>Tel: (951) 000 0000</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Institución</h3>
          <p>Universidad Pública</p>
          <p>Oaxaca, México</p>
        </div>
      </div>

      <div className="bg-blue-900 text-center py-3 text-xs">
        © {new Date().getFullYear()} SIGESU · Uso institucional
      </div>
    </footer>
  );
}
