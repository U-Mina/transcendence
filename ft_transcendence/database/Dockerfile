FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=transcendence
ENV MYSQL_USER=database_user
ENV MYSQL_PASSWORD=database_password
ENV MYSQL_PORT=3306

COPY init/*.sql /docker-entrypoint-initdb.d/

EXPOSE 3306

CMD ["mysqld"]
