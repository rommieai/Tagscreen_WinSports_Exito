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

## Arquitectura y funcionalidades principales

### Contextos globales

| Contexto | Responsabilidad |
|---|---|
| `ResultadoProvider` | Almacena y distribuye los resultados/detecciones recibidos |
| `SessionProvider` | Gestiona el `sessionId` persistido en `localStorage` |
| `NotificationsProvider` | Sistema de notificaciones in-app |
| `ActiveComponentsProvider` | Controla qué componentes de Chat / Burbujas están activos |
| `CardModalProvider` | Manejo de modales de tarjeta gamificada |
