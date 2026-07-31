export default function ContactoPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-blue-900 mb-8">
        Contacto
      </h2>

      <p className="mb-10 text-gray-700">
        Para mayor información sobre los servicios institucionales,
        puede comunicarse a través de los siguientes medios.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <p><strong>Dirección:</strong> Oaxaca de Juárez, Oaxaca</p>
          <p><strong>Teléfono:</strong> (951) 000 0000</p>
          <p><strong>Correo:</strong> contacto@sigesu.edu.mx</p>
          <p><strong>Horario:</strong> Lunes a Sábado, 9:00 a 15:00 hrs</p>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            placeholder="Mensaje"
            className="w-full border px-4 py-2 rounded h-32"
          />
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
}
