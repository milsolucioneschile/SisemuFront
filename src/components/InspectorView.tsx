import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Incident, User } from "../types";

interface PropiedadesVistaInspector {
  usuario: User;
  alCerrarSesion: () => void;
  irAFormulario: () => void;
}

const VistaInspector: React.FC<PropiedadesVistaInspector> = ({
  usuario,
  alCerrarSesion,
  irAFormulario,
}) => {
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [incidenteSeleccionado, setIncidenteSeleccionado] =
    useState<Incident | null>(null);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<Incident["status"]>("Abierto");

  useEffect(() => {
    const cargarIncidentes = async () => {
      setCargando(true);
      setError("");
      try {
        console.log(
          "🔍 Cargando incidentes para:",
          usuario.rol,
          "ID:",
          usuario.id
        );

        const incidentes = await api.obtenerIncidentes(usuario.rol, usuario.id);
        console.log("📊 Total de incidentes cargados:", incidentes.length);

        const incidentesOrdenados = [...incidentes].sort(
          (a, b) =>
            new Date(b.updatedDate).getTime() -
            new Date(a.updatedDate).getTime()
        );

        setIncidentes(incidentesOrdenados);
      } catch (error) {
        console.error("Error al cargar incidentes:", error);
        setError(
          "Error al cargar los incidentes. Por favor, intente nuevamente."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarIncidentes();
  }, [usuario.id, usuario.rol]);

  const manejarClicIncidente = (incidente: Incident) => {
    setIncidenteSeleccionado(incidente);
    setNuevoEstado(
      incidente.status === "Abierto" ? "Abierto" : incidente.status
    );
    setMostrarModalDetalle(true);
    setError("");
    setExito("");
  };

  const manejarActualizacionEstado = () => {
    if (!incidenteSeleccionado) return;

    setCargando(true);
    setTimeout(() => {
      setExito("Función no disponible en la demo");
      setMostrarModalDetalle(false);
      setCargando(false);
    }, 500);
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "Abierto":
        return "bg-blue-100 text-blue-800";
      case "Cerrado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatearFecha = (cadenaFecha: string) => {
    return new Date(cadenaFecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerOpcionesEstado = (estadoActual: string) => {
    const opciones = ["Pendiente", "Abierto", "Cerrado"];
    return opciones;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#41413d] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Panel de Inspector</h1>
            <p className="text-gray-100">Bienvenido</p>
          </div>
          <button
            onClick={alCerrarSesion}
            className="bg-[#dc2626] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Mis Incidentes Asignados
              </h2>
              <p className="text-gray-600">
                Total asignados: {incidentes.length}
              </p>
            </div>
            <button
              onClick={irAFormulario}
              className="bg-[#e67e22] text-white px-4 py-2 rounded hover:bg-[#41413d] transition-colors duration-200"
            >
              Rellenar Formulario
            </button>
          </div>

          {error && (
            <div className="m-4 text-gray-700 text-sm bg-gray-100 p-2 rounded border border-gray-300">
              {error}
            </div>
          )}

          {exito && (
            <div className="m-4 text-gray-700 text-sm bg-white p-2 rounded border border-gray-300">
              {exito}
            </div>
          )}

          {cargando ? (
            <div className="p-8 text-center text-gray-500">
              Cargando incidentes...
            </div>
          ) : incidentes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tienes incidentes asignados
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {incidentes.map((incidente) => (
                <div
                  key={incidente.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => manejarClicIncidente(incidente)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          INC-{incidente.id}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${obtenerColorEstado(
                            incidente.status
                          )}`}
                        >
                          {incidente.status}
                        </span>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1">
                        {incidente.categoryName}
                      </h3>

                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Dirección:</strong> {incidente.address}
                      </p>

                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Ciudadano:</strong> {incidente.citizenName} (
                        {incidente.citizenEmail})
                      </p>

                      <p className="text-sm text-gray-700 mb-2">
                        {incidente.description}
                      </p>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Creado: {formatearFecha(incidente.createdDate)}
                        </span>
                        <span>
                          Actualizado: {formatearFecha(incidente.updatedDate)}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button className="text-gray-600 hover:text-gray-800 text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {mostrarModalDetalle && incidenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Detalle del Incidente</h3>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Ticket</p>
                  <p className="text-sm text-gray-900">
                    {incidenteSeleccionado.ticketNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Estado Actual
                  </p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${obtenerColorEstado(
                      incidenteSeleccionado.status
                    )}`}
                  >
                    {incidenteSeleccionado.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Categoría</p>
                <p className="text-sm text-gray-900">
                  {incidenteSeleccionado.categoryName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Dirección</p>
                <p className="text-sm text-gray-900">
                  {incidenteSeleccionado.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Ciudadano</p>
                  <p className="text-sm text-gray-900">
                    {incidenteSeleccionado.citizenName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">
                    {incidenteSeleccionado.citizenEmail}
                  </p>
                </div>
              </div>

              {incidenteSeleccionado.citizenPhone && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Teléfono</p>
                  <p className="text-sm text-gray-900">
                    {incidenteSeleccionado.citizenPhone}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700">Descripción</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {incidenteSeleccionado.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p className="font-medium">Fecha de Creación</p>
                  <p>{formatearFecha(incidenteSeleccionado.createdDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Última Actualización</p>
                  <p>{formatearFecha(incidenteSeleccionado.updatedDate)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Actualizar Estado
              </h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) =>
                    setNuevoEstado(e.target.value as Incident["status"])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                >
                  {obtenerOpcionesEstado(incidenteSeleccionado.status).map(
                    (estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={manejarActualizacionEstado}
                  disabled={
                    cargando || nuevoEstado === incidenteSeleccionado.status
                  }
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {cargando ? "Actualizando..." : "Actualizar Estado"}
                </button>
                <button
                  onClick={() => setMostrarModalDetalle(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaInspector;
