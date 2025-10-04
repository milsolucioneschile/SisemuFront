import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "../types";
import { api } from "../services/api";
import GoogleMapAddressPicker from "./GoogleMapAddressPicker";

interface FormularioNuevoIncidenteOperadorProps {
  usuario: User;
  volverAVista: () => void;
  incidenteParaEditar?: any;
  modoEdicion?: boolean;
}

export default function FormularioNuevoIncidenteOperador({
  usuario,
  volverAVista,
  incidenteParaEditar,
  modoEdicion = false,
}: FormularioNuevoIncidenteOperadorProps) {
  const [datosFormulario, setDatosFormulario] = useState({
    descripcion: "",
    tipoIncidente: "",
    fechaHoraIncidente: "",
    direccionIncidente: "",
    referencias: "",
    inspectorAsignado: "",
    zona: "zona1",
    nombreLlamante: "",
    rutLlamante: "",
    telefonoLlamante: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const zonas = ["zona1", "zona2", "zona3", "zona4", "zona5"];

  const [inspectores, setInspectores] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [seedIntentado, setSeedIntentado] = useState(false);
  const [operadorIdReal, setOperadorIdReal] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    tipo: "exito" | "error";
    mensaje: string;
  } | null>(null);

  const fechaHoraRegistro = useMemo(() => new Date().toLocaleString(), []);

  // Devuelve fecha/hora local en formato para input datetime-local (YYYY-MM-DDTHH:MM)
  const obtenerAhoraLocal = useCallback(() => {
    const ahora = new Date();
    const tzOffsetMs = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  }, []);

  // Convierte cualquier fecha (ISO/Date) a formato local para input datetime-local
  const toLocalInput = useCallback((value: string | number | Date) => {
    if (!value) return "";
    const d = new Date(value);
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  }, []);

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

  const cargarInspectores = useCallback(async () => {
    try {
      const lista = await api.obtenerInspectoresDisponibles();
      setInspectores(lista);
      if (lista.length === 0) {
        setInfo("No se encontraron inspectores disponibles.");
      }
    } catch (err) {
      console.error("Error cargando inspectores:", err);
      setInfo("Error al cargar inspectores.");
    }
  }, []);

  const cargarOperadorIdReal = useCallback(async () => {
    setOperadorIdReal(usuario.id);
  }, [usuario.id]);

  useEffect(() => {
    cargarInspectores();
    if (usuario) cargarOperadorIdReal();
  }, [usuario, cargarInspectores, cargarOperadorIdReal]);

  useEffect(() => {
    if (modoEdicion && incidenteParaEditar) {
      setDatosFormulario({
        descripcion: incidenteParaEditar.descripcion || "",
        tipoIncidente: incidenteParaEditar.tipoIncidente || "",
        fechaHoraIncidente: toLocalInput(
          incidenteParaEditar.fechaHoraIncidente
        ) || "",
        direccionIncidente: incidenteParaEditar.direccionIncidente || "",
        referencias: incidenteParaEditar.referencias || "",
        inspectorAsignado: incidenteParaEditar.inspectorAsignadoId
          ? String(incidenteParaEditar.inspectorAsignadoId)
          : "",
        zona: "zona1",
        nombreLlamante: incidenteParaEditar.nombreLlamante || "",
        rutLlamante: incidenteParaEditar.rutLlamante || "",
        telefonoLlamante: incidenteParaEditar.telefonoLlamante || "",
      });
    }
  }, [modoEdicion, incidenteParaEditar, toLocalInput]);

  // Setea fecha actual por defecto al crear
  useEffect(() => {
    if (!modoEdicion) {
      setDatosFormulario((prev) => ({
        ...prev,
        fechaHoraIncidente: prev.fechaHoraIncidente || obtenerAhoraLocal(),
      }));
    }
  }, [modoEdicion, obtenerAhoraLocal]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const manejarCambio = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Normaliza el campo datetime-local asegurando año (1900-2100) SOLO cuando ya hay 4 dígitos
  const sanitizarFechaHora = (valor: string) => {
    if (!valor) return valor;
    const match = valor.match(/^(\d{0,4})(.*)$/);
    if (!match) return valor;
    const yearRaw = match[1];
    const resto = match[2] || "";
    // Permitir escritura parcial del año sin forzar
    if (yearRaw.length < 4) return valor;
    const yearNum = Math.min(2100, Math.max(1900, parseInt(yearRaw, 10)));
    const yearStr = String(yearNum).padStart(4, "0");
    return `${yearStr}${resto}`;
  };

  const manejarCambioFechaHora = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Durante la escritura no sanitizamos para no bloquear el input
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarBlurFechaHora = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const normalizado = sanitizarFechaHora(value);
    if (normalizado !== value) {
      setDatosFormulario((prev) => ({ ...prev, [name]: normalizado }));
    }
  };

  const manejarCambioZona = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDatosFormulario((prev) => ({
      ...prev,
      zona: e.target.value,
    }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !datosFormulario.descripcion ||
      !datosFormulario.tipoIncidente ||
      !datosFormulario.fechaHoraIncidente ||
      !datosFormulario.direccionIncidente ||
      !datosFormulario.nombreLlamante ||
      !datosFormulario.rutLlamante ||
      !datosFormulario.telefonoLlamante
    ) {
      setError("Complete todos los campos obligatorios");
      return;
    }
    setCargando(true);
    setError("");
    setExito("");

    try {
      const iso = new Date(datosFormulario.fechaHoraIncidente).toISOString();
      const isoSinMs = `${iso.slice(0, 19)}Z`;
      const datosEnvio = {
        descripcion: datosFormulario.descripcion,
        tipo: datosFormulario.tipoIncidente,
        fechaHoraIncidente: isoSinMs,
        direccionIncidente: datosFormulario.direccionIncidente,
        referencias: datosFormulario.referencias || undefined,
        inspectorAsignadoId: datosFormulario.inspectorAsignado
          ? Number(datosFormulario.inspectorAsignado)
          : undefined,
        zona: datosFormulario.zona,
        nombreLlamante: datosFormulario.nombreLlamante,
        rutLlamante: datosFormulario.rutLlamante,
        telefonoLlamante: datosFormulario.telefonoLlamante,
      };

      if (modoEdicion && incidenteParaEditar?.id) {
        await api.actualizarIncidente(incidenteParaEditar.id, datosEnvio);
        setExito("Incidente actualizado correctamente");
        setToast({ tipo: "exito", mensaje: "Incidente actualizado" });
      } else {
        const operadorId = operadorIdReal || usuario.id || 3;
        const datosCreacion = { ...datosEnvio, operadorId };
        await api.crearIncidente(datosCreacion);
        setExito("Incidente registrado correctamente");
        setToast({ tipo: "exito", mensaje: "Incidente creado" });
      }

      window.dispatchEvent(new Event("incidente-actualizado"));

      if (!modoEdicion) {
        setDatosFormulario({
          descripcion: "",
          tipoIncidente: "",
          fechaHoraIncidente: "",
          direccionIncidente: "",
          referencias: "",
          inspectorAsignado: "",
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
      setToast({ tipo: "error", mensaje: "Error al guardar" });
      console.error("Error:", err);
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
                  ? "Editar Incidente - Operador"
                  : "Nuevo Incidente - Operador"}
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
            {info && (
              <div className="mb-4 text-blue-700 bg-blue-100 p-3 rounded border border-blue-300 text-sm">
                {info}
              </div>
            )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Incidente
                  </label>
                  <select
                    name="tipoIncidente"
                    value={datosFormulario.tipoIncidente}
                    onChange={manejarCambio}
                    className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <select
                    name="inspectorAsignado"
                    value={datosFormulario.inspectorAsignado}
                    onChange={manejarCambio}
                    className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un inspector</option>
                    {inspectores.map((inspector) => (
                      <option key={inspector.id} value={inspector.id}>
                        {inspector.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full col-span-1 md:col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Zona
                </label>
                <select
                  name="zona"
                  value={datosFormulario.zona}
                  onChange={manejarCambioZona}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Operador
                  </label>
                  <input
                    type="text"
                    value={`${usuario.fullName} (${usuario.username})`}
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
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-md"
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
                  <GoogleMapAddressPicker
                    value={datosFormulario.direccionIncidente}
                    onChange={(direccion) =>
                      setDatosFormulario((prev) => ({ ...prev, direccionIncidente: direccion }))
                    }
                    onLocationChange={(c) => setCoords(c)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Nombre de quien llama</label>
                    <input
                      type="text"
                      name="nombreLlamante"
                      value={datosFormulario.nombreLlamante}
                      onChange={manejarCambio}
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      onChange={manejarCambio}
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      onChange={manejarCambio}
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Referencias
                    </label>
                    <input
                      type="text"
                      name="referencias"
                      value={datosFormulario.referencias}
                      onChange={manejarCambio}
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Referencias adicionales, puntos de referencia, etc."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={datosFormulario.descripcion}
                      onChange={manejarCambio}
                      rows={4}
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describa el incidente con detalle"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={
                        datosFormulario.inspectorAsignado
                          ? "Abierto"
                          : "Pendiente"
                      }
                      disabled
                      className="w-full col-12 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 bg-[#e67e22] hover:bg-[#d35400] text-white px-4 py-2 rounded transition-colors font-medium"
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
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 border border-gray-300 rounded transition-colors font-medium"
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
