import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { SwapHoriz, Send } from '@mui/icons-material';
import { api } from '../../services/api';
import { CambiarEstadoDto, EstadoIncidente, User, RespuestaCambioEstado } from '../../types';

interface CambiarEstadoProps {
  incidenteId: number;
  estadoActual: string;
  usuario: User;
  onEstadoCambiado: (respuesta: RespuestaCambioEstado) => void;
  onError?: (error: string) => void;
}

const CambiarEstado: React.FC<CambiarEstadoProps> = ({
  incidenteId,
  estadoActual,
  usuario,
  onEstadoCambiado,
  onError,
}) => {
  const [estadoNuevo, setEstadoNuevo] = useState<EstadoIncidente | ''>('');
  const [comentario, setComentario] = useState('');
  const [incluirComentario, setIncluirComentario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const estadosDisponibles = api.obtenerEstadosDisponibles();
  const estadosFiltrados = estadosDisponibles.filter(estado => estado !== estadoActual);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estadoNuevo) {
      setErrores(['Debe seleccionar un nuevo estado']);
      return;
    }

    if (estadoNuevo === estadoActual) {
      setErrores(['El nuevo estado debe ser diferente al estado actual']);
      return;
    }

    setCargando(true);
    setErrores([]);

    try {
      const dto: CambiarEstadoDto = {
        estadoNuevo: estadoNuevo as EstadoIncidente,
        comentario: incluirComentario && comentario.trim() ? comentario.trim() : undefined,
        usuarioId: Number(usuario.id),
        tipoUsuario: usuario.role === 'controlador' ? 'operador' : 'inspector',
        nombreUsuario: usuario.fullName || usuario.nombreCompleto,
      };

      // Validar antes de enviar
      const erroresValidacion = api.validarCambioEstado(dto);
      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        return;
      }

      const respuesta = await api.cambiarEstado(incidenteId, dto);
      onEstadoCambiado(respuesta);
      
      // Limpiar formulario
      setEstadoNuevo('');
      setComentario('');
      setIncluirComentario(false);
      
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      setErrores([mensajeError]);
      if (onError) {
        onError(mensajeError);
      }
    } finally {
      setCargando(false);
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning'; // Naranja
      case 'En Proceso':
        return 'primary'; // Azul
      case 'Resuelto':
        return 'success'; // Verde
      case 'Cerrado':
        return 'grey'; // Gris claro
      case 'Cancelado':
        return 'error'; // Rojo
      default:
        return 'grey';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SwapHoriz sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Cambiar Estado
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Estado actual:
          </Typography>
          <Chip 
            label={estadoActual}
            color={obtenerColorEstado(estadoActual) as any}
            size="small"
          />
        </Box>

        {errores.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errores.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="estado-nuevo-label">Nuevo Estado</InputLabel>
            <Select
              labelId="estado-nuevo-label"
              value={estadoNuevo}
              onChange={(e) => setEstadoNuevo(e.target.value as EstadoIncidente)}
              label="Nuevo Estado"
              disabled={cargando}
            >
              {estadosFiltrados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={estado}
                      color={obtenerColorEstado(estado) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {estado}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={incluirComentario}
                onChange={(e) => setIncluirComentario(e.target.checked)}
                disabled={cargando}
              />
            }
            label="Incluir comentario sobre el cambio"
            sx={{ mb: incluirComentario ? 2 : 0 }}
          />

          {incluirComentario && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario sobre el cambio de estado (opcional)..."
              variant="outlined"
              disabled={cargando}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 2000,
              }}
              helperText={`${comentario.length}/2000 caracteres`}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={cargando ? <CircularProgress size={20} /> : <Send />}
              disabled={cargando || !estadoNuevo || estadoNuevo === estadoActual}
              sx={{ minWidth: 120 }}
            >
              {cargando ? 'Cambiando...' : 'Cambiar Estado'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CambiarEstado;
