# ============================================
# DOCKERFILE - FRONTEND (React + Vite + PWA)
# ============================================

# Stage 1: Build
FROM node:18-alpine AS build

# Metadatos
LABEL maintainer="Ruben Setien <rubensetien4@gmail.com>"
LABEL description="Frontend PWA para Catálogo Regma"

# Directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build arguments (variables de entorno en build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# ============================================
# Stage 2: Production (nginx)
FROM nginx:alpine AS production

# Metadatos
LABEL maintainer="Ruben Setien <rubensetien4@gmail.com>"

# Copiar build desde stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Usuario no-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]