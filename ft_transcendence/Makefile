COMPOSE = docker compose

.PHONY: all build up down restart logs ps config clean

all: up

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up -d --build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

config:
	$(COMPOSE) config

clean:
	$(COMPOSE) down --volumes --remove-orphans