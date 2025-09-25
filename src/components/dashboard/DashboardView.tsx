import React from "react";
import { Incident } from "../../types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  incidents: Incident[];
  userName?: string;
  userRole?: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  userName,
  userRole,
}) => {
  const getEstado = (i: Incident) => (i.estado || i.status || "").toString();

  const total = incidents.length;
  const pendientes = incidents.filter((i) => /pend/i.test(getEstado(i))).length;
  const enProgreso = incidents.filter((i) =>
    /progre|abiert/i.test(getEstado(i))
  ).length;
  const cerrados = incidents.filter((i) =>
    /cerrad|resuelt/i.test(getEstado(i))
  ).length;

  const byDate = new Map<string, number>();
  incidents.forEach((i) => {
    const d = new Date(i.fechaHoraRegistro || i.createdDate || Date.now());
    const key = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).toLocaleDateString("es-CL");
    byDate.set(key, (byDate.get(key) || 0) + 1);
  });
  const labels = Array.from(byDate.keys());
  const values = Array.from(byDate.values());

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Eventos por día",
        data: values,
        fill: false,
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14,165,233,0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  } as const;

  const zonas: Record<string, number> = {};
  const categorias: Record<string, number> = {};
  incidents.forEach((i) => {
    const z = (i.zona || "Zona 1").toString();
    zonas[z] = (zonas[z] || 0) + 1;
    const c = (
      i.categoryName ||
      i.nombreCategoria ||
      "Sin categoría"
    ).toString();
    categorias[c] = (categorias[c] || 0) + 1;
  });
  const zonasOrdenadas = Object.entries(zonas)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 10);
  const categoriasOrdenadas = Object.entries(categorias)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 10);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow p-4 mb-6 border border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Hola, {userRole === "controlador" ? "Operador" : "Inspector"}{" "}
                {userName || ""}
              </h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}{" "}
                •{" "}
                {new Date().getHours() < 12
                  ? "Buenos días"
                  : new Date().getHours() < 19
                  ? "Buenas tardes"
                  : "Buenas noches"}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="p-2 hover:bg-gray-50 rounded-lg relative"
              aria-label="Notificaciones"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600">
              {userRole ? userRole.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
      </div>

      <div className=" flex flex-col flex-1 bg-white rounded-xl shadow p-6 mb-6 ">
        <div className="flex  gap-6">
          <div className="lg:w-1/3 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Resumen de eventos
            </h3>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total eventos</p>
                  <h3 className="text-2xl font-bold text-gray-800">{total}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pendientes</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {pendientes}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">En progreso</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {enProgreso}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Cerrados</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {cerrados}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className=" flex flex-col bg-white rounded-lg border border-gray-200 p-4 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Mapa de calor
            </h3>
            <div className="bg-gray-100 rounded-lg h-full min-h-[250px] flex items-center justify-center text-gray-400">
              Mapa de calor de incidentes
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Análisis de incidentes
        </h2>

        <div className="flex flex-row lg:flex-row gap-4">
          <div className="lg:w-1/3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Tendencia</h3>
              <select className="text-xs border rounded px-2 py-1">
                <option>30 días</option>
                <option>7 días</option>
                <option>90 días</option>
              </select>
            </div>
            <div className="h-56 w-full">
              <Line
                data={lineChartData}
                options={{
                  ...options,
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Por zona
                </h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  Ver todo
                </button>
              </div>
              <div className="space-y-3">
                {zonasOrdenadas.map(([zona, cantidad]) => (
                  <div
                    key={zona}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg
                          className="w-3 h-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{zona}</span>
                    </div>
                    <span className="font-medium">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 3: Por categoría */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Por categoría
                </h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  Ver todo
                </button>
              </div>
              <div className="space-y-3">
                {categoriasOrdenadas.map(([categoria, cantidad], index) => {
                  const colors = [
                    "bg-blue-100 text-blue-600",
                    "bg-green-100 text-green-600",
                    "bg-yellow-100 text-yellow-600",
                    "bg-red-100 text-red-600",
                    "bg-purple-100 text-purple-600",
                  ];
                  const icons = [
                    <path
                      key="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />,
                    <path
                      key="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />,
                    <path
                      key="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />,
                    <path
                      key="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />,
                  ];

                  return (
                    <div
                      key={categoria}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                            colors[index % colors.length]
                          }`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {icons[index % icons.length]}
                          </svg>
                        </div>
                        <span className="text-gray-700">{categoria}</span>
                      </div>
                      <span className="font-medium">{cantidad}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
