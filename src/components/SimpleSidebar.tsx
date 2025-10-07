import React, { useState } from "react";
import { User } from "../types";

interface SimpleSidebarProps {
  seccionActiva: string;
  alCambiarSeccion: (seccion: string) => void;
  usuario: User;
  alCerrarSesion: () => void;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  seccionActiva,
  alCambiarSeccion,
  usuario,
  alCerrarSesion,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const menuItems = [
    {
      id: "dashboard",
      nombre: "Inicio",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "incidentes",
      nombre: "Incidentes",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      id: "configuracion",
      nombre: "Configuración",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1 1 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "zonas",
      nombre: "Editar zonas",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10a2 2 0 002 2h6m4-12h2a2 2 0 012 2v2m-6 6h2a2 2 0 002-2v-2M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"
          />
        </svg>
      ),
    },
    {
      id: "reportes",
      nombre: "Reportes",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "ayuda",
      nombre: "Ayuda",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "perfil",
      nombre: "Perfil",
      icono: (
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-64 bg-[#41413d] text-white h-screen flex flex-col shadow-lg sidebar-fixed">
      <div className="p-6 border-b border-gray-600">
        <h2 className="text-xl font-semibold">Sistema Municipal</h2>
        <p className="text-sm text-gray-300 mt-1">
          {usuario.role === "controlador" ? "Operador" : "Inspector"}
        </p>
      </div>

      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium">
              {usuario.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {usuario.role === "controlador" ? "Operador" : "Inspector"}
            </p>
            <p className="text-xs text-gray-400">{usuario.username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={() => alCambiarSeccion(item.id)}
              className={`w-full text-left px-6 py-3 transition-colors duration-200 flex items-center ${
                seccionActiva === item.id
                  ? "text-white bg-[#4a4945]"
                  : "text-gray-300 hover:text-white hover:bg-[#4a4945] hover:bg-opacity-70"
              }`}
            >
              {item.icono}
              {item.nombre}
            </button>
            <div
              className={`absolute left-0 top-0 h-full w-1 bg-[#00d8bd] transition-transform duration-200 transform origin-top ${
                hoveredItem === item.id ? "scale-y-100" : "scale-y-0"
              }`}
            />
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-600">
        <button
          onClick={alCerrarSesion}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 text-white hover:bg-red-900 rounded transition-colors duration-200"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default SimpleSidebar;
