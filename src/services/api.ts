import axios from "axios";
import {
  User,
  LoginRequest,
  LoginResponse,
  Incident,
  Zona,
  CrearZonaDto,
  ActualizarZonaDto,
  ComentarioIncidente,
  CrearComentarioDto,
  HistorialEstado,
  CambiarEstadoDto,
  RespuestaCambioEstado,
  LlamadaRecurrente,
  CrearLlamadaRecurrenteDto,
  ArchivoAdjunto,
  SeguimientoCompleto,
  EstadoIncidente,
  TipoUsuarioSeguimiento,
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

  // ===== SERVICIOS DE SEGUIMIENTO DE INCIDENTES =====

  // --- COMENTARIOS ---
  async obtenerComentarios(incidenteId: number): Promise<ComentarioIncidente[]> {
    try {
      const response = await apiClient.get(`/incidentes/${incidenteId}/comentarios`);
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error obteniendo comentarios:", error);
      throw new Error("No se pudieron obtener los comentarios del incidente");
    }
  },

  async agregarComentario(incidenteId: number, dto: CrearComentarioDto): Promise<ComentarioIncidente> {
    try {
      const response = await apiClient.post(`/incidentes/${incidenteId}/comentarios`, dto);
      console.log("✅ Comentario agregado:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error agregando comentario:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("No se pudo agregar el comentario");
    }
  },

  // --- CAMBIOS DE ESTADO ---
  async cambiarEstado(incidenteId: number, dto: CambiarEstadoDto): Promise<RespuestaCambioEstado> {
    try {
      const response = await apiClient.put(`/incidentes/${incidenteId}/cambiar-estado`, dto);
      console.log("✅ Estado cambiado:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error cambiando estado:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("No se pudo cambiar el estado del incidente");
    }
  },

  async obtenerHistorialEstados(incidenteId: number): Promise<HistorialEstado[]> {
    try {
      const response = await apiClient.get(`/incidentes/${incidenteId}/historial-estados`);
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error obteniendo historial de estados:", error);
      throw new Error("No se pudo obtener el historial de estados");
    }
  },

  // --- LLAMADAS RECURRENTES ---
  async obtenerLlamadasRecurrentes(incidenteId: number): Promise<LlamadaRecurrente[]> {
    try {
      const response = await apiClient.get(`/incidentes/${incidenteId}/llamadas-recurrentes`);
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error obteniendo llamadas recurrentes:", error);
      throw new Error("No se pudieron obtener las llamadas recurrentes");
    }
  },

  async agregarLlamadaRecurrente(incidenteId: number, dto: CrearLlamadaRecurrenteDto): Promise<LlamadaRecurrente> {
    try {
      const response = await apiClient.post(`/incidentes/${incidenteId}/llamadas-recurrentes`, dto);
      console.log("✅ Llamada recurrente agregada:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error agregando llamada recurrente:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("No se pudo agregar la llamada recurrente");
    }
  },

  // --- ARCHIVOS ADJUNTOS ---
  async obtenerArchivosAdjuntos(incidenteId: number): Promise<ArchivoAdjunto[]> {
    try {
      const response = await apiClient.get(`/incidentes/${incidenteId}/archivos`);
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error obteniendo archivos adjuntos:", error);
      throw new Error("No se pudieron obtener los archivos adjuntos");
    }
  },

  // --- SEGUIMIENTO COMPLETO ---
  async obtenerSeguimientoCompleto(incidenteId: number): Promise<SeguimientoCompleto> {
    try {
      const response = await apiClient.get(`/incidentes/${incidenteId}/seguimiento-completo`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error obteniendo seguimiento completo:", error);
      throw new Error("No se pudo obtener el seguimiento completo del incidente");
    }
  },

  // --- UTILIDADES ---
  obtenerEstadosDisponibles(): EstadoIncidente[] {
    return ["Pendiente", "Abierto", "En Proceso", "Resuelto", "Cerrado", "Cancelado"];
  },

  obtenerTiposUsuario(): TipoUsuarioSeguimiento[] {
    return ["operador", "inspector", "admin"];
  },

  // --- DETECCIÓN DE INCIDENTES DUPLICADOS ---
  async verificarIncidenteDuplicado(datosIncidente: any): Promise<{
    esRepetido: boolean;
    mensaje?: string;
    datosCoincidentes?: string[];
    incidentesSimilares?: any[];
  }> {
    try {
      const response = await apiClient.post('/Incidentes/evaluar-repetido', {
        rutLlamante: datosIncidente.rutLlamante,
        telefonoLlamante: datosIncidente.telefonoLlamante,
        latitud: datosIncidente.latitud || 0,
        longitud: datosIncidente.longitud || 0
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error verificando duplicado:", error);
      // Si hay error, asumimos que no es duplicado para no bloquear el flujo
      return { esRepetido: false };
    }
  },

  // --- VERIFICACIÓN EN TIEMPO REAL ---
  async verificarRutExistente(rut: string): Promise<{
    existe: boolean;
    incidentesAnteriores?: any[];
    totalLlamadas?: number;
  }> {
    try {
      if (!rut || rut.length < 8) return { existe: false };
      
      // Usar el endpoint real de evaluación de repetidos
      const response = await apiClient.post('/Incidentes/evaluar-repetido', {
        rutLlamante: rut,
        telefonoLlamante: "",
        latitud: 0,
        longitud: 0
      });
      
      if (response.data.esRepetido && response.data.incidentesSimilares) {
        return {
          existe: true,
          totalLlamadas: response.data.incidentesSimilares.length,
          incidentesAnteriores: response.data.incidentesSimilares.slice(0, 5) // Solo los primeros 5
        };
      }
      
      return { existe: false };
    } catch (error: any) {
      console.error("❌ Error verificando RUT:", error);
      return { existe: false };
    }
  },

  async verificarTelefonoExistente(telefono: string): Promise<{
    existe: boolean;
    incidentesAnteriores?: any[];
    totalLlamadas?: number;
  }> {
    try {
      if (!telefono || telefono.length < 8) return { existe: false };
      
      // Usar el endpoint real de evaluación de repetidos
      const response = await apiClient.post('/Incidentes/evaluar-repetido', {
        rutLlamante: "",
        telefonoLlamante: telefono,
        latitud: 0,
        longitud: 0
      });
      
      if (response.data.esRepetido && response.data.incidentesSimilares) {
        return {
          existe: true,
          totalLlamadas: response.data.incidentesSimilares.length,
          incidentesAnteriores: response.data.incidentesSimilares.slice(0, 5) // Solo los primeros 5
        };
      }
      
      return { existe: false };
    } catch (error: any) {
      console.error("❌ Error verificando teléfono:", error);
      return { existe: false };
    }
  },

  async verificarDireccionExistente(direccion: string, latitud?: number, longitud?: number): Promise<{
    existe: boolean;
    incidentesAnteriores?: any[];
    totalIncidentes?: number;
  }> {
    try {
      if (!direccion || direccion.length < 10) return { existe: false };
      
      // Usar el endpoint real de evaluación de repetidos
      const response = await apiClient.post('/Incidentes/evaluar-repetido', {
        rutLlamante: "",
        telefonoLlamante: "",
        latitud: latitud || 0,
        longitud: longitud || 0
      });
      
      if (response.data.esRepetido && response.data.incidentesSimilares) {
        return {
          existe: true,
          totalIncidentes: response.data.incidentesSimilares.length,
          incidentesAnteriores: response.data.incidentesSimilares.slice(0, 5) // Solo los primeros 5
        };
      }
      
      return { existe: false };
    } catch (error: any) {
      console.error("❌ Error verificando dirección:", error);
      return { existe: false };
    }
  },

  async obtenerHistorialLlamante(rut: string, telefono: string): Promise<{
    incidentes: any[];
    totalLlamadas: number;
    ultimaLlamada?: string;
    patronRecurrente: boolean;
  }> {
    try {
      // Usar el endpoint real de evaluación de repetidos
      const response = await apiClient.post('/Incidentes/evaluar-repetido', {
        rutLlamante: rut,
        telefonoLlamante: telefono,
        latitud: 0,
        longitud: 0
      });
      
      if (response.data.esRepetido && response.data.incidentesSimilares) {
        const incidentes = response.data.incidentesSimilares;
        const ultimaLlamada = incidentes.length > 0 ? incidentes[0].fechaHoraIncidente : undefined;
        
        return {
          incidentes,
          totalLlamadas: incidentes.length,
          ultimaLlamada,
          patronRecurrente: incidentes.length >= 3 // Considerar recurrente si tiene 3+ llamadas
        };
      }
      
      return { incidentes: [], totalLlamadas: 0, patronRecurrente: false };
    } catch (error: any) {
      console.error("❌ Error obteniendo historial:", error);
      return { incidentes: [], totalLlamadas: 0, patronRecurrente: false };
    }
  },

  // --- ASIGNACIÓN AUTOMÁTICA DE INSPECTORES ---
  async obtenerInspectorMasCercano(latitud: number, longitud: number): Promise<{
    inspector: any;
    distancia: number;
    distanciaFormateada: string;
  } | null> {
    try {
      const response = await apiClient.get('/inspectores/mas-cercano', {
        params: { latitud, longitud }
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error obteniendo inspector más cercano:", error);
      return null;
    }
  },

  async obtenerInspectoresConUbicacion(): Promise<Array<{
    id: number;
    nombre: string;
    latitud?: number;
    longitud?: number;
    distancia?: number;
    distanciaFormateada?: string;
    disponible: boolean;
  }>> {
    try {
      const response = await apiClient.get('/inspectores/con-ubicacion');
      return response.data || [];
    } catch (error: any) {
      console.error("❌ Error obteniendo inspectores con ubicación:", error);
      return [];
    }
  },

  async calcularDistanciaInspector(inspectorId: number, latitud: number, longitud: number): Promise<{
    distancia: number;
    distanciaFormateada: string;
  }> {
    try {
      const response = await apiClient.get(`/inspectores/${inspectorId}/distancia`, {
        params: { latitud, longitud }
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error calculando distancia:", error);
      return { distancia: 0, distanciaFormateada: 'N/A' };
    }
  },

  // Validaciones
  validarComentario(comentario: CrearComentarioDto): string[] {
    const errores: string[] = [];
    
    if (!comentario.contenido || comentario.contenido.trim().length === 0) {
      errores.push("El contenido del comentario es requerido");
    }
    
    if (comentario.contenido && comentario.contenido.length > 2000) {
      errores.push("El comentario no puede exceder 2000 caracteres");
    }
    
    if (!comentario.usuarioId || comentario.usuarioId <= 0) {
      errores.push("El ID del usuario es requerido");
    }
    
    if (!comentario.tipoUsuario || !this.obtenerTiposUsuario().includes(comentario.tipoUsuario)) {
      errores.push("El tipo de usuario es requerido y debe ser válido");
    }
    
    if (!comentario.nombreUsuario || comentario.nombreUsuario.trim().length === 0) {
      errores.push("El nombre del usuario es requerido");
    }
    
    return errores;
  },

  validarCambioEstado(cambioEstado: CambiarEstadoDto): string[] {
    const errores: string[] = [];
    
    if (!cambioEstado.estadoNuevo || !this.obtenerEstadosDisponibles().includes(cambioEstado.estadoNuevo)) {
      errores.push("El nuevo estado es requerido y debe ser válido");
    }
    
    if (cambioEstado.comentario && cambioEstado.comentario.length > 2000) {
      errores.push("El comentario no puede exceder 2000 caracteres");
    }
    
    if (!cambioEstado.usuarioId || cambioEstado.usuarioId <= 0) {
      errores.push("El ID del usuario es requerido");
    }
    
    if (!cambioEstado.tipoUsuario || !this.obtenerTiposUsuario().includes(cambioEstado.tipoUsuario)) {
      errores.push("El tipo de usuario es requerido y debe ser válido");
    }
    
    if (!cambioEstado.nombreUsuario || cambioEstado.nombreUsuario.trim().length === 0) {
      errores.push("El nombre del usuario es requerido");
    }
    
    return errores;
  },

  validarLlamadaRecurrente(llamada: CrearLlamadaRecurrenteDto): string[] {
    const errores: string[] = [];
    
    if (!llamada.fechaHoraLlamada) {
      errores.push("La fecha y hora de la llamada es requerida");
    }
    
    if (llamada.fechaHoraLlamada && new Date(llamada.fechaHoraLlamada) > new Date()) {
      errores.push("La fecha de la llamada no puede ser futura");
    }
    
    if (!llamada.nombreLlamante || llamada.nombreLlamante.trim().length === 0) {
      errores.push("El nombre del llamante es requerido");
    }
    
    if (!llamada.telefonoLlamante || llamada.telefonoLlamante.trim().length === 0) {
      errores.push("El teléfono del llamante es requerido");
    }
    
    if (!llamada.operadorId || llamada.operadorId <= 0) {
      errores.push("El ID del operador es requerido");
    }
    
    return errores;
  },
};
