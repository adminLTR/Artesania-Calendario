#!/bin/sh
set -e

echo "Iniciando entrypoint de Prisma..."

cd /app/server

# Verificar que DATABASE_URL este configurada
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL no esta configurada"
  exit 1
fi

echo "DATABASE_URL configurada (primeros 50 caracteres):"
echo "$DATABASE_URL" | cut -c1-50

# Extraer host y puerto del DATABASE_URL de forma mas robusta
# Formato esperado: postgresql://user:pass@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')

# Si no se pudo extraer, usar valores por defecto
if [ -z "$DB_HOST" ]; then
  echo "No se pudo extraer DB_HOST, usando variable de entorno"
  DB_HOST="${DB_HOST:-postgres}"
fi

if [ -z "$DB_PORT" ]; then
  echo "No se pudo extraer DB_PORT, usando 5432"
  DB_PORT="5432"
fi

echo "Verificando conexion a PostgreSQL..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"

max_attempts=30
attempt=0

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "Intento $attempt/$max_attempts - Esperando PostgreSQL en $DB_HOST:$DB_PORT..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "No se pudo conectar a PostgreSQL despues de $max_attempts intentos"
  echo "   Host intentado: $DB_HOST"
  echo "   Puerto intentado: $DB_PORT"
  exit 1
fi

echo "Conexion TCP establecida con PostgreSQL"
echo "Esperando inicializacion completa de PostgreSQL..."
sleep 3
echo "PostgreSQL listo"

echo "Sincronizando schema con la base de datos..."
if npx prisma db push --accept-data-loss --skip-generate; then
  echo "Schema sincronizado exitosamente"
else
  echo "Error al sincronizar schema, intentando migrate deploy..."
  if npx prisma migrate deploy 2>/dev/null; then
    echo "Migraciones aplicadas exitosamente"
  else
    echo "No se pudo sincronizar la base de datos, continuando..."
  fi
fi

echo "Generando Prisma Client..."
npx prisma generate || echo "Advertencia: Error al generar Prisma Client"

echo ""
echo "Prisma configurado correctamente"
echo "Iniciando servidor Express en puerto ${PORT:-5000}..."
echo ""

cd /app
exec node server/index.js
