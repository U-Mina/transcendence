#!/bin/bash
# Runs once, only when the MySQL data volume is first initialized.
# Creates one database per microservice (+ its Prisma shadow database),
# grants the app user access to exactly those databases only,
# and creates a least-privileged user for MySQL monitoring.
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

    CREATE USER IF NOT EXISTS '${MYSQL_EXPORTER_USER}'@'%' IDENTIFIED BY '${MYSQL_EXPORTER_PASSWORD}';

    GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO '${MYSQL_EXPORTER_USER}'@'%';

    FLUSH PRIVILEGES;
EOSQL