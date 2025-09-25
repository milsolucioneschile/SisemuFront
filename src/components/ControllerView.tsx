import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Incident, User } from "../types";

interface PropiedadesVistaControlador {
  usuario: User;
  alCerrarSesion: () => void;
  irAFormulario: () => void;
}

const VistaControlador: React.FC<PropiedadesVistaControlador> = ({
  usuario,
  alCerrarSesion,
  irAFormulario,
}) => {
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [inspectores, setInspectores] = useState<User[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [incidenteSeleccionado, setIncidenteSeleccionado] =
    useState<Incident | null>(null);
  const [inspectorSeleccionado, setInspectorSeleccionado] = useState<number>(0);

  useEffect(() => {
    setIncidentes([]);
    setInspectores([
      {
        id: 2,
        username: "inspector1",
        role: "inspector",
        fullName: "Inspector 1",
        nombreUsuario: "inspector1",
        rol: "inspector",
        nombreCompleto: "Inspector 1",
      },
      {
        id: 3,
        username: "inspector2",
        role: "inspector",
        fullName: "Inspector 2",
        nombreUsuario: "inspector2",
        rol: "inspector",
        nombreCompleto: "Inspector 2",
      },
    ]);
  }, []);

  const manejarClicAsignar = (incidente: Incident) => {
    setIncidenteSeleccionado(incidente);
    setInspectorSeleccionado(inspectores[0]?.id || 0);
    setMostrarModalAsignar(true);
    setError("");
    setExito("");
  };

  const manejarEnvioAsignacion = () => {
    if (!incidenteSeleccionado || !inspectorSeleccionado) {
      setError("Seleccione un inspector");
      return;
    }

    setCargando(true);
    setTimeout(() => {
      setExito("Función no disponible en la demo");
      setMostrarModalAsignar(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control</h1>
            <p className="text-blue-100">Bienvenido</p>
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
                Gestión de Incidentes
              </h2>
              <p className="text-gray-600">
                Total de incidentes: {incidentes.length}
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
            <div className="m-4 text-red-500 text-sm bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {exito && (
            <div className="m-4 text-green-500 text-sm bg-green-100 p-2 rounded">
              {exito}
            </div>
          )}

          {cargando ? (
            <div className="p-8 text-center text-gray-500">
              Cargando incidentes...
            </div>
          ) : incidentes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay incidentes reportados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Ciudadano
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Zona
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Inspector
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incidentes.map((incidente) => (
                    <tr key={incidente.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {incidente.ticketNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatearFecha(incidente.createdDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {incidente.direccionIncidente || "No especificada"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {incidente.referencias || "Sin referencias"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {incidente.zona || "No especificada"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {incidente.categoryName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {incidente.address}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${obtenerColorEstado(
                            incidente.status
                          )}`}
                        >
                          {incidente.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {incidente.assignedInspectorName || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {incidente.status === "Pendiente" && (
                          <button
                            onClick={() => manejarClicAsignar(incidente)}
                            className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                          >
                            Derivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {mostrarModalAsignar && incidenteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Asignar Inspector</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Ticket:</strong> {incidenteSeleccionado.ticketNumber}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Descripción:</strong>{" "}
                {incidenteSeleccionado.description}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Inspector
              </label>
              {}
              <select
                value={inspectorSeleccionado}
                onChange={(e) =>
                  setInspectorSeleccionado(parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value={0}>Seleccione un inspector</option>
                {inspectores.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={manejarEnvioAsignacion}
                disabled={cargando || !inspectorSeleccionado}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {cargando ? "Asignando..." : "Asignar"}
              </button>
              <button
                onClick={() => setMostrarModalAsignar(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaControlador;
