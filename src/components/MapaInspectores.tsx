import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';

interface MapaInspectoresProps {
  latitudIncidente: number;
  longitudIncidente: number;
  inspectores: Array<{
    id: number;
    nombre: string;
    latitud: number;
    longitud: number;
    disponible: boolean;
    distancia?: number;
    distanciaFormateada?: string;
  }>;
  inspectorSeleccionado?: string;
  onInspectorSelect?: (inspectorId: number) => void;
  direccionIncidente?: string;
}

const MapaInspectores: React.FC<MapaInspectoresProps> = ({
  latitudIncidente,
  longitudIncidente,
  inspectores,
  inspectorSeleccionado,
  onInspectorSelect,
  direccionIncidente,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Validar coordenadas para mostrar en el JSX
  const latValidada = typeof latitudIncidente === 'number' ? latitudIncidente : parseFloat(latitudIncidente);
  const lngValidada = typeof longitudIncidente === 'number' ? longitudIncidente : parseFloat(longitudIncidente);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Validar que las coordenadas sean números válidos
    const lat = typeof latitudIncidente === 'number' ? latitudIncidente : parseFloat(latitudIncidente);
    const lng = typeof longitudIncidente === 'number' ? longitudIncidente : parseFloat(longitudIncidente);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Coordenadas inválidas:', { latitudIncidente, longitudIncidente });
      return;
    }

    // Crear el mapa centrado en el incidente
    const map = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat, lng },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Crear marcador para el incidente solo si las coordenadas son válidas
    if (!isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null) {
      const incidenteMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: `Incidente: ${direccionIncidente || 'Ubicación del incidente'}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#e74c3c',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 1000,
      });

      // Agregar el marcador del incidente a la lista para limpieza
      markersRef.current.push(incidenteMarker);
    }

    // Crear marcadores para los inspectores
    inspectores.forEach((inspector) => {
      // Validar coordenadas del inspector
      const inspectorLat = typeof inspector.latitud === 'number' ? inspector.latitud : parseFloat(inspector.latitud);
      const inspectorLng = typeof inspector.longitud === 'number' ? inspector.longitud : parseFloat(inspector.longitud);
      
      if (isNaN(inspectorLat) || isNaN(inspectorLng) || inspectorLat === null || inspectorLng === null) {
        console.error('Coordenadas inválidas del inspector:', inspector);
        return;
      }

      const isSelected = inspectorSeleccionado === inspector.id.toString();
      const isDisponible = inspector.disponible;
      
      const marker = new google.maps.Marker({
        position: { lat: inspectorLat, lng: inspectorLng },
        map: map,
        title: `${inspector.nombre}${inspector.distanciaFormateada ? ` - ${inspector.distanciaFormateada}` : ''}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 14 : 10,
          fillColor: isDisponible 
            ? (isSelected ? '#27ae60' : '#3498db')
            : '#95a5a6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 4 : 2,
        },
        zIndex: isSelected ? 1001 : 999,
      });

      // Agregar click listener para seleccionar inspector
      marker.addListener('click', () => {
        if (onInspectorSelect && inspector.disponible) {
          onInspectorSelect(inspector.id);
        }
      });

      // Crear info window para mostrar información del inspector
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${inspector.nombre}</h3>
            <p style="margin: 4px 0; color: #7f8c8d;">
              <strong>Estado:</strong> ${inspector.disponible ? 'Disponible' : 'No disponible'}
            </p>
            ${inspector.distanciaFormateada ? `
              <p style="margin: 4px 0; color: #7f8c8d;">
                <strong>Distancia:</strong> ${inspector.distanciaFormateada}
              </p>
            ` : ''}
            <p style="margin: 4px 0; color: #7f8c8d;">
              <strong>Coordenadas:</strong><br>
              ${!isNaN(inspectorLat) && !isNaN(inspectorLng) ? `${inspectorLat.toFixed(6)}, ${inspectorLng.toFixed(6)}` : 'Coordenadas no disponibles'}
            </p>
            ${inspector.disponible ? `
              <button 
                onclick="window.selectInspector(${inspector.id})"
                style="
                  background: #3498db; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  margin-top: 8px;
                "
              >
                Seleccionar Inspector
              </button>
            ` : ''}
          </div>
        `,
      });

      // Agregar listener para mostrar info window
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Función global para seleccionar inspector desde info window
    (window as any).selectInspector = (inspectorId: number) => {
      if (onInspectorSelect) {
        onInspectorSelect(inspectorId);
      }
    };

    // Ajustar el zoom para mostrar todos los marcadores
    const bounds = new google.maps.LatLngBounds();
    
    // Solo agregar el incidente si tiene coordenadas válidas
    if (!isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null) {
      bounds.extend({ lat, lng });
    }
    
    inspectores.forEach(inspector => {
      const inspectorLat = typeof inspector.latitud === 'number' ? inspector.latitud : parseFloat(inspector.latitud);
      const inspectorLng = typeof inspector.longitud === 'number' ? inspector.longitud : parseFloat(inspector.longitud);
      
      if (!isNaN(inspectorLat) && !isNaN(inspectorLng) && inspectorLat !== null && inspectorLng !== null) {
        bounds.extend({ lat: inspectorLat, lng: inspectorLng });
      }
    });
    
    // Solo ajustar bounds si hay al menos un punto válido
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }

    // Asegurar que el zoom no sea demasiado lejano
    const listener = google.maps.event.addListener(map, 'idle', () => {
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom > 15) map.setZoom(15);
      google.maps.event.removeListener(listener);
    });

  }, [latitudIncidente, longitudIncidente, inspectores, inspectorSeleccionado, onInspectorSelect, direccionIncidente]);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        📍 Ubicación del Incidente e Inspectores
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {direccionIncidente || (isNaN(latValidada) || isNaN(lngValidada) ? 'Coordenadas no disponibles' : `Coordenadas: ${latValidada.toFixed(6)}, ${lngValidada.toFixed(6)}`)}
      </Typography>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e74c3c', border: '2px solid white' }} />
          <Typography variant="caption">Incidente</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3498db', border: '2px solid white' }} />
          <Typography variant="caption">Inspector Disponible</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#27ae60', border: '4px solid white' }} />
          <Typography variant="caption">Inspector Seleccionado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#95a5a6', border: '2px solid white' }} />
          <Typography variant="caption">Inspector No Disponible</Typography>
        </Box>
      </Box>

      {/* Contenedor del mapa */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: 400,
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Haz click en un inspector disponible para seleccionarlo
      </Typography>
    </Paper>
  );
};

export default MapaInspectores;
