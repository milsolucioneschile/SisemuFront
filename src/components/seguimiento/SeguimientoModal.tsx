import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { SeguimientoCompletoView } from '../seguimiento';
import { User } from '../../types';

interface SeguimientoModalProps {
  open: boolean;
  onClose: () => void;
  incidenteId: number;
  usuario: User;
  incidenteInfo?: {
    id: number;
    descripcion: string;
    tipo: string;
    estado: string;
  };
}

const SeguimientoModal: React.FC<SeguimientoModalProps> = ({
  open,
  onClose,
  incidenteId,
  usuario,
  incidenteInfo,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div">
            Seguimiento de Incidente #{incidenteId}
          </Typography>
          {incidenteInfo && (
            <Typography variant="body2" color="text.secondary">
              {incidenteInfo.descripcion} - {incidenteInfo.tipo}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <SeguimientoCompletoView
            incidenteId={incidenteId}
            usuario={usuario}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeguimientoModal;
