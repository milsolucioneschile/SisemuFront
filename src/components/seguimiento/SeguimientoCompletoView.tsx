import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import {
  Timeline,
  Comment,
  SwapHoriz,
  Phone,
  AttachFile,
  Info,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { SeguimientoCompleto, User, EventoTimeline } from '../../types';
import AgregarComentario from './AgregarComentario';
import ListaComentarios from './ListaComentarios';
import CambiarEstado from './CambiarEstado';
import HistorialEstados from './HistorialEstados';
import AgregarLlamadaRecurrente from './AgregarLlamadaRecurrente';
import ListaLlamadasRecurrentes from './ListaLlamadasRecurrentes';

interface SeguimientoCompletoProps {
  incidenteId: number;
  usuario: User;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`seguimiento-tabpanel-${index}`}
      aria-labelledby={`seguimiento-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SeguimientoCompletoView: React.FC<SeguimientoCompletoProps> = ({
  incidenteId,
  usuario,
}) => {
  const [seguimiento, setSeguimiento] = useState<SeguimientoCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActual, setTabActual] = useState(0);

  const cargarSeguimiento = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await api.obtenerSeguimientoCompleto(incidenteId);
      setSeguimiento(datos);
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, [incidenteId]);

  useEffect(() => {
    cargarSeguimiento();
  }, [incidenteId, cargarSeguimiento]);

  const handleComentarioAgregado = (comentario: any) => {
    if (seguimiento) {
      setSeguimiento({
        ...seguimiento,
        comentarios: [...seguimiento.comentarios, comentario],
      });
    }
  };

  const handleEstadoCambiado = (respuesta: any) => {
    if (seguimiento) {
      // Actualizar el estado del incidente
      const incidenteActualizado = {
        ...seguimiento.incidente,
        estado: respuesta.estadoNuevo,
      };

      // Si hay comentario, agregarlo a la lista
      let comentariosActualizados = seguimiento.comentarios;
      if (respuesta.tieneComentario && respuesta.comentarioId) {
        // El comentario ya debería estar incluido en la respuesta del backend
        // Aquí podríamos recargar los comentarios o manejar la actualización
      }

      setSeguimiento({
        ...seguimiento,
        incidente: incidenteActualizado,
        comentarios: comentariosActualizados,
      });

      // Recargar el historial de estados
      cargarSeguimiento();
    }
  };

  const handleLlamadaAgregada = (llamada: any) => {
    if (seguimiento) {
      setSeguimiento({
        ...seguimiento,
        llamadasRecurrentes: [...seguimiento.llamadasRecurrentes, llamada],
      });
    }
  };

  const generarTimeline = (): EventoTimeline[] => {
    if (!seguimiento) return [];

    const eventos: EventoTimeline[] = [];

    // Agregar comentarios
    seguimiento.comentarios.forEach((comentario) => {
      eventos.push({
        id: `comentario-${comentario.id}`,
        tipo: 'comentario',
        fecha: comentario.fechaCreacion,
        usuario: comentario.nombreUsuario,
        titulo: 'Comentario',
        descripcion: comentario.contenido,
        datos: comentario,
      });
    });

    // Agregar cambios de estado
    seguimiento.historialEstados.forEach((cambio) => {
      eventos.push({
        id: `estado-${cambio.id}`,
        tipo: 'cambio_estado',
        fecha: cambio.fechaCambio,
        usuario: cambio.nombreUsuario,
        titulo: 'Cambio de Estado',
        descripcion: `${cambio.estadoAnterior} → ${cambio.estadoNuevo}`,
        datos: cambio,
      });
    });

    // Agregar llamadas recurrentes
    seguimiento.llamadasRecurrentes.forEach((llamada) => {
      eventos.push({
        id: `llamada-${llamada.id}`,
        tipo: 'llamada',
        fecha: llamada.fechaHoraLlamada,
        usuario: llamada.operadorNombre,
        titulo: 'Llamada Recurrente',
        descripcion: `Llamada de ${llamada.nombreLlamante}`,
        datos: llamada,
      });
    });

    // Ordenar por fecha (más reciente primero)
    return eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
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

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando seguimiento del incidente...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error al cargar el seguimiento: {error}
      </Alert>
    );
  }

  if (!seguimiento) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se encontró información de seguimiento para este incidente.
      </Alert>
    );
  }

  const timeline = generarTimeline();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Resumen del Incidente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Info sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2">
              Seguimiento del Incidente #{seguimiento.incidente.id}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 400px' }}>
              <Typography variant="h6" gutterBottom>
                {seguimiento.incidente.descripcion}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Tipo:</strong> {seguimiento.incidente.tipo}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Dirección:</strong> {seguimiento.incidente.direccionIncidente}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Llamante:</strong> {seguimiento.incidente.nombreLlamante} - {seguimiento.incidente.telefonoLlamante}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  <strong>Estado:</strong>
                </Typography>
                <Chip
                  label={seguimiento.incidente.estado}
                  color={obtenerColorEstado(seguimiento.incidente.estado) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Fecha Incidente:</strong> {new Date(seguimiento.incidente.fechaHoraIncidente).toLocaleString('es-ES')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Fecha Registro:</strong> {new Date(seguimiento.incidente.fechaHoraRegistro).toLocaleString('es-ES')}
              </Typography>
              {seguimiento.incidente.inspectorAsignado && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Inspector:</strong> {seguimiento.incidente.inspectorAsignado}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs de Seguimiento */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabActual}
            onChange={(e, newValue) => setTabActual(newValue)}
            aria-label="seguimiento tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Timeline />}
              label={`Timeline (${timeline.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<Comment />}
              label={`Comentarios (${seguimiento.comentarios.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<SwapHoriz />}
              label={`Estados (${seguimiento.historialEstados.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<Phone />}
              label={`Llamadas (${seguimiento.llamadasRecurrentes.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<AttachFile />}
              label={`Archivos (${seguimiento.archivosAdjuntos.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Timeline */}
        <TabPanel value={tabActual} index={0}>
          <Typography variant="h6" gutterBottom>
            Timeline de Eventos
          </Typography>
          {timeline.length === 0 ? (
            <Alert severity="info">
              No hay eventos registrados para este incidente.
            </Alert>
          ) : (
            <Box>
              {timeline.map((evento) => (
                <Paper
                  key={evento.id}
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderLeft: 4,
                    borderLeftColor: evento.tipo === 'comentario' ? 'primary.main' : 
                                   evento.tipo === 'cambio_estado' ? 'secondary.main' :
                                   evento.tipo === 'llamada' ? 'info.main' : 'default.main',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={evento.titulo}
                      size="small"
                      color={evento.tipo === 'comentario' ? 'primary' : 
                             evento.tipo === 'cambio_estado' ? 'secondary' :
                             evento.tipo === 'llamada' ? 'info' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(evento.fecha).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>{evento.usuario}:</strong> {evento.descripcion}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Tab Comentarios */}
        <TabPanel value={tabActual} index={1}>
          <AgregarComentario
            incidenteId={incidenteId}
            usuario={usuario}
            onComentarioAgregado={handleComentarioAgregado}
            onError={setError}
          />
          <ListaComentarios
            comentarios={seguimiento.comentarios}
            cargando={false}
          />
        </TabPanel>

        {/* Tab Estados */}
        <TabPanel value={tabActual} index={2}>
          <CambiarEstado
            incidenteId={incidenteId}
            estadoActual={seguimiento.incidente.estado}
            usuario={usuario}
            onEstadoCambiado={handleEstadoCambiado}
            onError={setError}
          />
          <HistorialEstados
            historial={seguimiento.historialEstados}
            cargando={false}
          />
        </TabPanel>

        {/* Tab Llamadas */}
        <TabPanel value={tabActual} index={3}>
          <AgregarLlamadaRecurrente
            incidenteId={incidenteId}
            usuario={usuario}
            onLlamadaAgregada={handleLlamadaAgregada}
            onError={setError}
          />
          <ListaLlamadasRecurrentes
            llamadas={seguimiento.llamadasRecurrentes}
            cargando={false}
          />
        </TabPanel>

        {/* Tab Archivos */}
        <TabPanel value={tabActual} index={4}>
          <Typography variant="h6" gutterBottom>
            Archivos Adjuntos ({seguimiento.archivosAdjuntos.length})
          </Typography>
          {seguimiento.archivosAdjuntos.length === 0 ? (
            <Alert severity="info">
              No hay archivos adjuntos para este incidente.
            </Alert>
          ) : (
            <Box>
              {seguimiento.archivosAdjuntos.map((archivo) => (
                <Paper
                  key={archivo.id}
                  elevation={1}
                  sx={{ p: 2, mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {archivo.nombreOriginal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {archivo.tipoArchivo} • {archivo.tamañoFormateado} • {archivo.nombreUsuario}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(archivo.fechaSubida).toLocaleString('es-ES')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

export default SeguimientoCompletoView;
