#!/bin/bash

# ============================================
# SCRIPT DE UTILIDADES DOCKER - Catálogo Regma
# ============================================
# Uso: ./docker-utils.sh [comando]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║   🐳 Docker Utils - Catálogo Regma       ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar Docker instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
}

# ==========================================
# COMANDOS
# ==========================================

# Iniciar servicios
start() {
    print_info "Iniciando servicios..."
    docker-compose up -d
    print_success "Servicios iniciados"
    status
}

# Detener servicios
stop() {
    print_info "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

# Reiniciar servicios
restart() {
    print_info "Reiniciando servicios..."
    docker-compose restart
    print_success "Servicios reiniciados"
    status
}

# Ver estado
status() {
    print_info "Estado de los servicios:"
    docker-compose ps
}

# Ver logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Rebuild
rebuild() {
    print_info "Rebuilding servicios..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Rebuild completado"
    status
}

# Limpiar todo
clean() {
    print_warning "¿Estás seguro? Esto eliminará todos los contenedores, imágenes y volúmenes. [y/N]"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Limpiando..."
        docker-compose down -v
        docker system prune -a -f
        print_success "Limpieza completada"
    else
        print_info "Cancelado"
    fi
}

# Backup MongoDB
backup() {
    print_info "Creando backup de MongoDB..."
    BACKUP_FILE="mongodb-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    docker run --rm \
        -v regma_mongodb_data:/data \
        -v "$(pwd)":/backup \
        ubuntu tar czf "/backup/$BACKUP_FILE" /data
    print_success "Backup creado: $BACKUP_FILE"
}

# Restore MongoDB
restore() {
    if [ -z "$1" ]; then
        print_error "Uso: ./docker-utils.sh restore <archivo-backup>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Archivo no encontrado: $1"
        exit 1
    fi
    
    print_warning "¿Estás seguro? Esto sobrescribirá los datos actuales. [y/N]"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Restaurando desde $1..."
        docker run --rm \
            -v regma_mongodb_data:/data \
            -v "$(pwd)":/backup \
            ubuntu tar xzf "/backup/$1"
        print_success "Restore completado"
    else
        print_info "Cancelado"
    fi
}

# Seed database
seed() {
    print_info "Poblando base de datos..."
    docker exec regma-backend node scripts/seedUsuarios.js
    print_success "Base de datos poblada"
}

# Shell en contenedor
shell() {
    if [ -z "$1" ]; then
        print_error "Uso: ./docker-utils.sh shell [backend|frontend|mongodb]"
        exit 1
    fi
    
    case $1 in
        backend)
            docker exec -it regma-backend sh
            ;;
        frontend)
            docker exec -it regma-frontend sh
            ;;
        mongodb)
            docker exec -it regma-mongodb mongosh -u admin -p admin123
            ;;
        *)
            print_error "Servicio desconocido: $1"
            exit 1
            ;;
    esac
}

# Stats
stats() {
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Health
health() {
    print_info "Estado de salud de los servicios:"
    echo ""
    
    # Backend
    if docker exec regma-backend wget --quiet --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
        print_success "Backend: Healthy"
    else
        print_error "Backend: Unhealthy"
    fi
    
    # Frontend
    if docker exec regma-frontend wget --quiet --tries=1 --spider http://localhost/ 2>/dev/null; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Unhealthy"
    fi
    
    # MongoDB
    if docker exec regma-mongodb mongosh --quiet --eval "db.adminCommand('ping')" -u admin -p admin123 &>/dev/null; then
        print_success "MongoDB: Healthy"
    else
        print_error "MongoDB: Unhealthy"
    fi
}

# Help
help() {
    print_banner
    echo "Comandos disponibles:"
    echo ""
    echo "  start           - Iniciar todos los servicios"
    echo "  stop            - Detener todos los servicios"
    echo "  restart         - Reiniciar todos los servicios"
    echo "  status          - Ver estado de los servicios"
    echo "  logs [servicio] - Ver logs (opcional: backend, frontend, mongodb)"
    echo "  rebuild         - Rebuild completo sin caché"
    echo "  clean           - Limpiar todo (¡CUIDADO!)"
    echo "  backup          - Backup de MongoDB"
    echo "  restore <file>  - Restore de MongoDB"
    echo "  seed            - Poblar base de datos"
    echo "  shell <servicio>- Abrir shell (backend, frontend, mongodb)"
    echo "  stats           - Ver estadísticas de recursos"
    echo "  health          - Ver health checks"
    echo "  help            - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./docker-utils.sh start"
    echo "  ./docker-utils.sh logs backend"
    echo "  ./docker-utils.sh shell mongodb"
    echo "  ./docker-utils.sh backup"
    echo ""
}

# ==========================================
# MAIN
# ==========================================

check_docker

case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    rebuild)
        rebuild
        ;;
    clean)
        clean
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    seed)
        seed
        ;;
    shell)
        shell "$2"
        ;;
    stats)
        stats
        ;;
    health)
        health
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando desconocido: $1"
        help
        exit 1
        ;;
esac