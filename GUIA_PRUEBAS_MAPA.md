# 🗺️ Mapa de Inspectores: Guía de Pruebas

## 📋 Cómo Probar el Mapa Unificado

### **Paso 1: Acceder al Formulario**
1. Ir a **"Nuevo Incidente - Operador"**
2. Llenar los campos básicos del formulario
3. **Importante**: Seleccionar una dirección usando el selector de Google Maps

### **Paso 2: Verificar la Aparición del Mapa**
Una vez que selecciones una dirección, deberías ver:

#### **Sección "Asignación de Inspector"**
- **Título**: "Asignación de Inspector" con icono de ubicación
- **Botón de actualizar**: Icono de refresh para recalcular
- **Estado de carga**: "Calculando inspector más cercano..." (si hay inspectores)

#### **Inspector Sugerido** (si hay inspectores disponibles)
- **Alerta azul**: Con nombre del inspector más cercano
- **Distancia**: Mostrada en metros o kilómetros
- **Botón "Seleccionar"**: Para asignar el inspector sugerido

#### **Información de Ubicación**
- **Dirección del incidente**: Dirección completa
- **Coordenadas**: Latitud y longitud precisas

#### **Botón del Mapa**
- **Texto**: "Ocultar Mapa" (porque está visible por defecto)
- **Función**: Alternar visibilidad del mapa

### **Paso 3: Interactuar con el Mapa**

#### **Elementos Visuales del Mapa**
- **🔴 Marcador Rojo Grande**: Ubicación del incidente
- **🔵 Marcadores Azules**: Inspectores disponibles (si los hay)
- **🟢 Marcador Verde**: Inspector seleccionado (si aplica)
- **⚫ Marcadores Grises**: Inspectores no disponibles (si los hay)

#### **Funcionalidades del Mapa**
- **Click en inspector**: Muestra información detallada
- **Info Window**: Ventana emergente con datos del inspector
- **Botón "Seleccionar Inspector"**: En la info window (si está disponible)
- **Zoom automático**: Se ajusta para mostrar todos los marcadores
- **Navegación**: Zoom y pan del mapa

#### **Leyenda del Mapa**
- **🔴 Incidente**: Marcador rojo para la ubicación del incidente
- **🔵 Inspector Disponible**: Marcador azul para inspectores disponibles
- **🟢 Inspector Seleccionado**: Marcador verde para inspector seleccionado
- **⚫ Inspector No Disponible**: Marcador gris para inspectores no disponibles

### **Paso 4: Probar Diferentes Escenarios**

#### **Escenario 1: Sin Inspectores Disponibles**
- **Resultado esperado**: Mapa muestra solo el marcador rojo del incidente
- **Mensaje**: "No se encontraron inspectores con ubicación registrada"
- **Mapa**: Visible con solo el incidente marcado

#### **Escenario 2: Con Inspectores Disponibles**
- **Resultado esperado**: Mapa muestra incidente + inspectores
- **Inspector sugerido**: Aparece en alerta azul
- **Distancias**: Calculadas y mostradas
- **Selección**: Click en inspector para seleccionarlo

#### **Escenario 3: Cambio de Ubicación**
- **Acción**: Cambiar la dirección del incidente
- **Resultado esperado**: Mapa se actualiza automáticamente
- **Recálculo**: Distancias y inspector sugerido se recalculan

### **Paso 5: Verificar Integración**

#### **Con el Formulario Principal**
- **Inspector Asignado**: Se actualiza cuando seleccionas desde el mapa
- **Etiqueta**: "(Sugerido automáticamente)" aparece cuando hay coordenadas
- **Sincronización**: Cambios en el mapa se reflejan en el dropdown

#### **Con la Lista de Inspectores**
- **Lista expandible**: "Ver Todos" muestra todos los inspectores
- **Distancias**: Calculadas y mostradas en chips
- **Selección**: Click en inspector de la lista también funciona

## 🔧 Solución de Problemas

### **Problema: Mapa no aparece**
- **Causa**: No se seleccionó una dirección
- **Solución**: Usar el selector de Google Maps para elegir una dirección

### **Problema: Solo aparece marcador rojo**
- **Causa**: No hay inspectores con ubicación en la base de datos
- **Solución**: Es normal, el mapa funciona correctamente mostrando solo el incidente

### **Problema: Mapa no se actualiza**
- **Causa**: Error en la API de inspectores
- **Solución**: Verificar que los endpoints del backend estén funcionando

### **Problema: Error de Google Maps**
- **Causa**: API key de Google Maps no configurada
- **Solución**: Verificar `REACT_APP_GOOGLE_MAPS_API_KEY` en variables de entorno

## ✅ Resultado Esperado

### **Experiencia Completa**
1. **Seleccionar dirección** → Mapa aparece automáticamente
2. **Ver marcador rojo** → Incidente claramente marcado
3. **Ver marcadores azules** → Inspectores disponibles (si los hay)
4. **Click en inspector** → Info window con detalles
5. **Seleccionar inspector** → Se actualiza en el formulario
6. **Ver leyenda** → Colores explicados claramente

### **Funcionalidades Confirmadas**
- ✅ **Mapa visible por defecto** cuando hay coordenadas
- ✅ **Marcador rojo** para el incidente
- ✅ **Marcadores azules** para inspectores disponibles
- ✅ **Interactividad completa** con info windows
- ✅ **Sincronización** con el formulario principal
- ✅ **Leyenda clara** de colores y significados

El sistema ahora proporciona exactamente lo que esperabas: **un mapa unificado que muestra inspectores en azul y el incidente en rojo**, con toda la interactividad necesaria para una asignación eficiente.
