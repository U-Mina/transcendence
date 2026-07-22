COMPOSE = docker compose

.PHONY: help up down build rebuild restart logs ps clean fclean re prune

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) build

rebuild:
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

re: fclean
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