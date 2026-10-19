# ParanaGo

App móvil de Transporte Público de Paraná (React Native + Expo + Expo Router + TypeScript).

## Estructura
- `app/` — pantallas (Expo Router). `(tabs)` = Inicio, Líneas, Paradas, Avisos, Yo.
- `src/tipos/` — tipos del PRD (se escriben una sola vez).
- `src/mocks/` — datos falsos tipados. Solo los importan los servicios.
- `src/servicios/` — capa de servicios asíncrona. Hoy devuelve mocks, mañana hace `fetch`.
- `src/componentes/`, `src/hooks/`, `src/tema/` — piezas compartidas.

## Probar casos feos
En `src/servicios/api.ts`, poner `mockControl.fallar = true` para ver el estado de error.
La parada `par-103` no tiene horarios (fin de servicio) y `avi-090` no tiene video.

## Build de preview (APK)
```
eas build --platform android --profile preview
```
