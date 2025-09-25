import React, { useMemo, useState, useEffect } from "react";
import DataTable, { ColumnDefinition } from "../DataTable";
import { api } from "../../services/api";

type FilaInspector = {
  id: number;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  activo: boolean;
  disponible: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
  acciones?: any;
};

interface InspectoresPageProps {
  onNuevoInspector: () => void;
}

const InspectoresPage: React.FC<InspectoresPageProps> = ({
  onNuevoInspector,
}) => {
  const [filas, setFilas] = useState<FilaInspector[]>([]);
  const [cargando, setCargando] = useState(false);
  const [inspectorParaEditar, setInspectorParaEditar] =
    useState<FilaInspector | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleEditarInspector = (inspector: FilaInspector) => {
    setInspectorParaEditar(inspector);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminarInspector = async (inspector: FilaInspector) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar el inspector "${inspector.nombre}"?`
      )
    ) {
      return;
    }

    try {
      await api.eliminarInspector(inspector.id);
      setFilas((prev) => prev.filter((f) => f.id !== inspector.id));
      alert("✅ Inspector eliminado exitosamente de la base de datos");
    } catch (error: any) {
      console.error("Error al eliminar inspector:", error);
      alert(`❌ ${error.message || "Error al eliminar el inspector"}`);
    }
  };

  const cargarInspectores = async () => {
    setCargando(true);

    try {
      const data = await api.obtenerInspectores();

      const filasMapeadas: FilaInspector[] = data.map((item: any) => ({
        id: item.id ?? item.Id,
        nombre: item.nombre ?? item.Nombre ?? "",
        rut: item.rut ?? item.Rut ?? "",
        email: item.email ?? item.Email,
        telefono: item.telefono ?? item.Telefono,
        activo: item.activo ?? item.Activo ?? true,
        disponible: item.disponible ?? item.Disponible ?? true,
        fechaCreacion: item.fechaCreacion ?? item.FechaCreacion,
        fechaModificacion: item.fechaModificacion ?? item.FechaModificacion,
      }));

      setFilas(filasMapeadas);
      console.log(
        "✅ Inspectores cargados desde la base de datos:",
        filasMapeadas.length
      );
    } catch (error: any) {
      console.error("❌ Error al cargar inspectores:", error);
      setFilas([]);
      alert(
        `Error: ${error.message || "No se pudieron cargar los inspectores"}`
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInspectores();
  }, []);

  useEffect(() => {
    const handleInspectorActualizado = () => {
      cargarInspectores();
    };

    window.addEventListener(
      "inspector-actualizado",
      handleInspectorActualizado
    );
    window.addEventListener("inspector-creado", handleInspectorActualizado);

    return () => {
      window.removeEventListener(
        "inspector-actualizado",
        handleInspectorActualizado
      );
      window.removeEventListener(
        "inspector-creado",
        handleInspectorActualizado
      );
    };
  }, []);

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

  const columnas: ColumnDefinition<FilaInspector>[] = [
    { key: "id", header: "ID", sortable: true, className: "w-16" },
    { key: "nombre", header: "NOMBRE", sortable: true, className: "w-40" },
    { key: "rut", header: "RUT", sortable: true, className: "w-32" },
    {
      key: "email",
      header: "EMAIL",
      className: "w-48",
      render: (v: string) => <span title={v}>{v || "Sin email"}</span>,
    },
    {
      key: "telefono",
      header: "TELÉFONO",
      className: "w-32",
      render: (v: string) => <span>{v || "Sin teléfono"}</span>,
    },
    {
      key: "activo",
      header: "ACTIVO",
      className: "w-20 text-center",
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {v ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "disponible",
      header: "DISPONIBLE",
      className: "w-24 text-center",
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            v ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {v ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "fechaCreacion",
      header: "F. CREACIÓN",
      sortable: true,
      className: "w-36",
      render: (v: string) => formatearFecha(v),
    },
    {
      key: "acciones",
      header: "ACCIONES",
      className: "w-40 text-center",
      render: (_, fila: FilaInspector) => (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleEditarInspector(fila)}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1"
            title="Editar inspector"
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
          <button
            onClick={() => handleEliminarInspector(fila)}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
            title="Eliminar inspector"
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
      <h2 className="text-2xl font-bold text-gray-900">
        Gestión de Inspectores
      </h2>
      <p className="text-gray-600 mb-4">
        Administra y supervisa todos los inspectores del sistema
      </p>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Mostrando {filas.length} inspectores
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setInspectorParaEditar(null);
                setModoEdicion(false);
                setMostrarFormulario(true);
              }}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white px-4 py-2 rounded-md text-sm font-medium"
              title="Nuevo Inspector"
            >
              Nuevo Inspector
            </button>
          </div>
        </div>

        <div className="p-4">
          <DataTable
            datos={filas}
            columnas={columnas}
            paginacion
            filasPorPagina={10}
            emptyMessage="No hay inspectores para mostrar"
            cargando={cargando}
          />
        </div>
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {modoEdicion ? "Editar Inspector" : "Nuevo Inspector"}
            </h3>

            <FormularioInspector
              inspector={inspectorParaEditar}
              modoEdicion={modoEdicion}
              onGuardar={async (inspector) => {
                try {
                  if (modoEdicion && inspectorParaEditar) {
                    await api.actualizarInspector(
                      inspectorParaEditar.id,
                      inspector
                    );
                    window.dispatchEvent(new Event("inspector-actualizado"));
                  } else {
                    await api.crearInspector(inspector);
                    window.dispatchEvent(new Event("inspector-creado"));
                  }
                  setMostrarFormulario(false);
                  setInspectorParaEditar(null);
                  setModoEdicion(false);
                } catch (error: any) {
                  alert(`Error: ${error.message}`);
                }
              }}
              onCancelar={() => {
                setMostrarFormulario(false);
                setInspectorParaEditar(null);
                setModoEdicion(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface FormularioInspectorProps {
  inspector?: FilaInspector | null;
  modoEdicion: boolean;
  onGuardar: (inspector: any) => Promise<void>;
  onCancelar: () => void;
}

const FormularioInspector: React.FC<FormularioInspectorProps> = ({
  inspector,
  modoEdicion,
  onGuardar,
  onCancelar,
}) => {
  const [formData, setFormData] = useState({
    nombre: inspector?.nombre || "",
    rut: inspector?.rut || "",
    email: inspector?.email || "",
    telefono: inspector?.telefono || "",
    activo: inspector?.activo ?? true,
    disponible: inspector?.disponible ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.rut.trim()) {
      alert("El nombre y RUT son obligatorios");
      return;
    }

    await onGuardar(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RUT *
        </label>
        <input
          type="text"
          value={formData.rut}
          onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="text"
          value={formData.telefono}
          onChange={(e) =>
            setFormData({ ...formData, telefono: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {modoEdicion && (
        <>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) =>
                setFormData({ ...formData, activo: e.target.checked })
              }
              className="mr-2"
            />
            <label
              htmlFor="activo"
              className="text-sm font-medium text-gray-700"
            >
              Activo
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) =>
                setFormData({ ...formData, disponible: e.target.checked })
              }
              className="mr-2"
            />
            <label
              htmlFor="disponible"
              className="text-sm font-medium text-gray-700"
            >
              Disponible
            </label>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {modoEdicion ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
};

export default InspectoresPage;
