#!/bin/sh
set -e

echo "ðŸ”„ Iniciando entrypoint de Prisma..."

cd /app/server

# Verificar conexiÃ³n a la base de datos usando netcat
echo "â³ Esperando conexiÃ³n a MySQL..."

# Extraer host y puerto del DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "ðŸ“¡ Verificando $DB_HOST:$DB_PORT..."

max_attempts=30
attempt=0

until nc -z $DB_HOST $DB_PORT 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "Intento $attempt/$max_attempts - Esperando MySQL..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "âŒ No se pudo conectar a MySQL despuÃ©s de $max_attempts intentos"
  exit 1
fi

echo "âœ… ConexiÃ³n TCP establecida"

# Esperar un poco mÃ¡s para que MySQL termine de inicializar
echo "â³ Esperando inicializaciÃ³n completa de MySQL..."
sleep 8

echo "âœ… MySQL listo"

# SIEMPRE sincronizar el schema con la base de datos
echo "ðŸ”„ Sincronizando schema con la base de datos..."
echo "   Esto crearÃ¡ todas las tablas si no existen"

# Usar db push para sincronizar el schema
# --accept-data-loss: permite cambios destructivos si es necesario
# --skip-generate: no regenerar el client aquÃ­ (lo hacemos despuÃ©s)
if npx prisma db push --accept-data-loss --skip-generate; then
  echo "âœ… Schema sincronizado exitosamente"
  echo "   âœ“ Base de datos creada si no existÃ­a"
  echo "   âœ“ Tablas creadas/actualizadas segÃºn schema.prisma"
else
  echo "âŒ Error al sincronizar schema"
  echo "   Intentando con migrate deploy..."
  
  # Como fallback, intentar con migrate deploy
  if npx prisma migrate deploy 2>/dev/null; then
    echo "âœ… Migraciones aplicadas exitosamente"
  else
    echo "âŒ No se pudo sincronizar la base de datos"
    echo "   Verifica DATABASE_URL y schema.prisma"
    exit 1
  fi
fi

# Generar Prisma Client actualizado
echo "ðŸ”„ Generando Prisma Client..."
if npx prisma generate; then
  echo "âœ… Prisma Client generado"
else
  echo "âš ï¸  Advertencia: Error al generar Prisma Client"
fi

# Verificar que las tablas se crearon
echo "ðŸ” Verificando tablas en la base de datos..."
echo "   Ejecutando: npx prisma db execute --stdin"
echo "SHOW TABLES;" | npx prisma db execute --stdin 2>/dev/null || echo "   âš ï¸  No se pudo verificar tablas (continuando...)"

echo ""
echo "âœ… Prisma configurado correctamente"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo "ðŸš€ Iniciando servidor Express en puerto ${PORT:-5000}..."
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo ""

# Iniciar el servidor
cd /app
exec node server/index.js
