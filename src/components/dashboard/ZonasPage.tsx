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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null
  );
  const poligonoRef = useRef<google.maps.Polygon | null>(null);

  const centroInicial = useMemo(() => ({ lat: -33.4489, lng: -70.6693 }), []);

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
    };
    initMap();
    return () => {
      cleanup();
      if (poligonoRef.current) {
        poligonoRef.current.setMap(null);
        poligonoRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [modo, seleccionada, centroInicial, colorHex]);

  const resetFormulario = () => {
    setNombre("");
    setDescripcion("");
    setColorHex("#ff0000");
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
    setColorHex(z.colorHex || "#ff0000");
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
                        <td className="py-2 flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                            onClick={() => comenzarEditar(z)}
                          >
                            Editar
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                            onClick={() => eliminar(z)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              <div className="text-xs text-gray-500">
                Vértices: {vertices.length} puntos
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="px-3 py-2 bg-[#41413d] text-white rounded hover:bg-[#2f2f2c] disabled:opacity-60"
                  onClick={guardar}
                  disabled={cargando}
                >
                  {modo === "crear" ? "Crear" : "Guardar"}
                </button>
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


