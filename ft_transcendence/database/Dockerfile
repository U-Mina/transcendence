FROM mysql:8.4

RUN microdnf install -y vim net-tools \
    && microdnf clean all

# Create service databases/grants on first initialization.
# Prisma migrations create the tables.
COPY init/*.sh /docker-entrypoint-initdb.d/

EXPOSE 3306