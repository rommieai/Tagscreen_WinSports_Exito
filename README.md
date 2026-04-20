# Tagscreen – WinSports Éxito

Aplicación web interactiva de segunda pantalla para activaciones en vivo. Escucha eventos en tiempo real desde **Firebase Realtime Database** (sincronizados con la transmisión del canal WinSports) y los transforma en experiencias gamificadas para el usuario final.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | **React 19** + Vite 6 |
| Enrutamiento | React Router 7 |
| Tiempo real | **Firebase Realtime Database** (`onChildAdded`) |
| Analytics | **Firebase Analytics / GA4** |
| Visión por computador | MediaPipe Tasks (detección TV) + TensorFlow.js / COCO-SSD |
| Animaciones | Framer Motion |
| Carrusel | Swiper 12 |
| HTTP | Axios |
| PWA | vite-plugin-pwa |

---

## Configuración e instalación

### 1. Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env
```

### 2. Instalación

```bash
npm install
# o con yarn
yarn install
```

### 3. Ejecución en desarrollo

```bash
npm run dev
```

### 4. Build de producción

```bash
npm run build
```

---

## Modo Demo (simulacion del partido en vivo)

El modo demo permite probar la experiencia completa de la app sin necesidad de camara, transmision en vivo, ni Cloud Vision. Funciona con datos pregrabados del partido **Millonarios 3 - Atletico Nacional 0**.

### Rutas

| Ruta | Proposito | Que muestra |
|------|-----------|-------------|
| `/mock` | Reproductor de video puro | Video del partido con controles nativos. Cada segundo sincroniza el tiempo con el backend, que publica detecciones y eventos minuto a minuto a Firebase RTDB. |
| `/demo` | Interfaz completa de la app | GameUI, modales de producto, chat, notificaciones, y el modal de minuto a minuto. Escucha RTDB en tiempo real. Usa un fondo negro en lugar de la camara. |
| `/juego` | App real (sin cambios) | Camara real + Cloud Vision sync + detecciones en vivo. No se modifica. |

### Como probar el flujo completo

1. Abrir `/mock` en una pestana o dispositivo (el "control remoto")
2. Dar play al video del partido
3. Abrir `/demo` en otra pestana o dispositivo (la "app del usuario")
4. Observar como:
   - Los eventos del partido aparecen en el **modal de minuto a minuto** (goles, faltas, tarjetas, cambios)
   - Las detecciones de **jersey** disparan notificaciones y modales de producto cuando un jugador aparece en close-up
   - El **match time** se actualiza en la esquina superior derecha
   - El **banner de debug** muestra estado RTDB, detecciones en curso y jerseys

### Flujo de datos

```
/mock (video)
   |
   | POST /api/mock-replay/sync  (cada 1s: currentTime del video)
   v
Backend (mock-replay.service)
   |
   |-- Frame actual -> detecciones jersey (filtradas por area >= 5%)
   |      |
   |      +--> POST apiopta/live_feed/{fixtureId}/{pushId}   (nodo nuevo)
   |
   |-- Match time actual -> eventos minuto a minuto pendientes
   |      |
   |      +--> PATCH apiopta/live_feed/{fixtureId}           (merge)
   |             minute_by_minute.current.summary = "Gol de..."
   v
Firebase RTDB
   |
   |-- onChildAdded  -->  useFirebaseEvents hook  -->  Demo.jsx (jerseys, modales)
   |
   |-- onValue       -->  ModalMinuteToMinute.jsx  -->  Lista de comentarios
   v
/demo (UI completa)
```

### Componentes involucrados

| Componente | Archivo | Rol |
|------------|---------|-----|
| `Mock` | `src/pages/(mock)/Mock.jsx` | Reproductor de video. Envia play/pause/seek/sync al backend. Layout fullscreen con `position: fixed` para escapar del wrapper mobile de 450px. |
| `Demo` | `src/pages/(demo)/Demo.jsx` | Copia de Juego.jsx sin camara real ni Cloud Vision sync. Fondo negro. Procesa eventos RTDB identicamente: jerseys, objetos, modales, toasts. |
| `useFirebaseEvents` | `src/hooks/useFirebaseEvents.js` | Hook que escucha `apiopta/live_feed/{fixtureId}` con `onChildAdded`. Deduplicacion, buffering de 100ms, cleanup a 3 minutos. |
| `ModalMinuteToMinute` | `src/components/molecules/Modals/ModalMinuteToMinute/ModalMinuteToMinute.jsx` | Escucha `apiopta/live_feed/{fixtureId}` con `onValue`. Extrae `minute_by_minute.current.summary` y lo agrega a la lista de comentarios. Persiste en `localStorage`. Scrollable. |
| `GameModal` (CardModal) | `src/components/organims/CardModal/Index.jsx` | Renderiza el modal correspondiente segun `MODAL_TYPES`: PRODUCT (jerseys/logos), MINUTE_TO_MINUTE, CHAT, TRIVIA. El de minuto a minuto se abre automaticamente 3s despues de montar la pagina. |

### Variables de entorno relevantes

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `VITE_API_MAIN_URL` | URL base del backend API | `https://mocksoccer.tagscreen.ai/api/` |
| `VITE_BACK_ACTIVE_STREAM` | Activa la conexion a RTDB | `true` |
| `VITE_TEST_MODE` | Modo test: jerseys como toast en vez de modal fullscreen | `true` |
| `VITE_FIREBASE_FIXTURE_ID` | ID del fixture en RTDB | `5ff653se2gnpi4y9a4nus4xec` |
| `VITE_FIREBASE_DATABASE_URL` | URL de la base de datos RTDB | `https://tagscreenwin-default-rtdb.firebaseio.com` |

### Notas

- El fixture ID `5ff653se2gnpi4y9a4nus4xec` esta hardcodeado en `ModalMinuteToMinute.jsx` y como default en `useFirebaseEvents.js`. Es el mismo que usa el backend.
- El modal de minuto a minuto persiste sus comentarios en `localStorage` bajo la key `match_commentary_1470618`. Para resetear la lista, limpiar esa key en DevTools.
- Si la PWA cachea una version vieja, limpiar el service worker desde DevTools > Application > Service Workers > Unregister, o hacer hard refresh.

---

## Arquitectura y funcionalidades principales

### Contextos globales

| Contexto | Responsabilidad |
|---|---|
| `ResultadoProvider` | Almacena y distribuye los resultados/detecciones recibidos |
| `SessionProvider` | Gestiona el `sessionId` persistido en `localStorage` |
| `NotificationsProvider` | Sistema de notificaciones in-app |
| `ActiveComponentsProvider` | Controla qué componentes de Chat / Burbujas están activos |
| `CardModalProvider` | Manejo de modales de tarjeta gamificada |
