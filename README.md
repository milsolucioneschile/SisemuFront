# Sistema de Gestión Municipal (SisemuFront)

Frontend del Sistema de Gestión Municipal para la gestión de incidentes y servicios municipales.

## Características

- **Autenticación fake persistente** con localStorage
- **Dashboard dinámico** con estadísticas e incidentes
- **Gestión de incidentes** para operadores e inspectores
- **Integración con Google Maps** para ubicación de incidentes
- **Interfaz responsive** y moderna con Tailwind CSS
- **Panel lateral** con navegación por roles

## Tecnologías

- **React 19** con TypeScript
- **Tailwind CSS** para estilos
- **Axios** para comunicación con API
- **Google Maps JavaScript API** para mapas
- **Chart.js** con React-Chartjs-2 para gráficos

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## Configuración de Google Maps

Para usar la funcionalidad de mapas, necesitas:

1. **API Key de Google Maps** - Configura `REACT_APP_GOOGLE_MAPS_API_KEY` en tu archivo `.env`
2. **APIs requeridas** activadas en Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API

### Crear archivo .env

```bash
# .env
REACT_APP_GOOGLE_MAPS_API_KEY=tu_clave_aqui
REACT_APP_API_URL=https://localhost:7007/api
```

## Usuarios de prueba

El sistema incluye usuarios mock para testing:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| operador1 | pass123 | Operador/Controlador |
| inspector1 | pass123 | Inspector |
| inspector2 | pass123 | Inspector |

## Funcionalidades por Rol

### Operador/Controlador
- Dashboard con estadísticas generales
- Crear nuevos incidentes
- Asignar inspectores
- Gestionar todas las zonas

### Inspector
- Dashboard personalizado
- Crear incidentes propios
- Actualizar estado de incidentes asignados
- Vista filtrada por zona

## Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard/          # Componentes del dashboard
│   ├── Login.tsx          # Autenticación
│   ├── MainLayout.tsx     # Layout principal
│   └── forms/             # Formularios de incidentes
├── hooks/                 # Custom hooks
├── services/
│   └── api.ts            # Cliente API
├── types/
│   └── index.ts          # Definiciones TypeScript
└── utils/                # Utilidades

```

## Características de Mapas

- **Selección por clic**: Hacer clic en el mapa para obtener dirección
- **Búsqueda manual**: Escribir dirección y buscar con Enter/blur/botón
- **Geocoding**: Conversión automática entre coordenadas y direcciones
- **Optimización**: Evita llamadas excesivas a la API

## API Backend

El frontend se conecta a un API backend en `https://localhost:7007/api` con endpoints para:

- `/Incidentes` - CRUD de incidentes
- `/Inspectores` - Gestión de inspectores  
- `/Operadores` - Gestión de operadores

## Desarrollo

```bash
# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Analizar bundle
npm run analyze
```

## Próximas Funcionalidades

- [ ] Filtros avanzados en dashboard
- [ ] Reportes y exportación
- [ ] Notificaciones en tiempo real
- [ ] Gestión de usuarios
- [ ] Integración con sistemas externos

## Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.
