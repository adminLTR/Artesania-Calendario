# Verificación rápida antes de desplegar

## Checklist de Pre-Despliegue

### ✅ Archivos Necesarios
- [x] Dockerfile
- [x] docker-compose.yml
- [x] server/prisma/schema.prisma
- [x] server/entrypoint.sh
- [x] .env.example
- [x] package.json

### ✅ Configuración
- [ ] Código subido a GitHub/GitLab
- [ ] Variables de entorno preparadas
- [ ] Health check endpoint funcionando localmente: `http://localhost:5000/api/health`

### ✅ Pruebas Locales
Antes de desplegar, prueba localmente:

```powershell
# 1. Construir y levantar
docker-compose up -d --build

# 2. Verificar que todo funcione
curl http://localhost:5000/api/health
curl http://localhost:5000/api/students
curl http://localhost:5000/api/clients

# 3. Si todo funciona, estás listo para Render
```

### 📝 Información Necesaria para Render
Tendrás que configurar estas variables en Render:

1. **DB_HOST**: [obtenido de Render MySQL]
2. **DB_PASSWORD**: [obtenido de Render MySQL]
3. **DATABASE_URL**: `mysql://root:[PASSWORD]@[HOST]:3306/taller_db`

### 🎯 Pasos Resumidos

1. **Crear MySQL** en Render → Guardar credenciales
2. **Crear Web Service** → Conectar GitHub
3. **Agregar Variables** de entorno
4. **Desplegar** → Esperar build (5-10 min)
5. **Verificar** → Visitar URL de Render

### 💰 Costos
- **MySQL Starter**: $7/mes (1GB)
- **Web Service Starter**: $7/mes (512MB RAM)
- **Total**: ~$14/mes

### 🆓 Alternativa Gratuita (con limitaciones)
- Usar **PlanetScale** (MySQL gratuito 5GB)
- Web Service en Render: $7/mes
- Total: $7/mes

---

¿Todo listo? Sigue la guía completa en `RENDER_DEPLOYMENT.md`
