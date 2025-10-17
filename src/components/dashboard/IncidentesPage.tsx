import React, { useMemo, useState, useEffect, useRef } from "react";
import DataTable, { ColumnDefinition } from "../DataTable";
import { api } from "../../services/api";

type FilaIncidente = {
  id: number;
  descripcion: string;
  tipo: string;
  fechaHoraIncidente: string;
  fechaHoraRegistro: string;
  estado: "Pendiente" | "En Proceso" | "Resuelto" | "Cerrado" | "Cancelado";
  direccionIncidente: string;
  referencias: string;
  categoria: string;
  zona: string;
  operadorRegistro?: string | null;
  inspectorAsignado?: string | null;
  acciones?: any;
};

type Estado = FilaIncidente["estado"] | "Todos";

interface IncidentesPageProps {
  onNuevaIncidencia: () => void;
  rolUsuario: "controlador" | "inspector";
  usuarioId: number;
  onEditarIncidente: (incidente: any) => void;
  onVerSeguimiento?: (incidente: any) => void;
}

const estadoBadgeClass = (estado: FilaIncidente["estado"]) => {
  switch (estado) {
    case "Pendiente":
      return "bg-orange-100 text-orange-800"; // Naranja
    case "En Proceso":
      return "bg-blue-100 text-blue-800"; // Azul
    case "Resuelto":
      return "bg-green-100 text-green-800"; // Verde
    case "Cerrado":
      return "bg-gray-100 text-gray-800"; // Gris claro
    case "Cancelado":
      return "bg-red-100 text-red-800"; // Rojo
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatearFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const IncidentesPage: React.FC<IncidentesPageProps> = ({
  onNuevaIncidencia,
  rolUsuario,
  usuarioId,
  onEditarIncidente,
  onVerSeguimiento,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<Estado>("Todos");
  const [filas, setFilas] = useState<FilaIncidente[]>([]);
  const [cargando, setCargando] = useState(false);
  const cargandoRef = useRef(false);
  const [toast, setToast] = useState<{
    tipo: "exito" | "error";
    mensaje: string;
  } | null>(null);

  const handleEditarIncidente = (incidente: FilaIncidente) => {
    onEditarIncidente(incidente);
  };

  const handleVerSeguimiento = (incidente: FilaIncidente) => {
    if (onVerSeguimiento) {
      onVerSeguimiento(incidente);
    }
  };

  const handleEliminarIncidente = async (incidente: FilaIncidente) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar el incidente "${incidente.descripcion}"?`
      )
    ) {
      return;
    }

    try {
      await api.eliminarIncidente(incidente.id);

      setFilas((prev) => prev.filter((f) => f.id !== incidente.id));
      setToast({ tipo: "exito", mensaje: "Incidente eliminado correctamente" });

      window.dispatchEvent(new Event("incidente-actualizado"));
    } catch (error: any) {
      console.error("Error al eliminar incidente:", error);
      setToast({
        tipo: "error",
        mensaje: error.message || "Error al eliminar el incidente",
      });
    }
  };

  const cargarIncidentes = async () => {
    if (cargandoRef.current) return;
    cargandoRef.current = true;
    setCargando(true);

    try {
      const data = await api.obtenerIncidentes(rolUsuario, usuarioId);

      const filasMapeadas: FilaIncidente[] = data.map((item: any) => ({
        id: item.id ?? item.Id,
        descripcion: item.descripcion ?? item.Descripcion ?? "",
        tipo: item.tipo ?? item.Tipo ?? item.tipoIncidente ?? "",
        fechaHoraIncidente: item.fechaHoraIncidente ?? item.FechaHoraIncidente,
        fechaHoraRegistro:
          item.fechaHoraRegistro ??
          item.FechaHoraRegistro ??
          item.fechaHoraIncidente ??
          item.FechaHoraIncidente,
        estado: (item.estado ??
          item.Estado ??
          "Pendiente") as FilaIncidente["estado"],
        direccionIncidente:
          item.direccionIncidente ?? item.DireccionIncidente ?? "",
        referencias: item.referencias ?? item.Referencias ?? "",
        categoria:
          item.categoria ?? item.Categoria ?? item.nombreCategoria ?? "",
        zona: item.zona ?? item.Zona ?? "Sin zona",
        operadorRegistro:
          item.operador ??
          item.Operador ??
          item.nombreOperadorRegistro ??
          "Sistema",
        inspectorAsignado:
          item.inspectorAsignado ??
          item.InspectorAsignado ??
          item.nombreInspectorAsignado ??
          "Sin asignar",
      }));

      setFilas(filasMapeadas);
      console.log(
        "✅ Incidentes cargados desde la base de datos:",
        filasMapeadas.length
      );
    } catch (error: any) {
      console.error("❌ Error al cargar incidentes:", error);
      setFilas([]);
      alert(
        `Error: ${error.message || "No se pudieron cargar los incidentes"}`
      );
    } finally {
      setCargando(false);
      cargandoRef.current = false;
    }
  };

  useEffect(() => {
    cargarIncidentes();
  }, [rolUsuario, usuarioId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleIncidenteActualizado = () => {
      if (cargandoRef.current) return;
      cargarIncidentes();
    };

    window.addEventListener(
      "incidente-actualizado",
      handleIncidenteActualizado
    );
    window.addEventListener("incidente-creado", handleIncidenteActualizado);

    return () => {
      window.removeEventListener(
        "incidente-actualizado",
        handleIncidenteActualizado
      );
      window.removeEventListener(
        "incidente-creado",
        handleIncidenteActualizado
      );
    };
  }, []);

  const incidentesFiltrados = useMemo(() => {
    if (filtroEstado === "Todos") return filas;
    return filas.filter((i) => i.estado === filtroEstado);
  }, [filtroEstado, filas]);

  const columnas: ColumnDefinition<FilaIncidente>[] = [
    { key: "id", header: "ID", sortable: true, className: "w-16" },
    {
      key: "descripcion",
      header: "DESCRIPCIÓN",
      className: "max-w-[200px] truncate",
      render: (v: string) => <span title={v}>{v}</span>,
    },
    { key: "tipo", header: "TIPO", sortable: true, className: "w-32" },
    {
      key: "fechaHoraIncidente",
      header: "F. H. INCIDENTE",
      sortable: true,
      className: "w-36",
      render: (v: string) => formatearFecha(v),
    },
    {
      key: "estado",
      header: "ESTADO",
      sortable: true,
      className: "w-24",
      render: (v: FilaIncidente["estado"]) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${estadoBadgeClass(
            v
          )}`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "direccionIncidente",
      header: "DIRECCIÓN",
      className: "max-w-[180px] truncate",
      render: (v: string) => <span title={v}>{v}</span>,
    },
    {
      key: "referencias",
      header: "REFERENCIAS",
      className: "max-w-[150px] truncate",
      render: (v: string) => <span title={v}>{v}</span>,
    },
    {
      key: "operadorRegistro",
      header: "OPERADOR",
      className: "w-32",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "inspectorAsignado",
      header: "INSPECTOR",
      className: "w-32",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "zona",
      header: "ZONA",
      sortable: true,
      className: "w-32",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "acciones",
      header: "ACCIONES",
      className: "w-48 text-center",
      render: (_, fila: FilaIncidente) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleEditarIncidente(fila)}
            className="px-2 py-1 text-xs text-white rounded flex items-center gap-1 border-0"
            style={{ backgroundColor: "#16a34a", border: "none" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#15803d")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#16a34a")
            }
            title="Editar incidente"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </button>
          {onVerSeguimiento && (
            <button
              onClick={() => handleVerSeguimiento(fila)}
              className="px-2 py-1 text-xs text-white rounded flex items-center gap-1 border-0"
              style={{ backgroundColor: "#3b82f6", border: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#3b82f6")
              }
              title="Ver seguimiento"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Seguimiento
            </button>
          )}
          <button
            onClick={() => handleEliminarIncidente(fila)}
            className="px-2 py-1 text-xs text-white rounded flex items-center gap-1 border-0"
            style={{ backgroundColor: "#dc2626", border: "none" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#b91c1c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
            title="Eliminar incidente"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.tipo === "exito"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {toast.mensaje}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          Gestión de Incidentes
        </h2>
        <p className="text-sm text-gray-500">
          Administra y supervisa todos los incidentes del sistema
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">Filtrar por estado:</div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as Estado)}
            >
              {["Todos", "Pendiente", "Abierto", "Cerrado"].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500">
              Mostrando {incidentesFiltrados.length} de {filas.length}{" "}
              incidentes
            </div>
          </div>

          <div className="relative">
            <button
              onClick={onNuevaIncidencia}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white px-4 py-2 rounded-md text-sm font-medium"
              title={
                rolUsuario === "controlador"
                  ? "Formulario de Operador"
                  : "Formulario de Inspector"
              }
            >
              Nueva incidencia
            </button>
          </div>
        </div>

        <div className="p-4">
          <DataTable
            datos={incidentesFiltrados}
            columnas={columnas}
            paginacion
            filasPorPagina={10}
            emptyMessage="No hay incidentes para mostrar"
            cargando={cargando}
          />
        </div>
      </div>
    </div>
  );
};

export default IncidentesPage;
