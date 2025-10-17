import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

interface VerificacionTiempoReal {
  rut: {
    existe: boolean;
    incidentesAnteriores?: any[];
    totalLlamadas?: number;
  };
  telefono: {
    existe: boolean;
    incidentesAnteriores?: any[];
    totalLlamadas?: number;
  };
  direccion: {
    existe: boolean;
    incidentesAnteriores?: any[];
    totalIncidentes?: number;
  };
}

interface UseVerificacionTiempoRealProps {
  rut: string;
  telefono: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  debounceMs?: number;
}

export const useVerificacionTiempoReal = ({
  rut,
  telefono,
  direccion,
  latitud,
  longitud,
  debounceMs = 1000,
}: UseVerificacionTiempoRealProps) => {
  const [verificaciones, setVerificaciones] = useState<VerificacionTiempoReal>({
    rut: { existe: false },
    telefono: { existe: false },
    direccion: { existe: false },
  });
  
  const [cargando, setCargando] = useState({
    rut: false,
    telefono: false,
    direccion: false,
  });

  const timeouts = useRef<{
    rut: NodeJS.Timeout | null;
    telefono: NodeJS.Timeout | null;
    direccion: NodeJS.Timeout | null;
  }>({
    rut: null,
    telefono: null,
    direccion: null,
  });

  const verificarRut = useCallback(async (rutValue: string) => {
    if (!rutValue || rutValue.length < 8) {
      setVerificaciones(prev => ({ ...prev, rut: { existe: false } }));
      return;
    }

    setCargando(prev => ({ ...prev, rut: true }));
    try {
      const resultado = await api.verificarRutExistente(rutValue);
      setVerificaciones(prev => ({ ...prev, rut: resultado }));
    } catch (error) {
      console.error('Error verificando RUT:', error);
      setVerificaciones(prev => ({ ...prev, rut: { existe: false } }));
    } finally {
      setCargando(prev => ({ ...prev, rut: false }));
    }
  }, []);

  const verificarTelefono = useCallback(async (telefonoValue: string) => {
    if (!telefonoValue || telefonoValue.length < 8) {
      setVerificaciones(prev => ({ ...prev, telefono: { existe: false } }));
      return;
    }

    setCargando(prev => ({ ...prev, telefono: true }));
    try {
      const resultado = await api.verificarTelefonoExistente(telefonoValue);
      setVerificaciones(prev => ({ ...prev, telefono: resultado }));
    } catch (error) {
      console.error('Error verificando teléfono:', error);
      setVerificaciones(prev => ({ ...prev, telefono: { existe: false } }));
    } finally {
      setCargando(prev => ({ ...prev, telefono: false }));
    }
  }, []);

  const verificarDireccion = useCallback(async (direccionValue: string, lat?: number, lng?: number) => {
    if (!direccionValue || direccionValue.length < 10) {
      setVerificaciones(prev => ({ ...prev, direccion: { existe: false } }));
      return;
    }

    setCargando(prev => ({ ...prev, direccion: true }));
    try {
      const resultado = await api.verificarDireccionExistente(direccionValue, lat, lng);
      setVerificaciones(prev => ({ ...prev, direccion: resultado }));
    } catch (error) {
      console.error('Error verificando dirección:', error);
      setVerificaciones(prev => ({ ...prev, direccion: { existe: false } }));
    } finally {
      setCargando(prev => ({ ...prev, direccion: false }));
    }
  }, []);

  // Efecto para RUT con debounce
  useEffect(() => {
    if (timeouts.current.rut) {
      clearTimeout(timeouts.current.rut);
    }

    timeouts.current.rut = setTimeout(() => {
      verificarRut(rut);
    }, debounceMs);

    return () => {
      if (timeouts.current.rut) {
        clearTimeout(timeouts.current.rut);
      }
    };
  }, [rut, verificarRut, debounceMs]);

  // Efecto para teléfono con debounce
  useEffect(() => {
    if (timeouts.current.telefono) {
      clearTimeout(timeouts.current.telefono);
    }

    timeouts.current.telefono = setTimeout(() => {
      verificarTelefono(telefono);
    }, debounceMs);

    return () => {
      if (timeouts.current.telefono) {
        clearTimeout(timeouts.current.telefono);
      }
    };
  }, [telefono, verificarTelefono, debounceMs]);

  // Efecto para dirección con debounce
  useEffect(() => {
    if (timeouts.current.direccion) {
      clearTimeout(timeouts.current.direccion);
    }

    timeouts.current.direccion = setTimeout(() => {
      verificarDireccion(direccion, latitud, longitud);
    }, debounceMs);

    return () => {
      if (timeouts.current.direccion) {
        clearTimeout(timeouts.current.direccion);
      }
    };
  }, [direccion, latitud, longitud, verificarDireccion, debounceMs]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const tieneAlertas = verificaciones.rut.existe || verificaciones.telefono.existe || verificaciones.direccion.existe;
  
  const totalLlamadasRecurrentes = (verificaciones.rut.totalLlamadas || 0) + 
                                  (verificaciones.telefono.totalLlamadas || 0) + 
                                  (verificaciones.direccion.totalIncidentes || 0);

  return {
    verificaciones,
    cargando,
    tieneAlertas,
    totalLlamadasRecurrentes,
    verificarRut,
    verificarTelefono,
    verificarDireccion,
  };
};
