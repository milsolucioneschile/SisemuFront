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
