import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  Person,
  DirectionsCar,
  Refresh,
  CheckCircle,
  Cancel,
  MyLocation,
} from '@mui/icons-material';
import { api } from '../services/api';

interface InspectorSugeridoProps {
  latitud: number;
  longitud: number;
  inspectorSeleccionado: string;
  onInspectorChange: (inspectorId: string) => void;
  direccionIncidente: string;
}

const InspectorSugerido: React.FC<InspectorSugeridoProps> = ({
  latitud,
  longitud,
  inspectorSeleccionado,
  onInspectorChange,
  direccionIncidente,
}) => {
  const [inspectorCercano, setInspectorCercano] = useState<any>(null);
  const [inspectoresDisponibles, setInspectoresDisponibles] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarListaCompleta, setMostrarListaCompleta] = useState(false);

  const cargarInspectorCercano = async () => {
    if (!latitud || !longitud) return;

    setCargando(true);
    setError(null);

    try {
      // Obtener inspector más cercano
      const resultado = await api.obtenerInspectorMasCercano(latitud, longitud);
      
      if (resultado) {
        setInspectorCercano(resultado);
        
        // Si no hay inspector seleccionado, sugerir el más cercano
        if (!inspectorSeleccionado) {
          onInspectorChange(resultado.inspector.id.toString());
        }
      }

      // Obtener lista completa de inspectores con distancias
      const inspectores = await api.obtenerInspectoresConUbicacion();
      setInspectoresDisponibles(inspectores);
    } catch (err) {
      console.error('Error cargando inspector cercano:', err);
      setError('No se pudo obtener la información de inspectores');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInspectorCercano();
  }, [latitud, longitud]);

  const handleSeleccionarInspector = (inspectorId: string) => {
    onInspectorChange(inspectorId);
    setMostrarListaCompleta(false);
  };

  const handleRefrescar = () => {
    cargarInspectorCercano();
  };

  const obtenerColorDisponibilidad = (disponible: boolean) => {
    return disponible ? 'success' : 'error';
  };

  const obtenerIconoDisponibilidad = (disponible: boolean) => {
    return disponible ? <CheckCircle /> : <Cancel />;
  };

  const formatearDistancia = (distancia: number) => {
    if (distancia < 1000) {
      return `${Math.round(distancia)} m`;
    } else {
      return `${(distancia / 1000).toFixed(1)} km`;
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MyLocation color="primary" />
          <Typography variant="h6" component="h3">
            Asignación de Inspector
          </Typography>
          <Tooltip title="Actualizar ubicación">
            <IconButton size="small" onClick={handleRefrescar} disabled={cargando}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {cargando && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Calculando inspector más cercano...
            </Typography>
          </Box>
        )}

        {inspectorCercano && !cargando && (
          <>
            {/* Inspector Sugerido */}
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => handleSeleccionarInspector(inspectorCercano.inspector.id.toString())}
                  disabled={inspectorSeleccionado === inspectorCercano.inspector.id.toString()}
                >
                  {inspectorSeleccionado === inspectorCercano.inspector.id.toString() ? 'Seleccionado' : 'Seleccionar'}
                </Button>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Inspector Sugerido: {inspectorCercano.inspector.nombre}
                  </Typography>
                  <Typography variant="body2">
                    <DirectionsCar sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {inspectorCercano.distanciaFormateada} desde el incidente
                  </Typography>
                </Box>
              </Box>
            </Alert>

            {/* Información de Ubicación */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                <strong>Ubicación del Incidente:</strong>
              </Typography>
              <Typography variant="body2" sx={{ ml: 3 }}>
                {direccionIncidente}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                Coordenadas: {latitud.toFixed(6)}, {longitud.toFixed(6)}
              </Typography>
            </Box>

            {/* Lista de Inspectores Disponibles */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Todos los Inspectores Disponibles
                </Typography>
                <Button
                  size="small"
                  onClick={() => setMostrarListaCompleta(!mostrarListaCompleta)}
                >
                  {mostrarListaCompleta ? 'Ocultar' : 'Ver Todos'}
                </Button>
              </Box>

              {mostrarListaCompleta && (
                <List dense>
                  {inspectoresDisponibles.map((inspector, index) => (
                    <React.Fragment key={inspector.id}>
                      <ListItem
                        sx={{
                          bgcolor: inspectorSeleccionado === inspector.id.toString() ? 'primary.50' : 'transparent',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => handleSeleccionarInspector(inspector.id.toString())}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {inspector.nombre}
                              </Typography>
                              <Chip
                                icon={obtenerIconoDisponibilidad(inspector.disponible)}
                                label={inspector.disponible ? 'Disponible' : 'Ocupado'}
                                color={obtenerColorDisponibilidad(inspector.disponible)}
                                size="small"
                                variant="outlined"
                              />
                              {inspector.distancia && (
                                <Chip
                                  icon={<DirectionsCar />}
                                  label={formatearDistancia(inspector.distancia)}
                                  color="info"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            inspector.latitud && inspector.longitud ? (
                              <Typography variant="caption" color="text.secondary">
                                Ubicación: {inspector.latitud.toFixed(4)}, {inspector.longitud.toFixed(4)}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin ubicación registrada
                              </Typography>
                            )
                          }
                        />
                        <ListItemSecondaryAction>
                          {inspectorSeleccionado === inspector.id.toString() && (
                            <CheckCircle color="primary" />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < inspectoresDisponibles.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>

            {/* Inspector Actualmente Seleccionado */}
            {inspectorSeleccionado && (
              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                  Inspector Asignado:
                </Typography>
                {(() => {
                  const inspectorSeleccionadoData = inspectoresDisponibles.find(
                    i => i.id.toString() === inspectorSeleccionado
                  );
                  return inspectorSeleccionadoData ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="success" />
                      <Typography variant="body2" fontWeight="medium">
                        {inspectorSeleccionadoData.nombre}
                      </Typography>
                      {inspectorSeleccionadoData.distancia && (
                        <Chip
                          icon={<DirectionsCar />}
                          label={formatearDistancia(inspectorSeleccionadoData.distancia)}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Inspector ID: {inspectorSeleccionado}
                    </Typography>
                  );
                })()}
              </Box>
            )}
          </>
        )}

        {!inspectorCercano && !cargando && !error && (
          <Alert severity="warning">
            <Typography variant="body2">
              No se encontraron inspectores con ubicación registrada. 
              Seleccione manualmente un inspector de la lista.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InspectorSugerido;
