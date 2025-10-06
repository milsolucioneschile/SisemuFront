import React, { useEffect, useRef, useState } from "react";
import { waitForGoogleMaps, geocodeLatLng } from "../utils/googleMaps";

type Props = {
  value: string;
  onChange: (direccion: string) => void;
  onLocationChange?: (coords: { lat: number; lng: number }) => void;
  height?: number;
  defaultCenter?: { lat: number; lng: number };
};

const GoogleMapAddressPicker: React.FC<Props> = ({
  value,
  onChange,
  onLocationChange,
  height = 280,
  defaultCenter = { lat: -33.4489, lng: -70.6693 }, // Santiago CL por defecto
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  // Autocomplete clásico de Places está desaconsejado para nuevas cuentas; evitamos su uso

  useEffect(() => {
    let listenerClick: google.maps.MapsEventListener | null = null;
    let isInitialized = false;

    const initializeMap = async () => {
      if (isInitialized || !mapRef.current) return;
      isInitialized = true;

      try {
        await waitForGoogleMaps();

        const mapa = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 14,
        });
        setMap(mapa);

        const mk = new google.maps.Marker({
          map: mapa,
          position: defaultCenter,
          draggable: false,
        });
        setMarker(mk);

        const gc = new google.maps.Geocoder();
        setGeocoder(gc);

        listenerClick = mapa.addListener("click", async (e: google.maps.MapMouseEvent) => {
          const pos = e.latLng;
          if (!pos) return;
          mk.setPosition(pos);
          mapa.panTo(pos);
          if (onLocationChange) onLocationChange({ lat: pos.lat(), lng: pos.lng() });
          if (gc) {
            try {
              const direccion = await geocodeLatLng(gc, { lat: pos.lat(), lng: pos.lng() });
              onChange(direccion);
            } catch {}
          }
        });
      } catch (error) {
        console.error("Error inicializando mapa:", error);
        isInitialized = false;
      }
    };

    initializeMap();

    return () => {
      if (listenerClick) listenerClick.remove();
    };
  }, []); // Solo ejecutar una vez al montar

  // Función para geocodificar cuando el usuario hace submit/blur
  const handleGeocodeAddress = () => {
    if (!value || !geocoder || !map || !marker) return;
    
    try {
      geocoder.geocode({ address: value }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === "OK" && results && results[0] && results[0].geometry) {
          const loc = results[0].geometry.location!;
          map.panTo(loc);
          marker.setPosition(loc);
          if (onLocationChange) onLocationChange({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    } catch {}
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder="Busca una dirección..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleGeocodeAddress}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleGeocodeAddress();
            }
          }}
        />
        <button
          type="button"
          onClick={handleGeocodeAddress}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          title="Buscar dirección en el mapa"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      <div ref={mapRef} style={{ width: "100%", height }} />
    </div>
  );
};

export default GoogleMapAddressPicker;


