import React, { useEffect, useState } from "react";
import { User, Incident } from "../types";
import SimpleSidebar from "./SimpleSidebar";
import IncidentesPage from "./dashboard/IncidentesPage";
import ZonasPage from "./dashboard/ZonasPage";
import DashboardView from "./dashboard/DashboardView";
import { api } from "../services/api";

type MainLayoutProps = {
  usuario: User;
  alCerrarSesion: () => void;
  abrirFormularioOperador: () => void;
  abrirFormularioInspector: () => void;
  onEditarIncidente: (incidente: any) => void;
};

const MainLayout: React.FC<MainLayoutProps> = ({
  usuario,
  alCerrarSesion,
  abrirFormularioOperador,
  abrirFormularioInspector,
  onEditarIncidente,
}) => {
  const [seccion, setSeccion] = useState<string>("dashboard");
  const [toast, setToast] = useState<{
    tipo: "exito" | "error" | "info";
    mensaje: string;
  } | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const cargarIncidentes = async () => {
      try {
        setLoading(true);
        const data = await api.obtenerIncidentes(usuario.role, usuario.id);
        setIncidents(data);
      } catch (error) {
        console.error("Error al cargar incidentes:", error);
        setToast({
          tipo: "error",
          mensaje: "Error al cargar los datos del dashboard",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarIncidentes();
  }, [usuario]);

  const handleNuevaIncidencia = () => {
    if (usuario.role === "controlador") {
      abrirFormularioOperador();
    } else {
      abrirFormularioInspector();
    }
  };

  const handleEditar = (incidente: any) => {
    onEditarIncidente(incidente);
  };

  const renderContenido = () => {
    if (seccion === "dashboard") {
      return <DashboardView incidents={incidents} userRole={usuario.role} />;
    }

    if (seccion === "incidentes") {
      return (
        <IncidentesPage
          onNuevaIncidencia={handleNuevaIncidencia}
          rolUsuario={usuario.role}
          usuarioId={usuario.id}
          onEditarIncidente={handleEditar}
        />
      );
    }

    if (seccion === "configuracion") {
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>
            <ul className="divide-y">
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">Editar zonas</p>
                  <p className="text-sm text-gray-500">Definir regiones geográficas en el mapa</p>
                </div>
                <button
                  className="px-3 py-2 bg-[#41413d] text-white rounded hover:bg-[#2f2f2c]"
                  onClick={() => setSeccion("zonas")}
                >
                  Abrir
                </button>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (seccion === "zonas") {
      return <ZonasPage />;
    }

    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 text-gray-700">
          Sección en construcción
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed left-0 top-0 h-screen w-64">
        <SimpleSidebar
          seccionActiva={seccion}
          alCambiarSeccion={setSeccion}
          usuario={usuario}
          alCerrarSesion={alCerrarSesion}
        />
      </div>
      <div className="ml-64">
        {toast && (
          <div className="fixed right-6 top-6 z-50">
            <div
              className={`px-4 py-3 rounded shadow text-sm ${
                toast.tipo === "exito"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : toast.tipo === "error"
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {toast.mensaje}
            </div>
          </div>
        )}
        {renderContenido()}
      </div>
    </div>
  );
};

export default MainLayout;
