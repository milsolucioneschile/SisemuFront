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
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import { Phone, Send, Add } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { api } from '../../services/api';
import { LlamadaRecurrente, CrearLlamadaRecurrenteDto, User } from '../../types';

interface AgregarLlamadaRecurrenteProps {
  incidenteId: number;
  usuario: User;
  onLlamadaAgregada: (llamada: LlamadaRecurrente) => void;
  onError?: (error: string) => void;
  onCancelar?: () => void;
}

const AgregarLlamadaRecurrente: React.FC<AgregarLlamadaRecurrenteProps> = ({
  incidenteId,
  usuario,
  onLlamadaAgregada,
  onError,
  onCancelar,
}) => {
  const [fechaHoraLlamada, setFechaHoraLlamada] = useState<Date | null>(new Date());
  const [nombreLlamante, setNombreLlamante] = useState('');
  const [rutLlamante, setRutLlamante] = useState('');
  const [telefonoLlamante, setTelefonoLlamante] = useState('');
  const [descripcionAdicional, setDescripcionAdicional] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [incluirComentarios, setIncluirComentarios] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaHoraLlamada) {
      setErrores(['La fecha y hora de la llamada es requerida']);
      return;
    }

    if (!nombreLlamante.trim()) {
      setErrores(['El nombre del llamante es requerido']);
      return;
    }

    if (!telefonoLlamante.trim()) {
      setErrores(['El teléfono del llamante es requerido']);
      return;
    }

    setCargando(true);
    setErrores([]);

    try {
      const dto: CrearLlamadaRecurrenteDto = {
        fechaHoraLlamada: fechaHoraLlamada.toISOString(),
        nombreLlamante: nombreLlamante.trim(),
        rutLlamante: rutLlamante.trim(),
        telefonoLlamante: telefonoLlamante.trim(),
        descripcionAdicional: descripcionAdicional.trim() || undefined,
        comentarios: incluirComentarios && comentarios.trim() ? comentarios.trim() : undefined,
        operadorId: Number(usuario.id),
      };

      // Validar antes de enviar
      const erroresValidacion = api.validarLlamadaRecurrente(dto);
      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        return;
      }

      const nuevaLlamada = await api.agregarLlamadaRecurrente(incidenteId, dto);
      onLlamadaAgregada(nuevaLlamada);
      
      // Limpiar formulario
      setFechaHoraLlamada(new Date());
      setNombreLlamante('');
      setRutLlamante('');
      setTelefonoLlamante('');
      setDescripcionAdicional('');
      setComentarios('');
      setIncluirComentarios(false);
      
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Phone sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Agregar Llamada Recurrente
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Operador:
          </Typography>
          <Chip 
            label={usuario.fullName || usuario.nombreCompleto}
            color="primary"
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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ mb: 2 }}>
              <DateTimePicker
                label="Fecha y Hora de la Llamada"
                value={fechaHoraLlamada}
                onChange={(newValue) => setFechaHoraLlamada(newValue)}
                disabled={cargando}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="Nombre del Llamante"
                value={nombreLlamante}
                onChange={(e) => setNombreLlamante(e.target.value)}
                required
                disabled={cargando}
                placeholder="Ej: María González"
              />
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="RUT del Llamante"
                value={rutLlamante}
                onChange={(e) => setRutLlamante(e.target.value)}
                disabled={cargando}
                placeholder="Ej: 12345678-9"
                helperText="Formato: 12345678-9"
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Teléfono del Llamante"
              value={telefonoLlamante}
              onChange={(e) => setTelefonoLlamante(e.target.value)}
              disabled={cargando}
              placeholder="Ej: +56 9 8765 4321"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción Adicional"
            value={descripcionAdicional}
            onChange={(e) => setDescripcionAdicional(e.target.value)}
            disabled={cargando}
            placeholder="Información adicional proporcionada por el llamante..."
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={incluirComentarios}
                onChange={(e) => setIncluirComentarios(e.target.checked)}
                disabled={cargando}
              />
            }
            label="Incluir comentarios del operador"
            sx={{ mb: incluirComentarios ? 2 : 0 }}
          />

          {incluirComentarios && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentarios del Operador"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={cargando}
              placeholder="Comentarios y observaciones del operador..."
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {onCancelar && (
              <Button
                variant="outlined"
                onClick={onCancelar}
                disabled={cargando}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={cargando ? <CircularProgress size={20} /> : <Send />}
              disabled={cargando || !fechaHoraLlamada || !nombreLlamante.trim()}
              sx={{ minWidth: 120 }}
            >
              {cargando ? 'Registrando...' : 'Registrar Llamada'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgregarLlamadaRecurrente;
