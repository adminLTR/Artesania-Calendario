# 🏺 Sistema de Gestión para Taller de Cerámica

Sistema monolítico completo con backend en Express y frontend en React para gestionar estudiantes, clases, piezas cerámicas y gift cards de un taller de cerámica.

## 🚀 Características

- **Backend en Express.js** que sirve el frontend de React
- **Base de datos MySQL** para persistencia de datos
- **Docker Compose** para despliegue con un solo comando
- **API REST** completa para gestión de:
  - Estudiantes y asistencias
  - Sesiones de clase
  - Piezas cerámicas y su seguimiento
  - Gift cards

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git (opcional)

## 🔧 Instalación y Uso

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
DB_PASSWORD=tu_password_seguro
GEMINI_API_KEY=tu_api_key_de_gemini
```

### 2. Levantar el Sistema con Docker

```bash
docker-compose up -d
```

Este comando:
- ✅ Descarga las imágenes necesarias
- ✅ Crea la base de datos MySQL
- ✅ Compila el frontend de React
- ✅ Inicia el servidor Express
- ✅ Inicializa las tablas de la base de datos

### 3. Acceder a la Aplicación

- **Aplicación Web**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 4. Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Ver logs de MySQL
docker-compose logs -f mysql

# Detener el sistema
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! elimina los datos)
docker-compose down -v

# Reconstruir la imagen
docker-compose up -d --build
```

## 🏗️ Estructura del Proyecto

```
calendario-para-taller/
├── server/                    # Backend Express
│   ├── config/
│   │   └── database.js       # Configuración de MySQL
│   ├── routes/               # Rutas de la API
│   │   ├── students.js
│   │   ├── sessions.js
│   │   ├── pieces.js
│   │   └── giftcards.js
│   ├── index.js              # Servidor principal
│   └── package.json
├── components/               # Componentes React
├── services/                 # Servicios del frontend
│   └── api.ts               # Cliente API
├── Dockerfile               # Imagen Docker multi-stage
├── docker-compose.yml       # Orquestación de servicios
├── .env                     # Variables de entorno (no versionar)
└── .env.example            # Plantilla de variables
```

## 🔌 API Endpoints

### Estudiantes
- `GET /api/students` - Obtener todos los estudiantes
- `POST /api/students` - Crear/actualizar estudiante
- `DELETE /api/students/:id` - Eliminar estudiante

### Sesiones
- `GET /api/sessions` - Obtener todas las sesiones
- `POST /api/sessions` - Crear/actualizar sesión
- `POST /api/sessions/attendance` - Actualizar asistencia
- `DELETE /api/sessions/:id` - Eliminar sesión

### Piezas Cerámicas
- `GET /api/pieces` - Obtener todas las piezas
- `POST /api/pieces` - Crear/actualizar pieza
- `DELETE /api/pieces/:id` - Eliminar pieza

### Gift Cards
- `GET /api/giftcards` - Obtener todas las gift cards
- `POST /api/giftcards` - Crear/actualizar gift card
- `DELETE /api/giftcards/:id` - Eliminar gift card

## 🗄️ Base de Datos

El sistema crea automáticamente las siguientes tablas:
- `students` - Información de estudiantes
- `class_sessions` - Sesiones de clase programadas
- `session_students` - Relación estudiantes-sesiones
- `attendance_history` - Historial de asistencias
- `assigned_classes` - Clases asignadas a estudiantes
- `ceramic_pieces` - Piezas cerámicas en proceso
- `gift_cards` - Gift cards vendidas

## 🔒 Seguridad

- Las contraseñas de la base de datos se configuran mediante variables de entorno
- El archivo `.env` está excluido de Git (`.gitignore`)
- Las credenciales nunca deben comitearse al repositorio

## 🐛 Solución de Problemas

### El contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs app

# Verificar que MySQL esté listo
docker-compose logs mysql
```

### Error de conexión a la base de datos
```bash
# Verificar que MySQL esté corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart
```

### Cambios en el código no se reflejan
```bash
# Reconstruir la imagen
docker-compose up -d --build
```

## 📝 Desarrollo Local (sin Docker)

Para desarrollo sin Docker:

1. Instalar dependencias:
```bash
npm install
cd server && npm install
```

2. Configurar MySQL local y actualizar `.env`

3. Iniciar backend:
```bash
cd server
npm run dev
```

4. Iniciar frontend (en otra terminal):
```bash
npm run dev
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## ✨ Autor

Desarrollado para el Taller de Cerámica 🏺
