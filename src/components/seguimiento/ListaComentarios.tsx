import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from '@mui/material';
import { Comment, Person } from '@mui/icons-material';
import { ComentarioIncidente } from '../../types';

interface ListaComentariosProps {
  comentarios: ComentarioIncidente[];
  cargando?: boolean;
}

const ListaComentarios: React.FC<ListaComentariosProps> = ({
  comentarios,
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

  const esComentarioDeCambioEstado = (comentario: ComentarioIncidente) => {
    return comentario.historialEstadoId !== null && comentario.historialEstadoId !== undefined;
  };

  if (cargando) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando comentarios...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (comentarios.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Comment sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              No hay comentarios para este incidente
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
          <Comment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Comentarios ({comentarios.length})
          </Typography>
        </Box>

        <List sx={{ width: '100%' }}>
          {comentarios.map((comentario, index) => (
            <React.Fragment key={comentario.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: obtenerColorTipoUsuario(comentario.tipoUsuario) + '.main',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {obtenerIniciales(comentario.nombreUsuario)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {comentario.nombreUsuario}
                      </Typography>
                      <Chip
                        label={comentario.tipoUsuario}
                        color={obtenerColorTipoUsuario(comentario.tipoUsuario) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {esComentarioDeCambioEstado(comentario) && (
                        <Chip
                          label="Cambio de Estado"
                          variant="outlined"
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {comentario.contenido}
                      </Typography>
                      {esComentarioDeCambioEstado(comentario) && (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            mb: 1,
                            bgcolor: 'info.light',
                            border: '1px solid',
                            borderColor: 'info.main',
                          }}
                        >
                          <Typography variant="caption" color="info.dark">
                            <strong>Cambio de Estado:</strong> {comentario.estadoAnterior} → {comentario.estadoNuevo}
                          </Typography>
                        </Paper>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatearFecha(comentario.fechaCreacion)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < comentarios.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ListaComentarios;
