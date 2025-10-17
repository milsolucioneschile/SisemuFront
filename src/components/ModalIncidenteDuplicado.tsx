import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Warning,
  Phone,
  Visibility,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { AgregarLlamadaRecurrente } from './seguimiento';

interface ModalIncidenteDuplicadoProps {
  open: boolean;
  onClose: () => void;
  incidenteExistente: any;
  datosNuevoIncidente: any;
  usuario: any;
  onAgregarLlamadaRecurrente: (incidenteId: number) => void;
  onCrearNuevoIncidente: () => void;
  soloLlamadaRecurrente?: boolean;
}

const ModalIncidenteDuplicado: React.FC<ModalIncidenteDuplicadoProps> = ({
  open,
  onClose,
  incidenteExistente,
  datosNuevoIncidente,
  usuario,
  onAgregarLlamadaRecurrente,
  onCrearNuevoIncidente,
  soloLlamadaRecurrente = false,
}) => {
  const [mostrarFormularioLlamada, setMostrarFormularioLlamada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarHistorialCompleto, setMostrarHistorialCompleto] = useState(false);

  const handleAgregarLlamadaRecurrente = () => {
    setMostrarFormularioLlamada(true);
  };

  const handleLlamadaAgregada = () => {
    setMostrarFormularioLlamada(false);
    if (incidenteExistente?.id) {
      onAgregarLlamadaRecurrente(incidenteExistente.id);
    }
    onClose();
  };

  const handleCrearNuevoIncidente = async () => {
    setCargando(true);
    try {
      await onCrearNuevoIncidente();
      onClose();
    } finally {
      setCargando(false);
    }
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      'Pendiente': 'default',
      'Abierto': 'primary',
      'En Proceso': 'warning',
      'Resuelto': 'success',
      'Cerrado': 'info',
      'Cancelado': 'error',
    };
    return colores[estado] || 'default';
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: '#fff3cd',
        borderBottom: '1px solid #ffeaa7'
      }}>
        <Warning color="warning" />
        <Typography variant="h6" component="div">
          Incidente Similar Detectado
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!mostrarFormularioLlamada ? (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Se ha detectado un incidente similar que ya existe en el sistema. 
                Revise los detalles y elija una de las opciones disponibles.
              </Typography>
            </Alert>

            {/* Información del incidente existente */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Incidente Existente #{incidenteExistente?.id || 'N/A'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={incidenteExistente?.estado || 'N/A'}
                  color={obtenerColorEstado(incidenteExistente?.estado || 'N/A') as any}
                  size="small"
                />
                <Chip
                  label={`RUT: ${incidenteExistente?.rutLlamante || 'N/A'}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Typography variant="body2" gutterBottom>
                <strong>Descripción:</strong> {incidenteExistente?.descripcion || 'N/A'}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Dirección:</strong> {incidenteExistente?.direccionIncidente || 'N/A'}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Fecha del Incidente:</strong> {incidenteExistente?.fechaHoraIncidente ? formatearFecha(incidenteExistente.fechaHoraIncidente) : 'N/A'}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Llamante:</strong> {incidenteExistente?.nombreLlamante || 'N/A'} - {incidenteExistente?.telefonoLlamante || 'N/A'}
              </Typography>

              {incidenteExistente?.latitud && incidenteExistente?.longitud && (
                <Typography variant="body2" gutterBottom>
                  <strong>Coordenadas:</strong> {incidenteExistente.latitud.toFixed(6)}, {incidenteExistente.longitud.toFixed(6)}
                </Typography>
              )}
            </Paper>

            {/* Botón para mostrar historial completo */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setMostrarHistorialCompleto(!mostrarHistorialCompleto)}
                startIcon={mostrarHistorialCompleto ? <ExpandLess /> : <ExpandMore />}
                size="small"
              >
                {mostrarHistorialCompleto ? 'Ocultar Historial Completo' : 'Ver Historial Completo'}
                {datosNuevoIncidente?.incidentesSimilares?.length > 1 && (
                  <Chip 
                    label={`${datosNuevoIncidente.incidentesSimilares.length} incidentes`} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Button>
            </Box>

            {/* Historial completo de incidentes similares */}
            {mostrarHistorialCompleto && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="info">
                  Historial Completo de Incidentes Similares
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {datosNuevoIncidente?.incidentesSimilares?.map((incidente: any, index: number) => (
                    <Box key={incidente.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Incidente #{incidente.id} - {incidente.estado}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Descripción:</strong> {incidente.descripcion}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Dirección:</strong> {incidente.direccionIncidente}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Fecha:</strong> {formatearFecha(incidente.fechaHoraIncidente)}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Llamante:</strong> {incidente.nombreLlamante} - {incidente.telefonoLlamante}
                      </Typography>
                      
                      {incidente.latitud && incidente.longitud && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Coordenadas:</strong> {incidente.latitud.toFixed(6)}, {incidente.longitud.toFixed(6)}
                        </Typography>
                      )}
                      
                      {index < (datosNuevoIncidente?.incidentesSimilares?.length || 0) - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Información del nuevo incidente */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Nuevo Incidente a Registrar
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Descripción:</strong> {datosNuevoIncidente?.descripcion || 'N/A'}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Dirección:</strong> {datosNuevoIncidente?.direccionIncidente || 'N/A'}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>Llamante:</strong> {datosNuevoIncidente?.nombreLlamante || 'N/A'} - {datosNuevoIncidente?.telefonoLlamante || 'N/A'}
              </Typography>
            </Paper>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              {soloLlamadaRecurrente ? 'Agregar Llamada Recurrente' : '¿Qué desea hacer?'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  border: '2px solid #4caf50'
                }}
                onClick={handleAgregarLlamadaRecurrente}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone color="success" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                      Agregar Llamada Recurrente
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registrar esta llamada como una nueva comunicación relacionada al incidente existente #{incidenteExistente?.id || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {!soloLlamadaRecurrente && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    border: '2px solid #2196f3'
                  }}
                  onClick={handleCrearNuevoIncidente}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Visibility color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        Crear Nuevo Incidente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registrar como un incidente completamente nuevo (recomendado solo si es diferente)
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Agregar Llamada Recurrente al Incidente #{incidenteExistente?.id || 'N/A'}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Complete los datos de la nueva llamada relacionada con este incidente.
            </Alert>

            <AgregarLlamadaRecurrente
              incidenteId={incidenteExistente?.id || 0}
              usuario={usuario}
              onLlamadaAgregada={handleLlamadaAgregada}
              onCancelar={() => setMostrarFormularioLlamada(false)}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        {!mostrarFormularioLlamada && (
          <>
            <Button
              onClick={onClose}
              startIcon={<Close />}
              color="inherit"
            >
              Cancelar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalIncidenteDuplicado;
