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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DashboardStatsProps = {
  incidents: Incident[];
  userRole?: string;
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  incidents,
  userRole,
}) => {
  const incidentsByDate = incidents.reduce((acc, incident) => {
    const date = new Date(incident.fechaHoraRegistro).toLocaleDateString(
      "es-CL"
    );
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {} as Record<string, number>);

  const incidentsByStatus = incidents.reduce((acc, incident) => {
    if (!acc[incident.estado]) {
      acc[incident.estado] = 0;
    }
    acc[incident.estado]++;
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = {
    labels: Object.keys(incidentsByDate),
    datasets: [
      {
        label: "Incidentes por día",
        data: Object.values(incidentsByDate),
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Evolución de Incidentes",
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Panel de Control{" "}
        {userRole
          ? `- ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
          : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Total de Incidentes
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {incidents.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-500">
            {incidentsByStatus["Pendiente"] || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Resueltos</h3>
          <p className="mt-2 text-3xl font-bold text-green-500">
            {incidentsByStatus["Cerrado"] || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Line data={lineChartData} options={options} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mapa de Calor
            </h3>
            <p className="text-gray-500 mb-4">(En construcción)</p>
            <div className="bg-gray-100 p-12 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-400">Visualización de calor por zonas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
