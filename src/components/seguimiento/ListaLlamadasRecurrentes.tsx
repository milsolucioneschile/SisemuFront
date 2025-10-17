import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { Phone, Person, Schedule, Message } from '@mui/icons-material';
import { LlamadaRecurrente } from '../../types';

interface ListaLlamadasRecurrentesProps {
  llamadas: LlamadaRecurrente[];
  cargando?: boolean;
}

const ListaLlamadasRecurrentes: React.FC<ListaLlamadasRecurrentesProps> = ({
  llamadas,
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
            <Typography>Cargando llamadas recurrentes...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (llamadas.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Phone sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              No hay llamadas recurrentes registradas
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
          <Phone sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Llamadas Recurrentes ({llamadas.length})
          </Typography>
        </Box>

        <List sx={{ width: '100%' }}>
          {llamadas.map((llamada, index) => (
            <React.Fragment key={llamada.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <Phone fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {llamada.nombreLlamante}
                      </Typography>
                      <Chip
                        label={llamada.telefonoLlamante}
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatearFecha(llamada.fechaHoraLlamada)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        {llamada.rutLlamante && (
                          <Chip
                            label={`RUT: ${llamada.rutLlamante}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`Operador: ${llamada.operadorNombre}`}
                          color="secondary"
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {llamada.descripcionAdicional && (
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
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            Descripción:
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {llamada.descripcionAdicional}
                          </Typography>
                        </Paper>
                      )}

                      {llamada.comentarios && (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            mb: 1,
                            bgcolor: 'warning.light',
                            border: '1px solid',
                            borderColor: 'warning.main',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Message sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              Comentarios del Operador:
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {llamada.comentarios}
                          </Typography>
                        </Paper>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        Registrado: {formatearFecha(llamada.fechaRegistro)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < llamadas.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ListaLlamadasRecurrentes;
