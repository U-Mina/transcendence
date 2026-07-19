#!/bin/bash
# Runs once, only when the MySQL data volume is first initialized.
# Creates one database per microservice (+ its Prisma shadow database)
# and grants the app user access to exactly those databases only
# (least-privilege — no blanket ALL PRIVILEGES ON *.*).
set -euo pipefail

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS user_service;
    CREATE DATABASE IF NOT EXISTS event_service;
    CREATE DATABASE IF NOT EXISTS user_service_shadow;
    CREATE DATABASE IF NOT EXISTS event_service_shadow;

    GRANT ALL PRIVILEGES ON user_service.* TO '${MYSQL_USER}'@'%';
    GRANT ALL PRIVILEGES ON event_service.* TO '${MYSQL_USER}'@'%';
    GRANT ALL PRIVILEGES ON user_service_shadow.* TO '${MYSQL_USER}'@'%';
    GRANT ALL PRIVILEGES ON event_service_shadow.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
