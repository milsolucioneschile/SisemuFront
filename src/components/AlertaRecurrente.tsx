import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Collapse,
  IconButton,
  Button,
} from '@mui/material';
import {
  Warning,
  Phone,
  Person,
  LocationOn,
  History,
  ExpandMore,
  ExpandLess,
  CallMade,
} from '@mui/icons-material';

interface AlertaRecurrenteProps {
  tipo: 'rut' | 'telefono' | 'direccion';
  datos: {
    existe: boolean;
    incidentesAnteriores?: any[];
    totalLlamadas?: number;
    totalIncidentes?: number;
  };
  onVerHistorial?: () => void;
  onAgregarLlamadaRecurrente?: (incidenteId: number) => void;
}

const AlertaRecurrente: React.FC<AlertaRecurrenteProps> = ({
  tipo,
  datos,
  onVerHistorial,
  onAgregarLlamadaRecurrente,
}) => {
  const [expandido, setExpandido] = React.useState(false);

  if (!datos.existe || !datos.incidentesAnteriores?.length) {
    return null;
  }

  const obtenerIcono = () => {
    switch (tipo) {
      case 'rut':
        return <Person />;
      case 'telefono':
        return <Phone />;
      case 'direccion':
        return <LocationOn />;
      default:
        return <Warning />;
    }
  };

  const obtenerTitulo = () => {
    switch (tipo) {
      case 'rut':
        return `RUT ya registrado anteriormente`;
      case 'telefono':
        return `Teléfono ya registrado anteriormente`;
      case 'direccion':
        return `Dirección con incidentes anteriores`;
      default:
        return `Registro recurrente detectado`;
    }
  };

  const obtenerDescripcion = () => {
    const total = datos.totalLlamadas || datos.totalIncidentes || datos.incidentesAnteriores?.length || 0;
    switch (tipo) {
      case 'rut':
        return `Esta persona ha realizado ${total} llamada${total > 1 ? 's' : ''} anteriormente.`;
      case 'telefono':
        return `Este teléfono ha sido usado en ${total} llamada${total > 1 ? 's' : ''} anterior${total > 1 ? 'es' : ''}.`;
      case 'direccion':
        return `Esta dirección ha tenido ${total} incidente${total > 1 ? 's' : ''} anterior${total > 1 ? 'es' : ''}.`;
      default:
        return `Se han detectado ${total} registro${total > 1 ? 's' : ''} similar${total > 1 ? 'es' : ''}.`;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL');
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

  return (
    <Alert 
      severity="warning" 
      icon={obtenerIcono()}
      sx={{ mb: 2 }}
      action={
        datos.incidentesAnteriores && datos.incidentesAnteriores.length > 0 && (
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )
      }
    >
      <AlertTitle>{obtenerTitulo()}</AlertTitle>
      <Typography variant="body2">
        {obtenerDescripcion()}
      </Typography>

      {datos.incidentesAnteriores && datos.incidentesAnteriores.length > 0 && (
        <Collapse in={expandido} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Incidentes Anteriores:
            </Typography>
            
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List dense>
                {datos.incidentesAnteriores.slice(0, 5).map((incidente, index) => (
                  <React.Fragment key={incidente.id}>
                    <ListItem
                      sx={{ 
                        py: 1,
                        flexDirection: 'column',
                        alignItems: 'stretch'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          <CallMade color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="bold">
                                #{incidente.id}
                              </Typography>
                              <Chip
                                label={incidente.estado}
                                color={obtenerColorEstado(incidente.estado) as any}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={incidente.tipo}
                                color="secondary"
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                <strong>Fecha:</strong> {formatearFecha(incidente.fechaHoraIncidente)}
                              </Typography>
                              <Typography variant="caption" display="block">
                                <strong>Descripción:</strong> {incidente.descripcion?.substring(0, 100)}
                                {incidente.descripcion?.length > 100 && '...'}
                              </Typography>
                              {incidente.inspectorAsignado && (
                                <Typography variant="caption" display="block">
                                  <strong>Inspector:</strong> {incidente.inspectorAsignado}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </Box>
                      
                      {/* Botones de acción específicos para este incidente */}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<History />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerHistorial?.();
                          }}
                          sx={{ fontSize: '0.75rem', py: 0.5 }}
                        >
                          Ver Historial
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CallMade />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAgregarLlamadaRecurrente?.(incidente.id);
                          }}
                          sx={{ fontSize: '0.75rem', py: 0.5 }}
                        >
                          Agregar Llamada
                        </Button>
                      </Box>
                    </ListItem>
                    {index < (datos.incidentesAnteriores?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {(datos.incidentesAnteriores?.length || 0) > 5 && (
                <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">
                    Y {(datos.incidentesAnteriores?.length || 0) - 5} incidente{(datos.incidentesAnteriores?.length || 0) - 5 > 1 ? 's' : ''} más...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Collapse>
      )}
    </Alert>
  );
};

export default AlertaRecurrente;
