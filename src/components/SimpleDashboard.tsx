import React from "react";
import { User } from "../types";

interface SimpleDashboardProps {
  usuario: User;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Bienvenido al Sistema de Gestión Municipal
      </h1>
    </div>
  );
};

export default SimpleDashboard;
