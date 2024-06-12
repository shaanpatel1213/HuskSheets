# Makefile for the HuskySheets project

# Define variables
CLIENT_DIR = huskysheetsui
SERVER_DIR = server
DOCKER_COMPOSE_FILE = $(SERVER_DIR)/docker-compose.yml



.PHONY: all
# Default target: build the project
all: start-client start-server test-client test-server
start-client:
	@echo "Starting client..."
	cd $(client_DIR) && npm install && npm start

start-server:
	@echo "Starting server..."
	cd $(server_DIR) && npm install && npm start
test-client:
	@echo "Running client tests..."
	cd $(client_DIR) && npm install && npm test

test-server:
	@echo "Running server tests..."
	cd $(server_DIR) && npm install && npm test

# Build target
build: build-client build-server

build-client:
	@echo "Building client..."
	cd $(client_DIR) && npm install && npm run build

build-server:
	@echo "Building server..."
	cd $(SERVER_DIR) && npm install && npm run build
	@echo "server build steps are executed here"

# Docker target
docker: docker-build docker-test

docker-build:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE) .

docker-test:
	@echo "Running tests in Docker container..."
	docker run --rm $(DOCKER_IMAGE) make test