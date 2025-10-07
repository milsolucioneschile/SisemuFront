import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";
import { Zona, CrearZonaDto, ActualizarZonaDto } from "../../types";
import { waitForGoogleMaps } from "../../utils/googleMaps";

type Modo = "listar" | "crear" | "editar";

const ZonasPage: React.FC = () => {
  const [modo, setModo] = useState<Modo>("listar");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [seleccionada, setSeleccionada] = useState<Zona | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [colorHex, setColorHex] = useState<string>("#ff0000");
  const [activa, setActiva] = useState<boolean>(true);
  const [vertices, setVertices] = useState<{ lat: number; lng: number }[]>([]);

  const mapaRef = useRef<HTMLDivElement | null>(null);
  const mapaListadoRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const listMapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null
  );
  const poligonoRef = useRef<google.maps.Polygon | null>(null);
  const overlaysListadoRef = useRef<google.maps.Polygon[]>([]);
  const overlaysEdicionRef = useRef<{ poly: google.maps.Polygon; id: number; vertices: { lat: number; lng: number }[]; color?: string }[]>([]);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const centroInicial = useMemo(() => ({ lat: -33.4489, lng: -70.6693 }), []);

  const randomColorHex = () => {
    // Paleta suave y distinguible
    const palette = [
      "#e57373", // red
      "#ba68c8", // purple
      "#64b5f6", // blue
      "#4db6ac", // teal
      "#81c784", // green
      "#ffd54f", // amber
      "#ffb74d", // orange
      "#a1887f", // brown
      "#90a4ae", // blue grey
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  };

  // Utilidades de geometría (ray casting y cruce de segmentos) para detectar superposición
  const pointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 0.0) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const segmentsIntersect = (a1: { lat: number; lng: number }, a2: { lat: number; lng: number }, b1: { lat: number; lng: number }, b2: { lat: number; lng: number }): boolean => {
    const det = (x1: number, y1: number, x2: number, y2: number) => x1 * y2 - y1 * x2;
    const sub = (p: any, q: any) => ({ x: p.lng - q.lng, y: p.lat - q.lat });
    const a = { x: a2.lng - a1.lng, y: a2.lat - a1.lat };
    const b = { x: b2.lng - b1.lng, y: b2.lat - b1.lat };
    const c = sub(b1, a1);
    const denom = det(a.x, a.y, b.x, b.y);
    if (denom === 0) return false; // paralelas o colineales (ignoramos colinealidad)
    const t = det(c.x, c.y, b.x, b.y) / denom;
    const u = det(c.x, c.y, a.x, a.y) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  const polygonsIntersect = (p1: { lat: number; lng: number }[], p2: { lat: number; lng: number }[]): boolean => {
    if (p1.length < 3 || p2.length < 3) return false;
    // vértices contenidos
    if (p1.some((v) => pointInPolygon(v, p2))) return true;
    if (p2.some((v) => pointInPolygon(v, p1))) return true;
    // intersección de aristas
    for (let i = 0; i < p1.length; i++) {
      const a1 = p1[i];
      const a2 = p1[(i + 1) % p1.length];
      for (let j = 0; j < p2.length; j++) {
        const b1 = p2[j];
        const b2 = p2[(j + 1) % p2.length];
        if (segmentsIntersect(a1, a2, b1, b2)) return true;
      }
    }
    return false;
  };

  const cargarZonas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await api.obtenerZonas();
      setZonas(data);
    } catch (e: any) {
      setError(e.message || "Error cargando zonas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarZonas();
  }, []);

  useEffect(() => {
    if (modo === "listar") return;
    let cleanup = () => {};
    const initMap = async () => {
      await waitForGoogleMaps();
      if (!mapaRef.current) return;
      const map = new google.maps.Map(mapaRef.current, {
        center: centroInicial,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });
      mapInstanceRef.current = map;

      if (modo === "editar" && seleccionada && seleccionada.vertices.length) {
        const poly = new google.maps.Polygon({
          paths: seleccionada.vertices,
          strokeColor: colorHex,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: colorHex,
          fillOpacity: 0.2,
          editable: true,
        });
        poly.setMap(map);
        poligonoRef.current = poly;
        setVertices(
          (poly.getPath().getArray() || []).map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }))
        );

        // Actualizar vertices al mover/agregar/quitar
        const path = poly.getPath();
        const setAtListener = google.maps.event.addListener(path, "set_at", () => {
          const arr = path.getArray().map((p) => ({ lat: p.lat(), lng: p.lng() }));
          setVertices(arr);
        });
        const insertAtListener = google.maps.event.addListener(path, "insert_at", () => {
          const arr = path.getArray().map((p) => ({ lat: p.lat(), lng: p.lng() }));
          setVertices(arr);
        });
        const removeAtListener = google.maps.event.addListener(path, "remove_at", () => {
          const arr = path.getArray().map((p) => ({ lat: p.lat(), lng: p.lng() }));
          setVertices(arr);
        });

        // Eliminar vértice con clic derecho sobre el vértice
        const rightClickListener = google.maps.event.addListener(poly, "rightclick", (e: any) => {
          if (typeof e.vertex === "number" && e.vertex >= 0) {
            path.removeAt(e.vertex);
          }
        });

        // Agregar vértice al final con clic en el mapa
        mapClickListenerRef.current = google.maps.event.addListener(map, "click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          path.push(e.latLng);
        });

        cleanup = () => {
          google.maps.event.removeListener(setAtListener);
          google.maps.event.removeListener(insertAtListener);
          google.maps.event.removeListener(removeAtListener);
          google.maps.event.removeListener(rightClickListener);
          if (mapClickListenerRef.current) {
            google.maps.event.removeListener(mapClickListenerRef.current);
            mapClickListenerRef.current = null;
          }
        };
      } else {
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            strokeColor: colorHex,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: colorHex,
            fillOpacity: 0.2,
            editable: true,
          },
        });
        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;

        const completeListener = google.maps.event.addListener(
          drawingManager,
          "overlaycomplete",
          (e: any) => {
            if (e.type === google.maps.drawing.OverlayType.POLYGON) {
              if (poligonoRef.current) {
                poligonoRef.current.setMap(null);
              }
              poligonoRef.current = e.overlay as google.maps.Polygon;
              drawingManager.setDrawingMode(null);
              const path = (poligonoRef.current.getPath().getArray() || []).map(
                (p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() })
              );
              setVertices(path);
              google.maps.event.addListener(
                poligonoRef.current.getPath(),
                "set_at",
                () => {
                  const arr = poligonoRef.current
                    ?.getPath()
                    .getArray()
                    .map((p) => ({ lat: p.lat(), lng: p.lng() })) as {
                    lat: number;
                    lng: number;
                  }[];
                  setVertices(arr || []);
                }
              );
              google.maps.event.addListener(
                poligonoRef.current.getPath(),
                "insert_at",
                () => {
                  const arr = poligonoRef.current
                    ?.getPath()
                    .getArray()
                    .map((p) => ({ lat: p.lat(), lng: p.lng() })) as {
                    lat: number;
                    lng: number;
                  }[];
                  setVertices(arr || []);
                }
              );
            }
          }
        );

        cleanup = () => {
          google.maps.event.removeListener(completeListener);
          drawingManager.setMap(null);
        };
      }

      // Dibujar las otras zonas como referencia (para evitar superposición)
      overlaysEdicionRef.current.forEach((o) => o.poly.setMap(null));
      overlaysEdicionRef.current = [];
      const otras = zonas.filter((z) => !seleccionada || z.id !== seleccionada.id);
      otras.forEach((z) => {
        if (!z.vertices || z.vertices.length < 3) return;
        const polyInfo = new google.maps.Polygon({
          paths: z.vertices,
          strokeColor: z.colorHex || "#666666",
          strokeOpacity: 0.6,
          strokeWeight: 1,
          fillColor: z.colorHex || "#666666",
          fillOpacity: 0.08,
          clickable: false,
        });
        polyInfo.setMap(map);
        overlaysEdicionRef.current.push({ poly: polyInfo, id: z.id, vertices: z.vertices, color: z.colorHex || "#666666" });
      });
    };
    initMap();
    return () => {
      cleanup();
      overlaysEdicionRef.current.forEach((o) => o.poly.setMap(null));
      overlaysEdicionRef.current = [];
      if (poligonoRef.current) {
        poligonoRef.current.setMap(null);
        poligonoRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [modo, seleccionada, zonas, centroInicial, colorHex]);

  // Recolorear zonas informativas según intersección con el polígono en edición/creación
  useEffect(() => {
    if (modo === "listar") return;
    if (!overlaysEdicionRef.current.length) return;
    if (!vertices || vertices.length < 3) {
      // reset colores
      overlaysEdicionRef.current.forEach(({ poly, color }) => poly.setOptions({ strokeColor: color || "#666666", fillColor: color || "#666666", fillOpacity: 0.08 }));
      return;
    }
    overlaysEdicionRef.current.forEach(({ poly, vertices: otros, color }) => {
      const intersecta = polygonsIntersect(vertices, otros);
      poly.setOptions({
        strokeColor: intersecta ? "#ff0000" : (color || "#666666"),
        fillColor: intersecta ? "#ff0000" : (color || "#666666"),
        fillOpacity: intersecta ? 0.18 : 0.08,
      });
    });
  }, [vertices, modo]);

  // Mapa con todas las zonas en modo listar
  useEffect(() => {
    const initListadoMap = async () => {
      if (modo !== "listar") return;
      await waitForGoogleMaps();
      if (!mapaListadoRef.current) return;
      const map = new google.maps.Map(mapaListadoRef.current, {
        center: centroInicial,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });
      listMapInstanceRef.current = map;

      // limpiar anteriores
      overlaysListadoRef.current.forEach((o) => o.setMap(null));
      overlaysListadoRef.current = [];

      const bounds = new google.maps.LatLngBounds();
      zonas.forEach((z) => {
        if (!z.vertices || z.vertices.length < 3) return;
        const poly = new google.maps.Polygon({
          paths: z.vertices,
          strokeColor: z.colorHex || "#0066ff",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: z.colorHex || "#0066ff",
          fillOpacity: 0.12,
          clickable: false,
        });
        poly.setMap(map);
        overlaysListadoRef.current.push(poly);
        z.vertices.forEach((v) => bounds.extend(new google.maps.LatLng(v.lat, v.lng)));
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    };
    initListadoMap();
    return () => {
      overlaysListadoRef.current.forEach((o) => o.setMap(null));
      overlaysListadoRef.current = [];
      if (listMapInstanceRef.current) {
        listMapInstanceRef.current = null;
      }
    };
  }, [modo, zonas, centroInicial]);

  const resetFormulario = () => {
    setNombre("");
    setDescripcion("");
    setColorHex(randomColorHex());
    setActiva(true);
    setVertices([]);
    setSeleccionada(null);
  };

  const comenzarCrear = () => {
    resetFormulario();
    setModo("crear");
  };

  const comenzarEditar = (z: Zona) => {
    setSeleccionada(z);
    setNombre(z.nombre);
    setDescripcion(z.descripcion || "");
    setColorHex(z.colorHex || randomColorHex());
    setActiva(!!z.activa);
    setVertices(z.vertices || []);
    setModo("editar");
  };

  const cancelarEdicion = () => {
    resetFormulario();
    setModo("listar");
  };

  const guardar = async () => {
    if (!nombre.trim() || vertices.length < 3) {
      setError("Ingrese un nombre y defina un polígono con al menos 3 puntos");
      return;
    }
    setError(null);
    try {
      setCargando(true);
      if (modo === "crear") {
        const dto: CrearZonaDto = {
          nombre,
          descripcion: descripcion || undefined,
          vertices,
          colorHex,
          activa,
        };
        await api.crearZona(dto);
      } else if (modo === "editar" && seleccionada) {
        const dto: ActualizarZonaDto = {
          nombre,
          descripcion: descripcion || undefined,
          vertices,
          colorHex,
          activa,
        };
        await api.actualizarZona(seleccionada.id, dto);
      }
      await cargarZonas();
      cancelarEdicion();
    } catch (e: any) {
      setError(e.message || "Error guardando zona");
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (z: Zona) => {
    if (!window.confirm(`¿Eliminar zona "${z.nombre}"?`)) return;
    try {
      setCargando(true);
      await api.eliminarZona(z.id);
      await cargarZonas();
    } catch (e: any) {
      setError(e.message || "Error eliminando zona");
    } finally {
      setCargando(false);
    }
  };

  const eliminarSeleccionada = async () => {
    if (!seleccionada) return;
    if (!window.confirm(`¿Eliminar zona "${seleccionada.nombre}"?`)) return;
    try {
      setCargando(true);
      await api.eliminarZona(seleccionada.id);
      await cargarZonas();
      cancelarEdicion();
    } catch (e: any) {
      setError(e.message || "Error eliminando zona");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6 text-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Zonas geográficas</h2>
          {modo === "listar" && (
            <button
              className="px-3 py-2 bg-[#41413d] text-white rounded hover:bg-[#2f2f2c]"
              onClick={comenzarCrear}
            >
              Nueva zona
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        {modo === "listar" && (
          <div>
            {cargando ? (
              <p>Cargando...</p>
            ) : zonas.length === 0 ? (
              <p className="text-gray-500">No hay zonas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4">Activa</th>
                      <th className="py-2 pr-4">Vértices</th>
                      <th className="py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zonas.map((z) => (
                      <tr key={z.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{z.nombre}</td>
                        <td className="py-2 pr-4">{z.activa ? "Sí" : "No"}</td>
                        <td className="py-2 pr-4">{z.vertices.length}</td>
                        <td className="py-2 flex gap-2 items-center">
                          <button
                            className="px-2 py-1 text-xs border border-blue-600 text-blue-700 rounded hover:bg-blue-600 hover:text-white"
                            onClick={() => comenzarEditar(z)}
                            title="Editar zona"
                          >
                            Editar
                          </button>
                          <button
                            className="px-2 py-1 text-xs border border-red-600 text-red-700 rounded hover:bg-red-600 hover:text-white flex items-center gap-1"
                            onClick={() => eliminar(z)}
                            title="Eliminar zona"
                            aria-label={`Eliminar zona ${z.nombre}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v1H5.5a.5.5 0 000 1h9a.5.5 0 000-1H12V3a1 1 0 00-1-1H9zm-3 6a.5.5 0 011 0v7a.5.5 0 01-1 0V8zm4 .5a.5.5 0 10-1 0v6a.5.5 0 001 0v-6zm3-.5a.5.5 0 011 0v7a.5.5 0 01-1 0V8z" clipRule="evenodd" />
                              <path d="M6 6.5a.5.5 0 01.5-.5h7a.5.5 0 110 1h-7a.5.5 0 01-.5-.5z" />
                            </svg>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Mapa de zonas</div>
              <div ref={mapaListadoRef} className="w-full h-[360px] rounded border" />
            </div>
          </div>
        )}

        {(modo === "crear" || modo === "editar") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div ref={mapaRef} className="w-full h-[520px] rounded border" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Nombre de la zona"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Descripción breve"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="chk-activa"
                  type="checkbox"
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                />
                <label htmlFor="chk-activa" className="text-sm">
                  Activa
                </label>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Vértices: {vertices.length} puntos</div>
                <div>
                  Consejo: clic en el mapa para agregar un vértice; clic derecho sobre un vértice para eliminarlo.
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="px-3 py-2 bg-[#41413d] text-white rounded hover:bg-[#2f2f2c] disabled:opacity-60"
                  onClick={guardar}
                  disabled={cargando}
                >
                  {modo === "crear" ? "Crear" : "Guardar"}
                </button>
                {modo === "editar" && seleccionada && (
                  <button
                    className="px-3 py-2 border border-red-600 text-red-700 rounded hover:bg-red-600 hover:text-white disabled:opacity-60"
                    onClick={eliminarSeleccionada}
                    disabled={cargando}
                  >
                    Eliminar zona
                  </button>
                )}
                <button
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={cancelarEdicion}
                  disabled={cargando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZonasPage;


