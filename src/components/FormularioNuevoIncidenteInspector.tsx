import { useMemo, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface FormularioNuevoIncidenteInspectorProps {
  usuario: User;
  volverAVista: () => void;
  incidenteParaEditar?: any;
  modoEdicion?: boolean;
}

export default function FormularioNuevoIncidenteInspector({
  usuario,
  volverAVista,
  incidenteParaEditar,
  modoEdicion = false,
}: FormularioNuevoIncidenteInspectorProps) {
  const zonas = ["zona1", "zona2", "zona3", "zona4", "zona5"];

  const [datosFormulario, setDatosFormulario] = useState({
    descripcion: "",
    tipoIncidente: "",
    fechaHoraIncidente: "",
    direccionIncidente: "",
    referencias: "",
    zona: "zona1",
    nombreLlamante: "",
    rutLlamante: "",
    telefonoLlamante: "",
  });

  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState("");
  const [error, setError] = useState("");

  const fechaHoraRegistro = useMemo(() => new Date().toLocaleString(), []);

  // Devuelve fecha/hora local para input datetime-local (YYYY-MM-DDTHH:MM)
  const obtenerAhoraLocal = () => {
    const ahora = new Date();
    const tzOffsetMs = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  // Convierte cualquier fecha a formato local para input datetime-local
  const toLocalInput = (value: string | number | Date) => {
    if (!value) return "";
    const d = new Date(value);
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const tiposIncidente = [
    "Seguridad",
    "Ambulancia",
    "Bomberos",
    "Robo a Persona",
    "Robo a Vehículo",
    "Robo a Casa",
    "Violencia Intrafamiliar",
    "Actividad Sospechosa",
    "Accidente Vehicular",
    "Drogas",
    "Disturbios",
    "Robo de Cables",
    "Robo Mascotas",
    "Persona Extraviada",
    "Ruidos Molestos",
  ];

  useEffect(() => {
    if (modoEdicion && incidenteParaEditar) {
      setDatosFormulario({
        descripcion: incidenteParaEditar.descripcion || "",
        tipoIncidente: incidenteParaEditar.tipo || "",
        fechaHoraIncidente: toLocalInput(incidenteParaEditar.fechaHoraIncidente),
        direccionIncidente: incidenteParaEditar.direccionIncidente || "",
        referencias: incidenteParaEditar.referencias || "",
        zona: incidenteParaEditar.zona || "zona1",
        nombreLlamante: incidenteParaEditar.nombreLlamante || "",
        rutLlamante: incidenteParaEditar.rutLlamante || "",
        telefonoLlamante: incidenteParaEditar.telefonoLlamante || "",
      });
    }
  }, [modoEdicion, incidenteParaEditar]);

  // Setea fecha actual por defecto al crear
  useEffect(() => {
    if (!modoEdicion) {
      setDatosFormulario((prev) => ({
        ...prev,
        fechaHoraIncidente: prev.fechaHoraIncidente || obtenerAhoraLocal(),
      }));
    }
  }, [modoEdicion]);

  const manejarCambioInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Normaliza año (1900-2100) SOLO cuando ya hay 4 dígitos; permite escritura parcial
  const sanitizarFechaHora = (valor: string) => {
    if (!valor) return valor;
    const match = valor.match(/^(\d{0,4})(.*)$/);
    if (!match) return valor;
    const yearRaw = match[1];
    const resto = match[2] || "";
    if (yearRaw.length < 4) return valor;
    const yearNum = Math.min(2100, Math.max(1900, parseInt(yearRaw, 10)));
    const yearStr = String(yearNum).padStart(4, "0");
    return `${yearStr}${resto}`;
  };

  const manejarCambioFechaHora = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // No sanitizar durante la escritura para no bloquear los primeros dígitos
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarBlurFechaHora = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const normalizado = sanitizarFechaHora(value);
    if (normalizado !== value) {
      setDatosFormulario((prev) => ({ ...prev, [name]: normalizado }));
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!datosFormulario.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (!datosFormulario.tipoIncidente) {
      setError("Seleccione un tipo de incidente");
      return;
    }

    if (!datosFormulario.fechaHoraIncidente) {
      setError("La fecha y hora del incidente son obligatorias");
      return;
    }

    if (!datosFormulario.direccionIncidente.trim()) {
      setError("La dirección del incidente es obligatoria");
      return;
    }

    if (!datosFormulario.nombreLlamante.trim() || !datosFormulario.rutLlamante.trim() || !datosFormulario.telefonoLlamante.trim()) {
      setError("Complete nombre, RUT y teléfono del llamante");
      return;
    }

    if (!datosFormulario.zona) {
      setError("Seleccione una zona");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const iso = new Date(datosFormulario.fechaHoraIncidente).toISOString();
      const isoSinMs = `${iso.slice(0, 19)}Z`;
      const datosEnvio = {
        descripcion: datosFormulario.descripcion,
        tipo: datosFormulario.tipoIncidente,
        fechaHoraIncidente: isoSinMs,
        direccionIncidente: datosFormulario.direccionIncidente,
        referencias: datosFormulario.referencias || "",
        zona: datosFormulario.zona,
        operadorId: usuario.id,
        inspectorAsignadoId: usuario.id,
        nombreLlamante: datosFormulario.nombreLlamante,
        rutLlamante: datosFormulario.rutLlamante,
        telefonoLlamante: datosFormulario.telefonoLlamante,
      };

      if (modoEdicion && incidenteParaEditar?.id) {
        await api.actualizarIncidente(incidenteParaEditar.id, datosEnvio);
        setExito("Incidente actualizado correctamente");
      } else {
        await api.crearIncidente(datosEnvio);
        setExito("Incidente registrado correctamente");
      }

      window.dispatchEvent(new Event("incidente-actualizado"));

      if (!modoEdicion) {
        setDatosFormulario({
          descripcion: "",
          tipoIncidente: "",
          fechaHoraIncidente: "",
          direccionIncidente: "",
          referencias: "",
          zona: "zona1",
          nombreLlamante: "",
          rutLlamante: "",
          telefonoLlamante: "",
        });
      } else {
        setTimeout(() => {
          volverAVista();
        }, 1500);
      }
    } catch (err: any) {
      const mensajeError =
        err.message ||
        `Error al ${modoEdicion ? "actualizar" : "registrar"} el incidente`;
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#41413d] text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {modoEdicion
                  ? "Editar Incidente - Inspector"
                  : "Nuevo Incidente - Inspector"}
              </h2>
              <p className="text-gray-200 text-sm">
                Registrado por: {usuario.fullName}
              </p>
            </div>
            <button
              onClick={volverAVista}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white px-4 py-2 rounded transition-colors"
            >
              Volver
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 text-red-700 bg-red-100 p-3 rounded border border-red-300 text-sm">
                {error}
              </div>
            )}

            {exito && (
              <div className="mb-4 text-green-700 bg-green-100 p-3 rounded border border-green-300 text-sm">
                {exito}
              </div>
            )}

            <form onSubmit={manejarEnvio} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tipo de Incidente
                  </label>
                  <select
                    name="tipoIncidente"
                    value={datosFormulario.tipoIncidente}
                    onChange={manejarCambioInput}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposIncidente.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspector Asignado
                  </label>
                  <input
                    type="text"
                    value={`${usuario.fullName}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="w-full col-span-1 md:col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Zona
                </label>
                <select
                  name="zona"
                  value={datosFormulario.zona}
                  onChange={manejarCambioInput}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {zonas.map((zona) => (
                    <option key={zona} value={zona}>
                      {zona}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Registro
                  </label>
                  <input
                    type="text"
                    value={fechaHoraRegistro}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora del Incidente
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      name="fechaHoraIncidente"
                      value={datosFormulario.fechaHoraIncidente}
                      onChange={manejarCambioFechaHora}
                      onBlur={manejarBlurFechaHora}
                      min="1900-01-01T00:00"
                      max="2100-12-31T23:59"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDatosFormulario((prev) => ({
                          ...prev,
                          fechaHoraIncidente: obtenerAhoraLocal(),
                        }))
                      }
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded"
                      title="Establecer a la fecha y hora actuales"
                    >
                      Ahora
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección del Incidente
                  </label>
                  <input
                    type="text"
                    name="direccionIncidente"
                    value={datosFormulario.direccionIncidente}
                    onChange={manejarCambioInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa donde ocurrió el incidente"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nombre de quien llama</label>
                    <input
                      type="text"
                      name="nombreLlamante"
                      value={datosFormulario.nombreLlamante}
                      onChange={manejarCambioInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">RUT</label>
                    <input
                      type="text"
                      name="rutLlamante"
                      value={datosFormulario.rutLlamante}
                      onChange={manejarCambioInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12.345.678-9"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="telefonoLlamante"
                      value={datosFormulario.telefonoLlamante}
                      onChange={manejarCambioInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencias
                  </label>
                  <input
                    type="text"
                    name="referencias"
                    value={datosFormulario.referencias}
                    onChange={manejarCambioInput}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Referencias adicionales, puntos de referencia, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={datosFormulario.descripcion}
                    onChange={manejarCambioInput}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describa detalladamente el incidente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operador
                  </label>
                  <input
                    type="text"
                    value="No aplica"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspector
                  </label>
                  <input
                    type="text"
                    value={`${usuario.fullName} (${usuario.username})`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={"Abierto"}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Adjuntos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border border-gray-300 transition-colors text-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Agregar Imagen
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border border-gray-300 transition-colors text-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Grabar Audio
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 bg-[#e67e22] hover:bg-[#d35400] text-white py-2 px-4 rounded-md shadow-sm font-medium transition-colors"
                >
                  {cargando
                    ? modoEdicion
                      ? "Actualizando..."
                      : "Registrando..."
                    : modoEdicion
                    ? "Actualizar Incidente"
                    : "Registrar Incidente"}
                </button>

                <button
                  type="button"
                  onClick={volverAVista}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
