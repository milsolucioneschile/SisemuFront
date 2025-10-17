export type TipoIncidente =
  | "Seguridad"
  | "Ambulancia"
  | "Bomberos"
  | "Robo a Persona"
  | "Robo a Vehículo"
  | "Robo a Casa"
  | "Violencia Intrafamiliar"
  | "Actividad Sospechosa"
  | "Accidente Vehicular"
  | "Drogas"
  | "Disturbios"
  | "Robo de Cables"
  | "Robo Mascotas"
  | "Persona Extraviada"
  | "Ruidos Molestos";

export interface Incidente {
  id: number;
  numeroTicket: string;
  nombreCiudadano: string;
  emailCiudadano: string;
  telefonoCiudadano?: string;
  rutPersona: string;
  direccionIncidente: string;
  idCategoria: number;
  nombreCategoria?: string;
  tipoIncidente: TipoIncidente;
  descripcion: string;
  referencias: string;
  estado: "Pendiente" | "Abierto" | "Cerrado";
  idInspectorAsignado?: number;
  nombreInspectorAsignado?: string;
  idOperadorRegistro?: number;
  nombreOperadorRegistro?: string;
  fechaHoraIncidente: string;
  fechaHoraRegistro: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  zona?: string;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  rol: "controlador" | "inspector";
  nombreCompleto: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface SolicitudLogin {
  nombreUsuario: string;
  contrasena: string;
}

export interface RespuestaLogin {
  usuario: Usuario;
  token?: string;
}

export interface Incident extends Incidente {
  ticketNumber: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  address: string;
  categoryId: number;
  categoryName?: string;
  description: string;
  status: "Pendiente" | "Abierto" | "Cerrado";
  assignedInspectorId?: number;
  assignedInspectorName?: string;
  createdDate: string;
  updatedDate: string;
  zona?: string;
}

export interface User extends Usuario {
  username: string;
  role: "controlador" | "inspector";
  fullName: string;
}

export interface Category extends Categoria {
  name: string;
}

export interface LoginRequest extends SolicitudLogin {
  username: string;
  password: string;
}

export interface LoginResponse extends RespuestaLogin {
  user: User;
}

// Zonas geográficas
export interface Zona {
  id: number;
  nombre: string;
  descripcion?: string;
  // Coordenadas del polígono en orden, como pares lat/lng
  vertices: { lat: number; lng: number }[];
  colorHex?: string;
  activa: boolean;
  creadaEn?: string;
  actualizadaEn?: string;
}

export interface CrearZonaDto {
  nombre: string;
  descripcion?: string;
  vertices: { lat: number; lng: number }[];
  colorHex?: string;
  activa: boolean;
}

export interface ActualizarZonaDto {
  nombre: string;
  descripcion?: string;
  vertices: { lat: number; lng: number }[];
  colorHex?: string;
  activa: boolean;
}

// ===== TIPOS PARA SEGUIMIENTO DE INCIDENTES =====

// Estados disponibles para incidentes
export type EstadoIncidente = 
  | "Pendiente" 
  | "Abierto" 
  | "En Proceso" 
  | "Resuelto" 
  | "Cerrado" 
  | "Cancelado";

// Tipos de usuario para seguimiento
export type TipoUsuarioSeguimiento = "operador" | "inspector" | "admin";

// Comentarios de incidentes
export interface ComentarioIncidente {
  id: number;
  incidenteId: number;
  contenido: string;
  fechaCreacion: string;
  usuarioId: number;
  tipoUsuario: TipoUsuarioSeguimiento;
  nombreUsuario: string;
  historialEstadoId?: number | null;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
}

// DTO para crear comentarios
export interface CrearComentarioDto {
  contenido: string;
  usuarioId: number;
  tipoUsuario: TipoUsuarioSeguimiento;
  nombreUsuario: string;
}

// Historial de cambios de estado
export interface HistorialEstado {
  id: number;
  incidenteId: number;
  estadoAnterior: string;
  estadoNuevo: EstadoIncidente;
  comentario?: string | null;
  fechaCambio: string;
  tipoUsuario: TipoUsuarioSeguimiento;
  nombreUsuario: string;
}

// DTO para cambiar estado
export interface CambiarEstadoDto {
  estadoNuevo: EstadoIncidente;
  comentario?: string;
  usuarioId: number;
  tipoUsuario: TipoUsuarioSeguimiento;
  nombreUsuario: string;
}

// Respuesta de cambio de estado
export interface RespuestaCambioEstado {
  mensaje: string;
  estadoAnterior: string;
  estadoNuevo: EstadoIncidente;
  fechaCambio: string;
  comentario?: string | null;
  comentarioId?: number | null;
  historialId: number;
  tieneComentario: boolean;
}

// Llamadas recurrentes
export interface LlamadaRecurrente {
  id: number;
  incidenteId: number;
  fechaHoraLlamada: string;
  nombreLlamante: string;
  rutLlamante: string;
  telefonoLlamante: string;
  descripcionAdicional?: string;
  comentarios?: string;
  fechaRegistro: string;
  operadorId: number;
  operadorNombre: string;
}

// DTO para crear llamada recurrente
export interface CrearLlamadaRecurrenteDto {
  fechaHoraLlamada: string;
  nombreLlamante: string;
  rutLlamante: string;
  telefonoLlamante: string;
  descripcionAdicional?: string;
  comentarios?: string;
  operadorId: number;
}

// Archivos adjuntos (ya implementado en backend)
export interface ArchivoAdjunto {
  id: number;
  incidenteId: number;
  nombreOriginal: string;
  nombreArchivo: string;
  tipoArchivo: 'imagen' | 'video' | 'audio';
  extension: string;
  tamañoBytes: number;
  tamañoFormateado: string;
  urlArchivo: string;
  descripcion?: string;
  fechaSubida: string;
  usuarioId: number;
  tipoUsuario: TipoUsuarioSeguimiento;
  nombreUsuario: string;
}

// Seguimiento completo de un incidente
export interface SeguimientoCompleto {
  incidente: {
    id: number;
    descripcion: string;
    tipo: string;
    estado: EstadoIncidente;
    fechaHoraIncidente: string;
    fechaHoraRegistro: string;
    direccionIncidente: string;
    latitud: number;
    longitud: number;
    zona?: string;
    nombreLlamante: string;
    rutLlamante: string;
    telefonoLlamante: string;
    categoria?: string;
    operador?: string;
    inspectorAsignado?: string;
  };
  historialEstados: HistorialEstado[];
  comentarios: ComentarioIncidente[];
  archivosAdjuntos: ArchivoAdjunto[];
  llamadasRecurrentes: LlamadaRecurrente[];
}

// Eventos del timeline unificado
export interface EventoTimeline {
  id: string;
  tipo: 'comentario' | 'cambio_estado' | 'llamada' | 'archivo';
  fecha: string;
  usuario: string;
  titulo: string;
  descripcion: string;
  datos?: any; // Datos específicos del tipo de evento
}
