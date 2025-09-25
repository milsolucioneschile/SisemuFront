import { useState, useCallback } from 'react';
import axios from 'axios';

export type TipoIncidente = 
  | 'Seguridad'
  | 'Ambulancia'
  | 'Bomberos'
  | 'Robo a Persona'
  | 'Robo a Vehículo'
  | 'Robo a Casa'
  | 'Violencia Intrafamiliar'
  | 'Actividad Sospechosa'
  | 'Accidente Vehicular'
  | 'Drogas'
  | 'Disturbios'
  | 'Robo de Cables'
  | 'Robo Mascotas'
  | 'Persona Extraviada'
  | 'Ruidos Molestos';

export type EstadoIncidente = 'Pendiente' | 'Abierto' | 'Cerrado';

export interface Inspector {
  id: string;
  nombre: string;
  rut: string;
  disponible: boolean;
}

export interface FormularioOperador {
  descripcion: string;
  tipoIncidente: TipoIncidente | '';
  fechaHoraIncidente: string;
  direccionIncidente: string;
  referencias: string;
  inspectorAsignado: string;
}

export interface FormularioInspector {
  descripcion: string;
  tipoIncidente: TipoIncidente | '';
  fechaHoraIncidente: string;
  direccionIncidente: string;
  referencias: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  rut: string;
  rol: 'Operador' | 'Inspector';
}

export const useIncidentForm = (usuario: Usuario) => {
  const [formularioOperador, setFormularioOperador] = useState<FormularioOperador>({
    descripcion: '',
    tipoIncidente: '',
    fechaHoraIncidente: new Date().toISOString().slice(0, 16),
    direccionIncidente: '',
    referencias: '',
    inspectorAsignado: ''
  });

  const [formularioInspector, setFormularioInspector] = useState<FormularioInspector>({
    descripcion: '',
    tipoIncidente: '',
    fechaHoraIncidente: new Date().toISOString().slice(0, 16),
    direccionIncidente: '',
    referencias: ''
  });

  const [inspectoresDisponibles, setInspectoresDisponibles] = useState<Inspector[]>([]);
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});

  const apiClient = axios.create({
    baseURL: 'https://localhost:7297/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  });

  const tiposIncidente: TipoIncidente[] = [
    'Seguridad',
    'Ambulancia',
    'Bomberos',
    'Robo a Persona',
    'Robo a Vehículo',
    'Robo a Casa',
    'Violencia Intrafamiliar',
    'Actividad Sospechosa',
    'Accidente Vehicular',
    'Drogas',
    'Disturbios',
    'Robo de Cables',
    'Robo Mascotas',
    'Persona Extraviada',
    'Ruidos Molestos'
  ];

  const cargarInspectoresDisponibles = useCallback(async () => {
    try {
      setCargando(true);
      const response = await apiClient.get('/Incidentes/inspectores-disponibles');
      setInspectoresDisponibles(response.data);
    } catch (error) {
      console.error('Error cargando inspectores:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  const validarFormularioOperador = (datos: FormularioOperador): Record<string, string> => {
    const errores: Record<string, string> = {};

    if (!datos.descripcion.trim()) {
      errores.descripcion = 'La descripción es requerida';
    }

    if (!datos.tipoIncidente) {
      errores.tipoIncidente = 'El tipo de incidente es requerido';
    }

    if (!datos.fechaHoraIncidente) {
      errores.fechaHoraIncidente = 'La fecha y hora del incidente es requerida';
    }

    if (!datos.direccionIncidente.trim()) {
      errores.direccionIncidente = 'La dirección del incidente es requerida';
    }

    return errores;
  };

  const validarFormularioInspector = (datos: FormularioInspector): Record<string, string> => {
    const errores: Record<string, string> = {};

    if (!datos.descripcion.trim()) {
      errores.descripcion = 'La descripción es requerida';
    }

    if (!datos.tipoIncidente) {
      errores.tipoIncidente = 'El tipo de incidente es requerido';
    }

    if (!datos.fechaHoraIncidente) {
      errores.fechaHoraIncidente = 'La fecha y hora del incidente es requerida';
    }

    if (!datos.direccionIncidente.trim()) {
      errores.direccionIncidente = 'La dirección del incidente es requerida';
    }

    return errores;
  };

  const enviarFormularioOperador = useCallback(async (onSuccess?: () => void) => {
    const errores = validarFormularioOperador(formularioOperador);
    setErroresValidacion(errores);

    if (Object.keys(errores).length > 0) {
      return false;
    }

    try {
      setCargando(true);
      await apiClient.post('/Incidentes', formularioOperador);
      
      setFormularioOperador({
        descripcion: '',
        tipoIncidente: '',
        fechaHoraIncidente: new Date().toISOString().slice(0, 16),
        direccionIncidente: '',
        referencias: '',
        inspectorAsignado: ''
      });

      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error creando incidente:', error);
      return false;
    } finally {
      setCargando(false);
    }
  }, [formularioOperador]);

  const enviarFormularioInspector = useCallback(async (onSuccess?: () => void) => {
    const errores = validarFormularioInspector(formularioInspector);
    setErroresValidacion(errores);

    if (Object.keys(errores).length > 0) {
      return false;
    }

    try {
      setCargando(true);
      await apiClient.post('/Incidentes', formularioInspector);
      
      setFormularioInspector({
        descripcion: '',
        tipoIncidente: '',
        fechaHoraIncidente: new Date().toISOString().slice(0, 16),
        direccionIncidente: '',
        referencias: ''
      });

      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error creando incidente:', error);
      return false;
    } finally {
      setCargando(false);
    }
  }, [formularioInspector]);

  const limpiarErrores = useCallback(() => {
    setErroresValidacion({});
  }, []);

  return {
    formularioOperador,
    formularioInspector,
    setFormularioOperador,
    setFormularioInspector,
    inspectoresDisponibles,
    cargando,
    erroresValidacion,
    tiposIncidente,
    cargarInspectoresDisponibles,
    enviarFormularioOperador,
    enviarFormularioInspector,
    limpiarErrores,
    validarFormularioOperador,
    validarFormularioInspector
  };
};

export default useIncidentForm;