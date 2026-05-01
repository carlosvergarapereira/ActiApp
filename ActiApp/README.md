# ActiApp

Aplicacion movil para gestionar actividades por usuario y por organizacion, con registro de tiempo e historial.

## Estructura

- `backend`: API REST con Node.js, Express, MongoDB y JWT.
- `frontend`: App React Native (Expo).

## Requisitos

- Node.js 18+
- npm
- MongoDB Atlas o instancia MongoDB accesible

## Configuracion

1. Copia `backend/.env.example` a `backend/.env`.
2. Define variables:
   - `PORT`
   - `JWT_SECRET`
   - `MONGODB_URI`

## Ejecutar backend

```bash
cd backend
npm install
npm run dev
```

## Ejecutar frontend

```bash
cd frontend
npm install
npm start
```

## API principal

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/organizations`
- `GET /api/activities`
- `POST /api/activities`
