# ============================================
# DOCKERFILE - BACKEND (Node.js + Express)
# ============================================

# Stage 1: Base
FROM node:18-alpine AS base

# Metadatos
LABEL maintainer="Ruben Setien <rubensetien4@gmail.com>"
LABEL description="Backend API para Catálogo Regma"

# Variables de entorno de Node
ENV NODE_ENV=production
ENV PORT=3001

# Directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# ============================================
# Stage 2: Dependencies
FROM base AS dependencies

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Instalar dependencias de desarrollo (para build si es necesario)
COPY package*.json ./
RUN npm ci --only=development

# ============================================
# Stage 3: Production
FROM base AS production

# Copiar node_modules de producción
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear directorio uploads con permisos
RUN mkdir -p uploads && \
    chmod 755 uploads

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "server.js"]