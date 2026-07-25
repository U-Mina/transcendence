COMPOSE = docker compose
CERT_SCRIPT = ./scripts/generate-certificates.sh

.PHONY: up down build rebuild restart logs ps clean fclean re reset prune

up:
	@$(CERT_SCRIPT)
	$(COMPOSE) up -d

build:
	@$(CERT_SCRIPT)
	$(COMPOSE) build

rebuild:
	@$(CERT_SCRIPT)
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

clean:
	$(COMPOSE) down -v --remove-orphans

fclean:
	$(COMPOSE) down -v --rmi all --remove-orphans

# Wipe DB volume and bring stack back up with Prisma migrations + default seeds.
reset: clean
	@$(CERT_SCRIPT)
	$(COMPOSE) up -d --build --force-recreate

re: fclean
	@$(CERT_SCRIPT)
	$(COMPOSE) up -d --build --force-recreate

prune:
	@echo "WARNING: This removes all unused Docker containers, images, networks and volumes on this computer."
	@printf "Continue? [y/N] "
	@read answer; \
	if [ "$$answer" = "y" ] || [ "$$answer" = "Y" ]; then \
		docker system prune -a --volumes -f; \
	else \
		echo "Cancelled."; \
	fi