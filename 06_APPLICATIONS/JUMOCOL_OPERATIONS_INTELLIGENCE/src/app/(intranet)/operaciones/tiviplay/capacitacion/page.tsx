import Link from "next/link";

const blocks = [
  { number: 1, title: "Bienvenida y contexto JUMOCOL", status: "EN CAPACITACIÓN" },
  { number: 2, title: "Producto TiviPlay", status: "NO INICIADO" },
  { number: 3, title: "Flujo operativo completo", status: "NO INICIADO" },
  { number: 4, title: "Gestión diaria de cobro", status: "NO INICIADO" },
  { number: 5, title: "Estados operativos", status: "NO INICIADO" },
  { number: 6, title: "Casos simulados", status: "NO INICIADO" },
  { number: 7, title: "Primera gestión real acompañada", status: "NO INICIADO" },
];

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "EN CAPACITACIÓN"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

export default function TiviplayTrainingPage() {
  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/operaciones/tiviplay"
          className="text-sm text-slate-500 hover:text-slate-950"
        >
          ← TiviPlay
        </Link>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Capacitación operativa
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Día 1 · Contexto + operación básica
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Objetivo: comprender JUMOCOL, el rol del asesor y la lógica de una
            operación basada en procesos antes de ejecutar tareas de TiviPlay.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {blocks.map((block) => (
          <div
            key={block.number}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bloque {block.number}
              </span>
              <StatusBadge status={block.status} />
            </div>
            <div className="mt-3 font-medium text-slate-950">{block.title}</div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Bloque 1
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Bienvenida y contexto JUMOCOL
            </h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            Duración objetivo · 30 min
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Qué aprenderás
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li>• Qué es JUMOCOL y cómo se relaciona con TiviPlay.</li>
              <li>• Qué responsabilidad tiene un asesor dentro de la operación.</li>
              <li>• Por qué una gestión debe dejar continuidad y trazabilidad.</li>
              <li>• La diferencia entre resolver un caso e improvisar una regla.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-950">
              Principio del módulo
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              En JUMOCOL el talento forma parte de un sistema operativo. Una buena
              gestión no termina cuando se envía un mensaje: debe dejar claro qué
              ocurrió, cuál es el resultado y qué debe pasar después.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Conceptos clave
            </h3>
            <div className="mt-4 space-y-3">
              {[
                [
                  "Proceso",
                  "Secuencia acordada para ejecutar una actividad de manera repetible.",
                ],
                [
                  "Trazabilidad",
                  "Capacidad de saber qué ocurrió, quién actuó y cuál es la próxima acción.",
                ],
                [
                  "Evidencia",
                  "Registro que permite demostrar que una actividad realmente se ejecutó.",
                ],
                [
                  "Escalamiento",
                  "Transferir una excepción al responsable correcto cuando excede el alcance del asesor.",
                ],
              ].map(([term, definition]) => (
                <div
                  key={term}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="font-medium text-slate-950">{term}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    {definition}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Rol esperado del asesor
            </h3>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>
                <span className="font-medium">1. Entender:</span> identificar qué
                necesita el cliente y qué información existe.
              </li>
              <li>
                <span className="font-medium">2. Ejecutar:</span> aplicar el
                procedimiento que corresponde.
              </li>
              <li>
                <span className="font-medium">3. Registrar:</span> dejar resultado,
                próxima acción y evidencia.
              </li>
              <li>
                <span className="font-medium">4. Escalar:</span> cuando el caso no
                puede resolverse dentro de su autoridad.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-950">Error crítico</h3>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            No inventar una respuesta, estado, autorización o regla para cerrar un
            caso. Cuando falta información o autoridad, se registra y se escala.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Ejercicio de comprensión
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Explica con tus propias palabras qué significa para ti “trabajar
            dentro de un sistema operativo” y qué harías si un cliente te pide una
            solución que no está contemplada en el procedimiento que conoces.
          </p>

          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Evidencia esperada: respuesta registrada por el capacitador y
            observaciones de comprensión.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Gate del Bloque 1
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            El bloque puede pasar a VALIDADO cuando la persona:
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>• comprende el propósito de JUMOCOL y TiviPlay;</li>
            <li>• identifica el rol del asesor dentro del proceso;</li>
            <li>• reconoce la importancia de registrar y dejar continuidad;</li>
            <li>• diferencia procedimiento de improvisación;</li>
            <li>• sabe que una excepción debe registrarse y escalarse.</li>
          </ul>
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Estado actual: EN CAPACITACIÓN
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Checklist del capacitador
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Presentó JUMOCOL y TiviPlay.",
            "Explicó el rol del asesor.",
            "Explicó proceso, trazabilidad y evidencia.",
            "Explicó cuándo escalar.",
            "La candidata realizó el ejercicio.",
            "Se registró evidencia.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            >
              ☐ {item}
            </div>
          ))}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <span className="font-medium text-slate-900">Siguiente bloque:</span>{" "}
        Producto TiviPlay. No avanzar automáticamente: requiere validación del
        Bloque 1 o decisión explícita.
      </footer>
    </main>
  );
}
