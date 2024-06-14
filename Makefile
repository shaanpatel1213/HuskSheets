# Makefile with targets: test, build, docker, and start

# Variables
FRONTEND_DIR := huskysheetsui
BACKEND_DIR := server
DOCKER_IMAGE := server-backend
FRONTEND_PORT := 3008
BACKEND_PORT := 3010

# Targets
.PHONY: all test build docker start start-frontend start-backend clean kill-ports

all: test docker start

# Test target
test: test-frontend test-backend

test-frontend:
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm install && npm test || echo "Frontend tests failed"

test-backend:
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && npm install && chmod +x ../node_modules/.bin/jest && npm test || echo "Backend tests failed"

# Build target
build: build-frontend build-backend

build-frontend:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run build

build-backend:
	@echo "Building backend..."
	cd $(BACKEND_DIR) && npm install

# Docker target
docker: docker-build docker-run

docker-build:
	@echo "Building Docker image..."
	cd $(BACKEND_DIR) && docker-compose build

docker-run:
	@echo "Running Docker container..."
	cd $(BACKEND_DIR) && docker-compose up -d

# Start target
start: kill-ports start-backend start-frontend

start-frontend:
	@echo "Starting frontend..."
	cd $(FRONTEND_DIR) && PORT=$(FRONTEND_PORT) npm start &

start-backend:
	@echo "Starting backend..."
	cd $(BACKEND_DIR) && PORT=$(BACKEND_PORT) npm start &

# Clean up target
clean:
	@echo "Cleaning up..."
	cd $(FRONTEND_DIR) && rm -rf node_modules
	cd $(BACKEND_DIR) && rm -rf node_modules

# Kill processes running on specific ports
kill-ports:
	@echo "Killing processes on ports $(FRONTEND_PORT) and $(BACKEND_PORT)..."
	lsof -t -i tcp:$(FRONTEND_PORT) | xargs kill -9 || true
	lsof -t -i tcp:$(BACKEND_PORT) | xargs kill -9 || true
