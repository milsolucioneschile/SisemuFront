let googleMapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMapsApi(): Promise<typeof google> {
  if (typeof window !== "undefined" && (window as any).google) {
    return Promise.resolve((window as any).google);
  }
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).google));
      existing.addEventListener("error", reject);
      return;
    }

    const apiKey =
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      "AIzaSyD7RNUA0E2cGvQ3heGdwwN5eQacFkR5zAA";
    const script = document.createElement("script");
    // Usamos loading=async y evitamos cargar 'places' ya que no lo usamos
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function geocodeLatLng(
  geocoder: google.maps.Geocoder,
  latLng: google.maps.LatLngLiteral
): Promise<string> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: latLng }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === "OK" && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error("No se pudo obtener la dirección"));
      }
    });
  });
}

// Función que asegura que Google Maps esté completamente cargado
export async function waitForGoogleMaps(): Promise<void> {
  await loadGoogleMapsApi();
  // Esperar un poco más para asegurar que todos los constructores estén disponibles
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
}


