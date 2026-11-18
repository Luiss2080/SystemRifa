FROM node:24-bookworm AS web
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends mysql-server nginx openssl ca-certificates gettext-base && rm -rf /var/lib/apt/lists/*
COPY --from=web /usr/local/ /usr/local/
WORKDIR /srv/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
COPY --from=web /app/dist /var/www/app
COPY docker/demo/nginx.conf.template /etc/nginx/demo.conf.template
COPY docker/demo/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && rm -f /etc/nginx/sites-enabled/default
ENV PORT=10000
EXPOSE 10000
CMD ["/entrypoint.sh"]
