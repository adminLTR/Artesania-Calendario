# 🚀 Guía de Despliegue en Render

## Paso 1: Preparar el Repositorio

### 1.1 Asegurar que todo esté en Git
```powershell
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

### 1.2 Verificar archivos necesarios
- ✅ `Dockerfile` (ya existe)
- ✅ `server/prisma/schema.prisma` (ya existe)
- ✅ `.env.example` (crear si no existe)

---

## Paso 2: Crear Base de Datos PostgreSQL en Render

### 2.1 Ir a Render Dashboard
1. Visita [https://render.com](https://render.com)
2. Crea una cuenta o inicia sesión
3. Click en **"New +"** → **"PostgreSQL"**

### 2.2 Configurar PostgreSQL
- **Name**: `taller-postgres`
- **Database**: `taller_db`
- **User**: `taller_db_user` (automático)
- **Region**: Oregon (o el más cercano)
- **Plan**: Selecciona **Free** (90 días gratis, después $7/mes)

### 2.3 Guardar credenciales
Render generará:
- **Internal Database URL**: Úsala para conectar servicios dentro de Render
- **External Database URL**: Para conectarte desde tu computadora
- **Username**: taller_db_user
- **Password**: [generado automáticamente]
- **Host**: [hostname interno]
- **Port**: 5432

⚠️ **IMPORTANTE**: Guarda la **Internal Database URL** - la necesitarás después.
📝 Formato: `postgresql://user:password@host:5432/dbname`

---

## Paso 3: Crear Servicio Web

### 3.1 Nuevo Web Service
1. En el dashboard de Render, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub/GitLab
3. Selecciona el repositorio `calendario-para-taller`

### 3.2 Configuración del Servicio
```
Name: taller-app
Region: Oregon (igual que la BD)
Branch: main
Root Directory: [dejar vacío]
Environment: Docker
```

### 3.3 Dockerfile Settings
Render detectará automáticamente tu `Dockerfile`. Verifica:
- **Docker Command**: [dejar vacío, usa ENTRYPOINT del Dockerfile]
- **Dockerfile Path**: `./Dockerfile`

---

## Paso 4: Configurar Variables de Entorno

En la sección **Environment** del servicio web, agrega:

```bash
# Puerto
PORT=5000

# Entorno
NODE_ENV=production

# Base de datos (usar valores de tu PostgreSQL creado en Paso 2)
DB_HOST=<hostname-interno-de-tu-postgres>
DB_PORT=5432
DB_USER=taller_db_user
DB_PASSWORD=<password-generado-automáticamente>
DB_NAME=taller_db

# DATABASE_URL completa
DATABASE_URL=postgresql://taller_db_user:<password>@<hostname-interno>:5432/taller_db?schema=public

# Opcional: Si usas Gemini AI
GEMINI_API_KEY=<tu-api-key>
```

### 📝 Cómo obtener los valores de la BD:
1. Ve a tu servicio PostgreSQL en Render
2. Click en la pestaña **"Connect"**
3. Copia el **Internal Database URL**
4. Extrae los valores:
   - `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
   - **USER** → `DB_USER` (generalmente `taller_db_user`)
   - **PASSWORD** → `DB_PASSWORD`
   - **HOST** → `DB_HOST`
   - **DATABASE** → `DB_NAME`

---

## Paso 5: Configurar Health Check

En **Settings** del servicio web:

```
Health Check Path: /api/health
```

Esto permite a Render verificar que tu app está funcionando.

---

## Paso 6: Desplegar

### 6.1 Crear y Desplegar
1. Click en **"Create Web Service"**
2. Render comenzará a:
   - Clonar tu repositorio
   - Construir la imagen Docker (puede tardar 5-10 minutos)
   - Ejecutar el contenedor
   - Ejecutar las migraciones de Prisma (automático con tu entrypoint.sh)

### 6.2 Ver Logs
- Ve a la pestaña **"Logs"** para ver el progreso
- Deberías ver:
  ```
  🔄 Sincronizando schema con la base de datos...
  ✅ Schema sincronizado exitosamente
  🔄 Generando Prisma Client...
  ✅ Prisma Client generado
  🚀 Servidor corriendo en http://localhost:5000
  ```

### 6.3 Acceder a tu App
Render te dará una URL como:
```
https://taller-app-abc123.onrender.com
```

---

## Paso 7: Verificar el Despliegue

### 7.1 Probar API
```bash
# Health check
curl https://taller-app-abc123.onrender.com/api/health

# Obtener estudiantes
curl https://taller-app-abc123.onrender.com/api/students
```

### 7.2 Verificar Base de Datos
Puedes conectarte externamente usando el **External Database URL**:
```bash
mysql -h <external-host> -P <external-port> -u root -p
```

---

## Paso 8: Configurar Dominio Personalizado (Opcional)

### 8.1 En Render
1. Ve a **Settings** → **Custom Domains**
2. Agrega tu dominio: `ejemplo.com`
3. Render te dará un registro CNAME

### 8.2 En tu proveedor DNS
Agrega un registro CNAME:
```
Type: CNAME
Name: @  (o www)
Value: taller-app-abc123.onrender.com
```

---

## 🔧 Comandos Útiles

### Forzar Re-despliegue
1. Ve a **Manual Deploy** → **Deploy latest commit**

### Ver Logs en Tiempo Real
1. Ve a la pestaña **Logs**
2. O usa Render CLI:
```bash
render logs -s taller-app
```

### Conectar a la Base de Datos
```bash
# Desde tu computadora (External URL)
psql <external-database-url>

# O manualmente:
psql -h <external-host> -p <external-port> -U taller_db_user -d taller_db

# Ver tablas
\dt
```

### Ejecutar Migraciones Manualmente (si es necesario)
```bash
# SSH a tu contenedor
render ssh taller-app

# Ejecutar migraciones
cd server
npx prisma db push
```

---

## 📊 Costos Aproximados

### Opción 1: Free Tier (90 días)
- **Web Service**: $0 (con límites)
- **PostgreSQL**: $0 (90 días gratis, después $7/mes)
- **Total**: Gratis por 90 días

### Opción 2: Starter (Recomendado para producción)
- **Web Service**: $7/mes (512MB RAM)
- **PostgreSQL**: $7/mes (1GB storage, 1M rows)
- **Total**: ~$14/mes

### Opción 3: Solo Web Service
- **Web Service en Render**: $7/mes
- **PostgreSQL externo (Railway, Supabase)**: Free tier disponible
- **Total**: $7/mes

---

## ⚠️ Troubleshooting

### Problema: "Cannot connect to database"
**Solución**: Verifica que `DB_HOST` use el hostname **interno** (no el externo).

### Problema: "Prisma schema sync failed"
**Solución**: 
1. Ve a Logs
2. Busca errores de Prisma
3. Verifica que `DATABASE_URL` esté correcta

### Problema: "Build failed"
**Solución**:
1. Revisa los logs de build
2. Asegúrate que el `Dockerfile` es correcto
3. Verifica que todas las dependencias estén en `package.json`

### Problema: "App no responde"
**Solución**:
1. Verifica el Health Check: `/api/health`
2. Revisa logs del servidor
3. Asegura que el puerto sea `5000` (variable `PORT`)

---

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
```
https://taller-app-abc123.onrender.com
```

**Próximos pasos:**
1. ✅ Configurar dominio personalizado
2. ✅ Configurar backups automáticos de MySQL
3. ✅ Configurar SSL (automático con Render)
4. ✅ Monitorear uso y logs

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Prisma con Render](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
- [Docker en Render](https://render.com/docs/docker)

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta soporte de Render.
