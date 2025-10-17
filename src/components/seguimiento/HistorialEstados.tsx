import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { SwapHoriz, Person, Schedule } from '@mui/icons-material';
import { HistorialEstado } from '../../types';

interface HistorialEstadosProps {
  historial: HistorialEstado[];
  cargando?: boolean;
}

const HistorialEstados: React.FC<HistorialEstadosProps> = ({
  historial,
  cargando = false,
}) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Abierto':
        return 'info';
      case 'En Proceso':
        return 'primary';
      case 'Resuelto':
        return 'success';
      case 'Cerrado':
        return 'default';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const obtenerColorTipoUsuario = (tipoUsuario: string) => {
    switch (tipoUsuario) {
      case 'operador':
        return 'primary';
      case 'inspector':
        return 'secondary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const obtenerIniciales = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (cargando) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando historial de estados...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (historial.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <SwapHoriz sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              No hay cambios de estado registrados
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SwapHoriz sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Historial de Estados ({historial.length})
          </Typography>
        </Box>

        <Timeline>
          {historial.map((cambio, index) => (
            <TimelineItem key={cambio.id}>
              <TimelineSeparator>
                <TimelineDot
                  color={obtenerColorEstado(cambio.estadoNuevo) as any}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SwapHoriz fontSize="small" />
                </TimelineDot>
                {index < historial.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderLeft: 4,
                    borderLeftColor: `${obtenerColorEstado(cambio.estadoNuevo)}.main`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={cambio.estadoAnterior}
                      color={obtenerColorEstado(cambio.estadoAnterior) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      →
                    </Typography>
                    <Chip
                      label={cambio.estadoNuevo}
                      color={obtenerColorEstado(cambio.estadoNuevo) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: `${obtenerColorTipoUsuario(cambio.tipoUsuario)}.main`,
                        mr: 1,
                      }}
                    >
                      {obtenerIniciales(cambio.nombreUsuario)}
                    </Avatar>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {cambio.nombreUsuario}
                    </Typography>
                    <Chip
                      label={cambio.tipoUsuario}
                      color={obtenerColorTipoUsuario(cambio.tipoUsuario) as any}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatearFecha(cambio.fechaCambio)}
                    </Typography>
                  </Box>

                  {cambio.comentario && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        mt: 1,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{cambio.comentario}"
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default HistorialEstados;
