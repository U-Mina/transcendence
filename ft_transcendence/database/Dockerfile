FROM mysql:latest

# Install essential debugging tools (vim for editing, net-tools for network diagnostics)
RUN microdnf install -y vim net-tools \
    && microdnf clean all

# init klasöründeki tüm .sql dosyalarını Docker entrypoint dizinine kopyala
COPY init/*.sql /docker-entrypoint-initdb.d/

# Expose standard MySQL port
EXPOSE 3306
