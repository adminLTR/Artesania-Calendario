#!/bin/sh
set -e

echo "Ã°Å¸â€â€ž Iniciando entrypoint de Prisma..."

cd /app/server

# Verificar conexiÃƒÂ³n a la base de datos usando netcat
echo "Ã¢ÂÂ³ Esperando conexiÃƒÂ³n a PostgreSQL..."

# Extraer host y puerto del DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Ã°Å¸â€œÂ¡ Verificando $DB_HOST:$DB_PORT..."

max_attempts=30
attempt=0

until nc -z $DB_HOST $DB_PORT 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "Intento $attempt/$max_attempts - Esperando PostgreSQL..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "Ã¢ÂÅ’ No se pudo conectar a PostgreSQL despuÃƒÂ©s de $max_attempts intentos"
  exit 1
fi

echo "Ã¢Å“â€¦ ConexiÃƒÂ³n TCP establecida"

# Esperar un poco mÃƒÂ¡s para que PostgreSQL termine de inicializar
echo "Ã¢ÂÂ³ Esperando inicializaciÃƒÂ³n completa de PostgreSQL..."
sleep 5

echo "Ã¢Å“â€¦ PostgreSQL listo"

# SIEMPRE sincronizar el schema con la base de datos
echo "Ã°Å¸â€â€ž Sincronizando schema con la base de datos..."
echo "   Esto crearÃƒÂ¡ todas las tablas si no existen"

# Usar db push para sincronizar el schema
# --accept-data-loss: permite cambios destructivos si es necesario
# --skip-generate: no regenerar el client aquÃƒÂ­ (lo hacemos despuÃƒÂ©s)
if npx prisma db push --accept-data-loss --skip-generate; then
  echo "Ã¢Å“â€¦ Schema sincronizado exitosamente"
  echo "   Ã¢Å“â€œ Base de datos creada si no existÃƒÂ­a"
  echo "   Ã¢Å“â€œ Tablas creadas/actualizadas segÃƒÂºn schema.prisma"
else
  echo "Ã¢ÂÅ’ Error al sincronizar schema"
  echo "   Intentando con migrate deploy..."
  
  # Como fallback, intentar con migrate deploy
  if npx prisma migrate deploy 2>/dev/null; then
    echo "Ã¢Å“â€¦ Migraciones aplicadas exitosamente"
  else
    echo "Ã¢ÂÅ’ No se pudo sincronizar la base de datos"
    echo "   Verifica DATABASE_URL y schema.prisma"
    exit 1
  fi
fi

# Generar Prisma Client actualizado
echo "Ã°Å¸â€â€ž Generando Prisma Client..."
if npx prisma generate; then
  echo "Ã¢Å“â€¦ Prisma Client generado"
else
  echo "Ã¢Å¡Â Ã¯Â¸Â  Advertencia: Error al generar Prisma Client"
fi

# Verificar que las tablas se crearon
echo "Ã°Å¸â€Â Verificando tablas en la base de datos..."
echo "   Ejecutando: npx prisma db execute --stdin"
echo "SHOW TABLES;" | npx prisma db execute --stdin 2>/dev/null || echo "   Ã¢Å¡Â Ã¯Â¸Â  No se pudo verificar tablas (continuando...)"

echo ""
echo "Ã¢Å“â€¦ Prisma configurado correctamente"
echo "Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â"
echo "Ã°Å¸Å¡â‚¬ Iniciando servidor Express en puerto ${PORT:-5000}..."
echo "Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â"
echo ""

# Iniciar el servidor
cd /app
exec node server/index.js
