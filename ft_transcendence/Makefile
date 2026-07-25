COMPOSE = docker compose
CERT_SCRIPT = ./scripts/generate-certificates.sh

.PHONY: up down build rebuild restart logs ps clean fclean re reset prune backup restore

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

# Manual one-shot backup (TLS mysqldump → ./backups/). Scheduled backups also run in db-backup.
backup:
	@mkdir -p backups apps/api-gateway/uploads
	$(COMPOSE) run --rm --entrypoint /bin/bash db-backup -c /backup-database.sh

# Restore from a dump produced by `make backup` / db-backup.
# Example: make restore FILE=backups/mysql-full-20260725T180000Z.sql.gz
restore:
	@test -n "$(FILE)" || (echo "usage: make restore FILE=backups/mysql-full-....sql.gz" && exit 1)
	@test -f "$(FILE)" || (echo "error: $(FILE) not found" && exit 1)
	$(COMPOSE) run --rm --entrypoint /bin/bash db-backup \
		-c "/restore-database.sh /backups/$$(basename "$(FILE)")"

prune:
	@echo "WARNING: This removes all unused Docker containers, images, networks and volumes on this computer."
	@printf "Continue? [y/N] "
	@read answer; \
	if [ "$$answer" = "y" ] || [ "$$answer" = "Y" ]; then \
		docker system prune -a --volumes -f; \
	else \
		echo "Cancelled."; \
	fi
