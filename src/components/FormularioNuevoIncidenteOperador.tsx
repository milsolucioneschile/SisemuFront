import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "../types";
import { api } from "../services/api";
import GoogleMapAddressPicker from "./GoogleMapAddressPicker";
import ModalIncidenteDuplicado from "./ModalIncidenteDuplicado";
import AlertaRecurrente from "./AlertaRecurrente";
import InspectorSugerido from "./InspectorSugerido";
import { useVerificacionTiempoReal } from "../hooks/useVerificacionTiempoReal";

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
    nombreLlamante: "",
    rutLlamante: "",
    telefonoLlamante: "",
    latitud: "",
    longitud: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);


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

  // Estados para detección de duplicados
  const [modalDuplicado, setModalDuplicado] = useState<{
    open: boolean;
    incidenteExistente: any;
    datosNuevoIncidente: any;
    soloLlamadaRecurrente?: boolean;
  }>({
    open: false,
    incidenteExistente: null,
    datosNuevoIncidente: null,
    soloLlamadaRecurrente: false,
  });

  const fechaHoraRegistro = useMemo(() => new Date().toLocaleString(), []);

  // Hook para verificación en tiempo real
  const {
    verificaciones,
    cargando: cargandoVerificaciones,
    tieneAlertas,
    totalLlamadasRecurrentes,
  } = useVerificacionTiempoReal({
    rut: datosFormulario.rutLlamante,
    telefono: datosFormulario.telefonoLlamante,
    direccion: datosFormulario.direccionIncidente,
    latitud: coords?.lat,
    longitud: coords?.lng,
    debounceMs: 800,
  });

  // Devuelve fecha/hora local en formato para input datetime-local (YYYY-MM-DDTHH:MM)

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
        latitud: incidenteParaEditar.latitud || "",
        longitud: incidenteParaEditar.longitud || "",
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
        latitud: parseFloat(datosFormulario.latitud),
        longitud: parseFloat(datosFormulario.longitud),
        nombreLlamante: datosFormulario.nombreLlamante,
        rutLlamante: datosFormulario.rutLlamante,
        telefonoLlamante: datosFormulario.telefonoLlamante,
      };

      if (modoEdicion && incidenteParaEditar?.id) {
        await api.actualizarIncidente(incidenteParaEditar.id, datosEnvio);
        setExito("Incidente actualizado correctamente");
        setToast({ tipo: "exito", mensaje: "Incidente actualizado" });
        
        window.dispatchEvent(new Event("incidente-actualizado"));
        setTimeout(() => {
          volverAVista();
        }, 1500);
      } else {
                // Verificar duplicados antes de crear el incidente
                const resultadoDuplicado = await api.verificarIncidenteDuplicado(datosEnvio);

                if (resultadoDuplicado.esRepetido && resultadoDuplicado.incidentesSimilares && resultadoDuplicado.incidentesSimilares.length > 0) {
                  // Mostrar modal de duplicado con todos los datos de la respuesta
                  setModalDuplicado({
                    open: true,
                    incidenteExistente: resultadoDuplicado.incidentesSimilares[0],
                    datosNuevoIncidente: {
                      ...datosEnvio,
                      incidentesSimilares: resultadoDuplicado.incidentesSimilares,
                      mensaje: resultadoDuplicado.mensaje,
                      datosCoincidentes: resultadoDuplicado.datosCoincidentes
                    },
                  });
                  setCargando(false);
                  return;
                }

        // Si no es duplicado, crear el incidente normalmente
        const operadorId = operadorIdReal || usuario.id || 3;
        const datosCreacion = { ...datosEnvio, operadorId };
        await api.crearIncidente(datosCreacion);
        setExito("Incidente registrado correctamente");
        setToast({ tipo: "exito", mensaje: "Incidente creado" });

        window.dispatchEvent(new Event("incidente-actualizado"));
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

  // Funciones para manejar el modal de duplicados
  const handleCerrarModalDuplicado = () => {
    setModalDuplicado({
      open: false,
      incidenteExistente: null,
      datosNuevoIncidente: null,
      soloLlamadaRecurrente: false,
    });
  };

  const handleAgregarLlamadaRecurrente = (incidenteId: number) => {
    setExito(`Llamada recurrente agregada al incidente #${incidenteId}`);
    setToast({ tipo: "exito", mensaje: "Llamada recurrente agregada" });
    
    window.dispatchEvent(new Event("incidente-actualizado"));
    setTimeout(() => {
      volverAVista();
    }, 1500);
  };

  const handleCrearNuevoIncidente = async () => {
    try {
      const operadorId = operadorIdReal || usuario.id || 3;
      const datosCreacion = { ...modalDuplicado.datosNuevoIncidente, operadorId };
      await api.crearIncidente(datosCreacion);
      
      setExito("Incidente registrado correctamente");
      setToast({ tipo: "exito", mensaje: "Incidente creado" });
      
      window.dispatchEvent(new Event("incidente-actualizado"));
    } catch (err: any) {
      const mensajeError = err.message || "Error al registrar el incidente";
      setError(mensajeError);
      setToast({ tipo: "error", mensaje: "Error al guardar" });
      console.error("Error:", err);
    }
  };

  // Funciones para manejar alertas recurrentes
  const handleVerHistorial = () => {
    // Aquí se podría abrir un modal o navegar a una página de historial
    console.log("Ver historial completo del llamante");
  };

  const handleAgregarLlamadaRecurrenteDesdeAlerta = async (incidenteId: number) => {
    try {
      // Cargar los datos completos del incidente
      const incidenteCompleto = await api.obtenerIncidente(incidenteId);
      
      // Abrir modal de seguimiento para agregar llamada recurrente
      setModalDuplicado({
        open: true,
        incidenteExistente: incidenteCompleto,
        datosNuevoIncidente: {
          descripcion: datosFormulario.descripcion,
          tipo: datosFormulario.tipoIncidente,
          fechaHoraIncidente: new Date(datosFormulario.fechaHoraIncidente).toISOString(),
          direccionIncidente: datosFormulario.direccionIncidente,
          nombreLlamante: datosFormulario.nombreLlamante,
          rutLlamante: datosFormulario.rutLlamante,
          telefonoLlamante: datosFormulario.telefonoLlamante,
        },
        soloLlamadaRecurrente: true, // Indicar que solo se debe mostrar la opción de llamada recurrente
      });
    } catch (error) {
      console.error("Error cargando datos del incidente:", error);
      setError("Error al cargar los datos del incidente");
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

            {/* Alertas de verificación en tiempo real */}
            {tieneAlertas && (
              <div className="mb-4">
                {verificaciones.rut.existe && (
                  <AlertaRecurrente
                    tipo="rut"
                    datos={verificaciones.rut}
                    onVerHistorial={handleVerHistorial}
                    onAgregarLlamadaRecurrente={handleAgregarLlamadaRecurrenteDesdeAlerta}
                  />
                )}
                {verificaciones.telefono.existe && (
                  <AlertaRecurrente
                    tipo="telefono"
                    datos={verificaciones.telefono}
                    onVerHistorial={handleVerHistorial}
                    onAgregarLlamadaRecurrente={handleAgregarLlamadaRecurrenteDesdeAlerta}
                  />
                )}
                {verificaciones.direccion.existe && (
                  <AlertaRecurrente
                    tipo="direccion"
                    datos={verificaciones.direccion}
                    onVerHistorial={handleVerHistorial}
                    onAgregarLlamadaRecurrente={handleAgregarLlamadaRecurrenteDesdeAlerta}
                  />
                )}
              </div>
            )}

            {/* Indicador de llamadas recurrentes */}
            {totalLlamadasRecurrentes > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 text-sm font-medium">
                    Se han detectado {totalLlamadasRecurrentes} llamada{totalLlamadasRecurrentes > 1 ? 's' : ''} recurrente{totalLlamadasRecurrentes > 1 ? 's' : ''} relacionada{totalLlamadasRecurrentes > 1 ? 's' : ''}
                  </span>
                </div>
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
                    {coords && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Sugerido automáticamente)
                      </span>
                    )}
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
                  {coords && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 El inspector más cercano se sugiere automáticamente arriba
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud
                  </label>
                  <input
                    type="text"
                    name="latitud"
                    value={datosFormulario.latitud}
                    onChange={manejarCambio}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                    placeholder="Se llena automáticamente"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud
                  </label>
                  <input
                    type="text"
                    name="longitud"
                    value={datosFormulario.longitud}
                    onChange={manejarCambio}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                    placeholder="Se llena automáticamente"
                    readOnly
                  />
                </div>
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
                    onLocationChange={(c) => {
                      setCoords(c);
                      if (c) {
                        setDatosFormulario((prev) => ({
                          ...prev,
                          latitud: c.lat.toString(),
                          longitud: c.lng.toString(),
                        }));
                      }
                    }}
                  />
                </div>

                {/* Asignación de Inspector - Después del mapa de ubicación */}
                {coords && (
                  <InspectorSugerido
                    latitud={coords.lat}
                    longitud={coords.lng}
                    inspectorSeleccionado={datosFormulario.inspectorAsignado}
                    onInspectorChange={(inspectorId) => 
                      setDatosFormulario(prev => ({ ...prev, inspectorAsignado: inspectorId }))
                    }
                    direccionIncidente={datosFormulario.direccionIncidente}
                  />
                )}

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
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      RUT
                      {cargandoVerificaciones.rut && (
                        <span className="ml-2 text-blue-600 text-xs">
                          <span className="animate-spin">⟳</span> Verificando...
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="rutLlamante"
                      value={datosFormulario.rutLlamante}
                      onChange={manejarCambio}
                      className={`w-full col-12 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        verificaciones.rut.existe 
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="12.345.678-9"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Teléfono
                      {cargandoVerificaciones.telefono && (
                        <span className="ml-2 text-blue-600 text-xs">
                          <span className="animate-spin">⟳</span> Verificando...
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      name="telefonoLlamante"
                      value={datosFormulario.telefonoLlamante}
                      onChange={manejarCambio}
                      className={`w-full col-12 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        verificaciones.telefono.existe 
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-gray-300'
                      }`}
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
                          ? "En Proceso"
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

      {/* Modal de Incidente Duplicado */}
              <ModalIncidenteDuplicado
                open={modalDuplicado.open}
                onClose={handleCerrarModalDuplicado}
                incidenteExistente={modalDuplicado.incidenteExistente}
                datosNuevoIncidente={modalDuplicado.datosNuevoIncidente}
                usuario={usuario}
                onAgregarLlamadaRecurrente={handleAgregarLlamadaRecurrente}
                onCrearNuevoIncidente={handleCrearNuevoIncidente}
                soloLlamadaRecurrente={modalDuplicado.soloLlamadaRecurrente}
              />
    </div>
  );
}
