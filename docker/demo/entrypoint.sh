#!/bin/bash
set -e
export NGINX_PORT=$PORT
mkdir -p /run/mysqld && chown mysql:mysql /run/mysqld
mysqld --user=mysql --bind-address=127.0.0.1 --performance-schema=OFF --innodb-buffer-pool-size=48M --max-connections=40 --mysqlx=OFF &
for i in $(seq 1 90); do mysqladmin ping --silent && break; sleep 1; done
mysql -uroot <<'SQL'
CREATE DATABASE IF NOT EXISTS rifas CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'rifas'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'rifas';
GRANT ALL ON *.* TO 'rifas'@'127.0.0.1';
SQL
export NODE_ENV=production
export PORT=3000
export DATABASE_URL='mysql://rifas:rifas@127.0.0.1:3306/rifas'
export CORS_ORIGIN="$RENDER_EXTERNAL_URL,http://localhost:5173"
export JWT_ACCESS_SECRET='demo-access-secret-hagamostech-2026'
export JWT_REFRESH_SECRET='demo-refresh-secret-hagamostech-2026'
export ADMIN_EMAIL='admin@hagamostech.com'
export ADMIN_PASSWORD='password'
export SEED_DEMO_PASSWORD='password'
cd /srv/backend
npx prisma migrate deploy
node prisma/seed.demo.js
node src/server.js &
envsubst '$NGINX_PORT' < /etc/nginx/demo.conf.template > /etc/nginx/conf.d/demo.conf
exec nginx -g 'daemon off;'
