# Makefile with targets: test, build, docker, and start

# Variables
FRONTEND_DIR := frontend
BACKEND_DIR := backend
DOCKER_IMAGE := my_project_image

# Targets
.PHONY: all test build docker start start-frontend start-backend

all: test build docker

# Test target
test: test-frontend test-backend

test-frontend:
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm install && npm test

test-backend:
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && npm install && npm test

# Build target
build: build-frontend build-backend

build-frontend:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run build

build-backend:
	@echo "Building backend..."
	cd $(BACKEND_DIR) && npm install && npm run build

# Docker target
docker: docker-build docker-test

docker-build:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE) .

docker-test:
	@echo "Running tests in Docker container..."
	docker run --rm $(DOCKER_IMAGE) make test

# Start target
start: start-frontend start-backend

start-frontend:
	@echo "Starting frontend..."
	cd $(FRONTEND_DIR) && npm start

start-backend:
	@echo "Starting backend..."
	cd $(BACKEND_DIR) && npm start
