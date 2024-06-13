# Makefile for the HuskySheets project

# Define variables
CLIENT_DIR = huskysheetsui
SERVER_DIR = backend
DOCKER_COMPOSE_FILE = $(SERVER_DIR)/docker-compose.yml

# Define commands
NPM = npm
REACT_SCRIPTS = npx react-scripts
DOCKER = docker
DOCKER_COMPOSE = docker-compose

.PHONY: all install-client build-client start-client test-client install-server start-server test-server clean-client clean-server docker-up docker-down docker-build docker-clean

# Default target: build the project
all: build-client

# Install dependencies for the client
install-client:
	cd $(CLIENT_DIR) && $(NPM) install

# Build the client project
build-client:
	cd $(CLIENT_DIR) && $(REACT_SCRIPTS) build

# Start the client development server
start-client:
	cd $(CLIENT_DIR) && $(REACT_SCRIPTS) start

# Run client tests
test-client:
	cd $(CLIENT_DIR) && $(REACT_SCRIPTS) test --watchAll=false

# Clean the client build
clean-client:
	rm -rf $(CLIENT_DIR)/build

# Install dependencies for the server
install-server:
	cd $(SERVER_DIR) && $(NPM) install

# Start the server
start-server:
	cd $(SERVER_DIR) && $(NPM) start

# Run server tests
test-server:
	cd $(SERVER_DIR) && $(NPM) test

# Clean the server build
clean-server:
	cd $(SERVER_DIR) && $(NPM) run clean

# Docker targets
docker-up:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

docker-down:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

docker-build:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build

docker-clean:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --rmi all
	$(DOCKER) system prune -f
