# Usa Node 20 Alpine para imagen más ligera
FROM node:20-alpine AS builder

# Instalar OpenSSL para Prisma con timeout y retry
RUN apk update && \
    apk add --no-cache --timeout 60 openssl || \
    (sleep 5 && apk add --no-cache --timeout 60 openssl)

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# Instalar dependencias del frontend y backend
RUN npm install
RUN cd server && npm install

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN cd server && npx prisma generate

# Compilar el frontend de React con Vite
RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Instalar OpenSSL para Prisma y netcat para healthcheck con timeout
RUN apk update && \
    apk add --no-cache --timeout 60 openssl netcat-openbsd || \
    (sleep 5 && apk add --no-cache --timeout 60 openssl netcat-openbsd)

WORKDIR /app

# Copiar solo las dependencias de producción del servidor
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

RUN cd server && npm install --production

# Copiar el código del servidor
COPY server/ ./server/

# Copiar Prisma Client generado desde builder
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=builder /app/server/node_modules/@prisma ./server/node_modules/@prisma

# Copiar los archivos compilados del frontend desde la etapa de build
COPY --from=builder /app/dist ./dist

# Copiar el entrypoint script
COPY server/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exponer el puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Usar entrypoint para ejecutar migraciones automáticamente
ENTRYPOINT ["/app/entrypoint.sh"]
