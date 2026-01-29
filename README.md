# Urbik

Plataforma web para buscar y publicar propiedades con autenticacion, perfiles de usuarios e inmobiliarias, y exploracion en mapa.

## Caracteristicas
- Autenticacion con NextAuth (credenciales y Google OAuth) usando sesiones JWT y pagina de login personalizada.
- Roles de usuario: `USER` y `REALESTATE`; cada uno edita datos propios desde `/profile` (usuario: nombre, apellido, telefono; inmobiliaria: nombre, direccion, telefono, sitio web).
- Publicacion de propiedades para inmobiliarias con modal de carga (precio, habitaciones, direccion, tipo y operacion) y listado en el perfil.
- Buscador global en la navbar que combina sugerencias de usuarios inmobiliarios (DB) y direcciones de Nominatim/OSM; seleccionando una direccion abre `/map` con Leaflet.
- Mapa interactivo con capas OSM y satelite, marcador en la ubicacion buscada.
- Landing animada con Framer Motion y tarjetas de tipos de propiedades destacadas.

## Stack
- Next.js 15 (App Router) con React 19 y Turbopack en desarrollo.
- Tailwind CSS 4 y estilos globales en `src/app/globals.css`.
- NextAuth para autenticacion (Google + credenciales).
- Prisma ORM con PostgreSQL (`prisma/schema.prisma`).
- Leaflet / React Leaflet para mapas; Nominatim para geocoding.
- Framer Motion para animaciones.

## Requisitos previos
- Node.js 18+ (Next 15) y npm.
- Base de datos PostgreSQL accesible.

## Configuracion
1) Clona el repo y instala dependencias:
   ```bash
   npm install
   ```
2) Crea `.env.local` con las variables necesarias (no incluyas comillas si tu valor no las necesita):
   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
   NEXTAUTH_SECRET=tu_llave_segura
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_CLIENT_SECRET=tu_client_secret
   ```
3) Prepara la base de datos y el cliente Prisma:
   ```bash
   npx prisma migrate dev --name init   # o prisma db push si ya tienes el schema
   npx prisma generate
   ```

## Scripts disponibles
- `npm run dev` - modo desarrollo con Turbopack.
- `npm run build` - build de produccion.
- `npm start` - arranca el servidor en modo produccion tras `build`.
- `npm run lint` - ejecuta ESLint.

## Rutas de aplicacion
- `/` landing con banner animado y categorias de propiedades.
- `/login` formulario de credenciales + acceso con Google.
- `/register` registro de usuario o inmobiliaria.
- `/profile` panel segun rol para editar datos y (si es inmobiliaria) gestionar publicaciones.
- `/map?lat={lat}&lon={lon}&q={query}` vista de mapa Leaflet para la direccion seleccionada.

## API principal
- `POST /api/register` registra usuario o inmobiliaria.
- `POST /api/property` crea una propiedad (requiere sesion de rol REALESTATE).
- `GET /api/search?q=` devuelve sugerencias de usuarios REALESTATE para el buscador.
- `GET /api/user` obtiene perfil de la sesion actual.
- `PUT /api/user` actualiza perfil del usuario logueado.
- `/api/auth/[...nextauth]` manejo de inicio de sesion y proveedores.

## Notas de uso
- La modal de propiedades espera URLs de imagen separadas por coma; edicion/eliminacion aun no tienen endpoint dedicado.
- El buscador usa la API publica de Nominatim; para entornos restringidos de red revisa los logs del fetch.
- Ajusta `NEXTAUTH_URL` y las credenciales de Google en despliegues productivos.
