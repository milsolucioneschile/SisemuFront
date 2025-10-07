import axios from "axios";
import {
  User,
  LoginRequest,
  LoginResponse,
  Incident,
  Zona,
  CrearZonaDto,
  ActualizarZonaDto,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://localhost:7007/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const mapToIncident = (i: any): Incident => {
  const id = i.id ?? i.Id;
  const descripcion = i.descripcion ?? i.Descripcion ?? "";
  const tipo = i.tipo ?? i.Tipo ?? "General";
  const estado = i.estado ?? i.Estado ?? "Pendiente";
  const direccion = i.direccionIncidente ?? i.DireccionIncidente ?? "";
  const categoriaNombre = i.categoria ?? i.Categoria ?? undefined;
  const inspectorNombre =
    i.inspectorAsignado ?? i.InspectorAsignado ?? undefined;
  const operadorNombre = i.operador ?? i.Operador ?? undefined;
  const fechaRegistro =
    i.fechaHoraRegistro ??
    i.FechaHoraRegistro ??
    i.createdDate ??
    i.CreatedDate ??
    new Date().toISOString();
  const fechaIncidente =
    i.fechaHoraIncidente ?? i.FechaHoraIncidente ?? fechaRegistro;

  return {
    id: Number(id),
    numeroTicket: `INC-${id}`,
    nombreCiudadano:
      i.nombreCiudadano ?? i.citizenName ?? operadorNombre ?? "N/A",
    emailCiudadano:
      i.emailCiudadano ?? i.citizenEmail ?? "noreply@sistema.local",
    telefonoCiudadano: i.telefonoCiudadano ?? i.citizenPhone,
    rutPersona: i.rutPersona ?? "",
    direccionIncidente: direccion,
    idCategoria: i.categoriaId ?? i.CategoriaId ?? 0,
    nombreCategoria: categoriaNombre,
    tipoIncidente: tipo,
    descripcion: descripcion,
    referencias: i.referencias ?? i.Referencias ?? "",
    estado: estado,
    idInspectorAsignado: i.inspectorAsignadoId ?? i.InspectorAsignadoId,
    nombreInspectorAsignado: inspectorNombre,
    idOperadorRegistro: i.operadorId ?? i.OperadorId,
    nombreOperadorRegistro: operadorNombre,
    fechaHoraIncidente:
      typeof fechaIncidente === "string"
        ? fechaIncidente
        : new Date(fechaIncidente).toISOString(),
    fechaHoraRegistro:
      typeof fechaRegistro === "string"
        ? fechaRegistro
        : new Date(fechaRegistro).toISOString(),
    fechaCreacion:
      i.fechaCreacion ??
      i.createdDate ??
      i.FechaHoraRegistro ??
      new Date().toISOString(),
    fechaActualizacion:
      i.fechaActualizacion ??
      i.updatedDate ??
      i.FechaHoraRegistro ??
      new Date().toISOString(),

    ticketNumber: `INC-${id}`,
    citizenName: i.citizenName ?? i.nombreCiudadano ?? operadorNombre ?? "N/A",
    citizenEmail: i.citizenEmail ?? i.emailCiudadano ?? "noreply@sistema.local",
    citizenPhone: i.citizenPhone ?? i.telefonoCiudadano,
    address: direccion,
    categoryId: i.categoryId ?? i.categoriaId ?? i.CategoriaId ?? 0,
    categoryName: categoriaNombre,
    description: descripcion,
    status: estado,
    zona: i.zona ?? i.Zona ?? "Zona1",
    assignedInspectorId:
      i.assignedInspectorId ?? i.inspectorAsignadoId ?? i.InspectorAsignadoId,
    assignedInspectorName: inspectorNombre,
    createdDate:
      typeof fechaRegistro === "string"
        ? fechaRegistro
        : new Date(fechaRegistro).toISOString(),
    updatedDate:
      i.updatedDate ??
      (typeof fechaRegistro === "string"
        ? fechaRegistro
        : new Date(fechaRegistro).toISOString()),
  } as Incident;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      throw new Error(
        "No se puede conectar con el servidor. Verifique que la API esté ejecutándose en https://localhost:7007"
      );
    }
    throw error;
  }
);

const usuariosMock: User[] = [
  {
    id: 1,
    username: "operador1",
    role: "controlador",
    fullName: "Operador Sistema",
    nombreUsuario: "operador1",
    rol: "controlador",
    nombreCompleto: "Operador Sistema",
  },
  {
    id: 1,
    username: "inspector1",
    role: "inspector",
    fullName: "Inspector 1",
    nombreUsuario: "inspector1",
    rol: "inspector",
    nombreCompleto: "Inspector 1",
  },
  {
    id: 2,
    username: "inspector2",
    role: "inspector",
    fullName: "Inspector 2",
    nombreUsuario: "inspector2",
    rol: "inspector",
    nombreCompleto: "Inspector 2",
  },
];

const retraso = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface CrearIncidenteDto {
  descripcion: string;
  tipo: string;
  fechaHoraIncidente: string;
  direccionIncidente: string;
  referencias?: string;
  operadorId?: number;
  inspectorAsignadoId?: number;
  latitud: number;
  longitud: number;
}

export interface ActualizarIncidenteDto {
  descripcion: string;
  tipo: string;
  fechaHoraIncidente: string;
  direccionIncidente: string;
  referencias?: string;
  latitud: number;
  longitud: number;
  inspectorAsignadoId?: number;
}

export interface Inspector {
  id: number;
  nombre: string;
  rut: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CrearInspectorDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
}

export interface ActualizarInspectorDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  activo: boolean;
  disponible: boolean;
}

export interface CrearOperadorDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
}

export interface ActualizarOperadorDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  activo: boolean;
}

export const api = {
  async login(credenciales: LoginRequest): Promise<LoginResponse> {
    await retraso(500);

    const usuario = usuariosMock.find(
      (u) =>
        u.username === credenciales.username &&
        credenciales.password === "pass123"
    );

    if (!usuario) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    return { user: usuario, usuario: usuario };
  },

  async obtenerIncidentes(
    rolUsuario?: string,
    usuarioId?: number
  ): Promise<Incident[]> {
    try {
      let url = "/Incidentes";
      if (rolUsuario && usuarioId) {
        const response = await apiClient.get("/Incidentes/mis", {
          params: {
            rol: rolUsuario === "controlador" ? "operador" : rolUsuario,
            usuarioId: usuarioId,
          },
        });
        const arr = Array.isArray(response.data) ? response.data : [];
        return arr.map(mapToIncident);
      }

      const response = await apiClient.get(url);
      const arr = Array.isArray(response.data) ? response.data : [];
      return arr.map(mapToIncident);
    } catch (error) {
      console.error("❌ Error obteniendo incidentes:", error);

      if ((error as any)?.response?.status === 400) {
        throw new Error(
          "Error en la solicitud: verifique el rol y el usuario enviados."
        );
      }
      throw new Error(
        "No se pudieron obtener los incidentes. Verifique la conexión con el backend."
      );
    }
  },

  async obtenerIncidentesAsignados(inspectorId: number): Promise<Incident[]> {
    try {
      const response = await apiClient.get("/Incidentes/asignados", {
        params: {
          inspectorId: inspectorId,
        },
      });
      const arr = Array.isArray(response.data) ? response.data : [];
      return arr.map(mapToIncident);
    } catch (error) {
      console.error("❌ Error obteniendo incidentes asignados:", error);
      if ((error as any)?.response?.status === 400) {
        throw new Error(
          "Error en la solicitud: verifique el ID del inspector."
        );
      }
      throw new Error(
        "No se pudieron obtener los incidentes asignados. Verifique la conexión con el backend."
      );
    }
  },

  async obtenerIncidente(id: number): Promise<Incident> {
    try {
      const response = await apiClient.get(`/Incidentes/${id}`);
      return mapToIncident(response.data);
    } catch (error) {
      console.error("❌ Error obteniendo incidente de la API:", error);
      throw new Error("No se puede obtener el incidente.");
    }
  },

  async crearIncidente(dto: CrearIncidenteDto): Promise<any> {
    try {
      const response = await apiClient.post("/Incidentes", dto);
      console.log("✅ Incidente creado en la base de datos:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando incidente en la API:", error);
      throw new Error(
        "No se pudo crear el incidente. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async actualizarIncidente(
    id: number,
    dto: ActualizarIncidenteDto
  ): Promise<void> {
    try {
      await apiClient.put(`/Incidentes/${id}`, dto);
      console.log("✅ Incidente actualizado en la base de datos:", id);
    } catch (error) {
      console.error("❌ Error actualizando incidente en la API:", error);
      throw new Error(
        "No se pudo actualizar el incidente. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async eliminarIncidente(id: number): Promise<void> {
    try {
      await apiClient.delete(`/Incidentes/${id}`);
      console.log("✅ Incidente eliminado de la base de datos:", id);
    } catch (error) {
      console.error("❌ Error eliminando incidente en la API:", error);
      throw new Error(
        "No se pudo eliminar el incidente. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async obtenerInspectoresDisponibles(): Promise<Inspector[]> {
    const response = await apiClient.get("/Incidentes/inspectores-disponibles");
    return response.data || [];
  },

  async obtenerCategorias(): Promise<Categoria[]> {
    const response = await apiClient.get("/Incidentes/categorias");
    return response.data || [];
  },

  async obtenerInspectores(): Promise<any[]> {
    try {
      const response = await apiClient.get("/Inspectores");
      return response.data || [];
    } catch (error) {
      console.error("❌ Error obteniendo inspectores de la API:", error);
      throw new Error(
        "No se pueden obtener los inspectores de la base de datos"
      );
    }
  },

  async obtenerInspector(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`/Inspectores/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo inspector de la API:", error);
      throw new Error("No se puede obtener el inspector de la base de datos");
    }
  },

  async crearInspector(dto: CrearInspectorDto): Promise<any> {
    try {
      const response = await apiClient.post("/Inspectores", dto);
      console.log("✅ Inspector creado en la base de datos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creando inspector en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo crear el inspector. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async actualizarInspector(
    id: number,
    dto: ActualizarInspectorDto
  ): Promise<void> {
    try {
      await apiClient.put(`/Inspectores/${id}`, dto);
      console.log("✅ Inspector actualizado en la base de datos:", id);
    } catch (error: any) {
      console.error("❌ Error actualizando inspector en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo actualizar el inspector. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async eliminarInspector(id: number): Promise<void> {
    try {
      await apiClient.delete(`/Inspectores/${id}`);
      console.log("✅ Inspector eliminado de la base de datos:", id);
    } catch (error: any) {
      console.error("❌ Error eliminando inspector en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo eliminar el inspector. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async obtenerOperadores(): Promise<any[]> {
    try {
      const response = await apiClient.get("/Operadores");
      return response.data || [];
    } catch (error) {
      console.error("❌ Error obteniendo operadores de la API:", error);
      throw new Error(
        "No se pueden obtener los operadores de la base de datos"
      );
    }
  },

  async obtenerOperador(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`/Operadores/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo operador de la API:", error);
      throw new Error("No se puede obtener el operador de la base de datos");
    }
  },

  async crearOperador(dto: CrearOperadorDto): Promise<any> {
    try {
      const response = await apiClient.post("/Operadores", dto);
      console.log("✅ Operador creado en la base de datos:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creando operador en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo crear el operador. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async actualizarOperador(
    id: number,
    dto: ActualizarOperadorDto
  ): Promise<void> {
    try {
      await apiClient.put(`/Operadores/${id}`, dto);
      console.log("✅ Operador actualizado en la base de datos:", id);
    } catch (error: any) {
      console.error("❌ Error actualizando operador en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo actualizar el operador. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async eliminarOperador(id: number): Promise<void> {
    try {
      await apiClient.delete(`/Operadores/${id}`);
      console.log("✅ Operador eliminado de la base de datos:", id);
    } catch (error: any) {
      console.error("❌ Error eliminando operador en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo eliminar el operador. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  // --- ZONAS ---
  async obtenerZonas(): Promise<Zona[]> {
    try {
      const response = await apiClient.get("/Zonas");
      return (response.data || []) as Zona[];
    } catch (error: any) {
      console.error("❌ Error obteniendo zonas de la API:", error);
      throw new Error("No se pueden obtener las zonas de la base de datos");
    }
  },

  async obtenerZona(id: number): Promise<Zona> {
    try {
      const response = await apiClient.get(`/Zonas/${id}`);
      return response.data as Zona;
    } catch (error: any) {
      console.error("❌ Error obteniendo zona de la API:", error);
      throw new Error("No se puede obtener la zona de la base de datos");
    }
  },

  async crearZona(dto: CrearZonaDto): Promise<Zona> {
    try {
      const response = await apiClient.post("/Zonas", dto);
      return response.data as Zona;
    } catch (error: any) {
      console.error("❌ Error creando zona en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo crear la zona. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async actualizarZona(id: number, dto: ActualizarZonaDto): Promise<void> {
    try {
      await apiClient.put(`/Zonas/${id}`, dto);
    } catch (error: any) {
      console.error("❌ Error actualizando zona en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo actualizar la zona. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },

  async eliminarZona(id: number): Promise<void> {
    try {
      await apiClient.delete(`/Zonas/${id}`);
    } catch (error: any) {
      console.error("❌ Error eliminando zona en la API:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "No se pudo eliminar la zona. Verifique que el backend esté ejecutándose en https://localhost:7007"
      );
    }
  },
};
