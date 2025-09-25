import React, { memo, useState, useMemo } from "react";

export interface ColumnDefinition<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  datos: T[];
  columnas: ColumnDefinition<T>[];
  cargando?: boolean;
  paginacion?: boolean;
  filasPorPagina?: number;
  className?: string;
  emptyMessage?: string;
  frameless?: boolean;
}

interface TableHeaderProps<T> {
  columnas: ColumnDefinition<T>[];
  sortConfig: { key: keyof T; direction: "asc" | "desc" } | null;
  onSort: (key: keyof T) => void;
}

const TableHeader = memo(
  <T,>({ columnas, sortConfig, onSort }: TableHeaderProps<T>) => (
    <thead className="bg-gray-50">
      <tr>
        {columnas.map((columna) => (
          <th
            key={String(columna.key)}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
              columna.sortable
                ? "cursor-pointer hover:bg-gray-100 select-none"
                : ""
            } ${columna.className || "text-left"}`}
            onClick={() =>
              columna.sortable &&
              typeof columna.key === "string" &&
              onSort(columna.key as keyof T)
            }
          >
            <div
              className={`flex items-center space-x-1 ${
                columna.className?.includes("text-center")
                  ? "justify-center"
                  : ""
              }`}
            >
              <span>{columna.header}</span>
              {columna.sortable && (
                <div className="flex flex-col">
                  <svg
                    className={`w-3 h-3 ${
                      sortConfig?.key === columna.key &&
                      sortConfig.direction === "asc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <svg
                    className={`w-3 h-3 -mt-1 ${
                      sortConfig?.key === columna.key &&
                      sortConfig.direction === "desc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
) as {
  <T>(props: TableHeaderProps<T>): React.ReactElement;
  displayName?: string;
};

TableHeader.displayName = "TableHeader";

const TableSkeleton: React.FC<{ columnas: number; filas: number }> = memo(
  ({ columnas, filas }) => (
    <div className="animate-pulse">
      <div className="bg-gray-50 px-6 py-3">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
        >
          {Array.from({ length: columnas }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      {Array.from({ length: filas }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-t border-gray-200 px-6 py-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
          >
            {Array.from({ length: columnas }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
);

TableSkeleton.displayName = "TableSkeleton";

const Pagination: React.FC<{
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}> = memo(({ paginaActual, totalPaginas, onCambiarPagina }) => {
  const paginas = useMemo(() => {
    const pages: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(totalPaginas, inicio + maxPaginas - 1);

    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      pages.push(i);
    }

    return pages;
  }, [paginaActual, totalPaginas]);

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {paginas.map((pagina) => (
          <button
            key={pagina}
            onClick={() => onCambiarPagina(pagina)}
            className={`px-3 py-1 text-sm border rounded ${
              pagina === paginaActual
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {pagina}
          </button>
        ))}

        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Página {paginaActual} de {totalPaginas}
      </div>
    </div>
  );
});

Pagination.displayName = "Pagination";

function DataTable<T>({
  datos,
  columnas,
  cargando = false,
  paginacion = false,
  filasPorPagina = 10,
  className = "",
  emptyMessage = "No hay datos disponibles",
  frameless = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaActual(1);
  };

  const datosOrdenados = useMemo(() => {
    if (!sortConfig) return datos;

    return [...datos].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if ((aValue as unknown as string) < (bValue as unknown as string)) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if ((aValue as unknown as string) > (bValue as unknown as string)) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [datos, sortConfig]);

  const datosPaginados = useMemo(() => {
    if (!paginacion) return datosOrdenados;

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    return datosOrdenados.slice(inicio, fin);
  }, [datosOrdenados, paginacion, paginaActual, filasPorPagina]);

  const totalPaginas = Math.ceil(datos.length / filasPorPagina);

  const containerBase = frameless
    ? ""
    : "bg-white rounded-lg shadow overflow-hidden";

  if (cargando) {
    return (
      <div className={`${containerBase} ${className}`}>
        <TableSkeleton columnas={columnas.length} filas={5} />
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className={`${containerBase} ${className}`}>
        <div className="px-6 py-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerBase} ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            columnas={columnas}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {datosPaginados.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columnas.map((columna) => (
                  <td
                    key={String(columna.key)}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      columna.className || ""
                    }`}
                  >
                    {columna.render
                      ? columna.render(
                          (item as any)[columna.key as keyof typeof item],
                          item
                        )
                      : String(
                          (item as any)[columna.key as keyof typeof item] || "-"
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginacion && (
        <Pagination
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
        />
      )}
    </div>
  );
}

export default memo(DataTable) as <T>(
  props: DataTableProps<T>
) => React.ReactElement;
