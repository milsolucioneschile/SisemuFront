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
  Divider,
} from '@mui/material';
import { Comment, Send } from '@mui/icons-material';
import { api } from '../../services/api';
import { ComentarioIncidente, CrearComentarioDto, User } from '../../types';

interface AgregarComentarioProps {
  incidenteId: number;
  usuario: User;
  onComentarioAgregado: (comentario: ComentarioIncidente) => void;
  onError?: (error: string) => void;
}

const AgregarComentario: React.FC<AgregarComentarioProps> = ({
  incidenteId,
  usuario,
  onComentarioAgregado,
  onError,
}) => {
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenido.trim()) {
      setErrores(['El contenido del comentario es requerido']);
      return;
    }

    setCargando(true);
    setErrores([]);

    try {
      const dto: CrearComentarioDto = {
        contenido: contenido.trim(),
        usuarioId: Number(usuario.id),
        tipoUsuario: usuario.role === 'controlador' ? 'operador' : 'inspector',
        nombreUsuario: usuario.fullName || usuario.nombreCompleto,
      };

      // Validar antes de enviar
      const erroresValidacion = api.validarComentario(dto);
      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        return;
      }

      const nuevoComentario = await api.agregarComentario(incidenteId, dto);
      onComentarioAgregado(nuevoComentario);
      
      // Limpiar formulario
      setContenido('');
      
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

  const obtenerTipoUsuario = () => {
    return usuario.role === 'controlador' ? 'operador' : 'inspector';
  };

  const obtenerColorTipoUsuario = () => {
    switch (usuario.role) {
      case 'controlador':
        return 'primary';
      case 'inspector':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Comment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Agregar Comentario
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Usuario:
          </Typography>
          <Chip 
            label={usuario.fullName || usuario.nombreCompleto}
            color={obtenerColorTipoUsuario() as any}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip 
            label={obtenerTipoUsuario()}
            variant="outlined"
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
          <TextField
            fullWidth
            multiline
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            variant="outlined"
            disabled={cargando}
            sx={{ mb: 2 }}
            inputProps={{
              maxLength: 2000,
            }}
            helperText={`${contenido.length}/2000 caracteres`}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={cargando ? <CircularProgress size={20} /> : <Send />}
              disabled={cargando || !contenido.trim()}
              sx={{ minWidth: 120 }}
            >
              {cargando ? 'Enviando...' : 'Enviar'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgregarComentario;
