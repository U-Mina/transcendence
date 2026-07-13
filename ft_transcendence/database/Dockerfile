FROM mysql:8.4

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306

# from before merge w frontend (july 13)
# FROM mysql:latest

# ENV MYSQL_ROOT_PASSWORD=password
# ENV MYSQL_DATABASE=transcendence
# ENV MYSQL_USER=database_user
# ENV MYSQL_PASSWORD=database_password
# ENV MYSQL_PORT=3306

# RUN apt-get update && apt-get install -y \
#     vim \
#     net-tools \
#     && rm -rf /var/lib/apt/lists/*

# EXPOSE 3306

# CMD ["mysqld"]

