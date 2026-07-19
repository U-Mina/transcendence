FROM mysql:latest

# Install essential debugging tools (vim for editing, net-tools for network diagnostics)
RUN microdnf install -y vim net-tools \
    && microdnf clean all

# Copy the initialization scripts to the Docker entrypoint directory
COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306

CMD ["mysqld"]
