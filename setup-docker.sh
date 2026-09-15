#!/usr/bin/env sh
set -eu

APP_NAME="${APP_NAME:-jupyter-white-clone}"
HOST_PORT="${HOST_PORT:-8080}"
IMAGE_NAME="${IMAGE_NAME:-${APP_NAME}:latest}"

cat > Dockerfile <<'DOCKERFILE'
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js

EXPOSE 80
DOCKERFILE

cat > nginx.conf <<'NGINX'
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:css|js|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    try_files $uri =404;
  }
}
NGINX

cat > docker-compose.yml <<COMPOSE
services:
  ${APP_NAME}:
    build:
      context: .
      dockerfile: Dockerfile
    image: ${IMAGE_NAME}
    container_name: ${APP_NAME}
    ports:
      - "${HOST_PORT}:80"
    restart: unless-stopped
COMPOSE

cat > .dockerignore <<'IGNORE'
.git
.DS_Store
node_modules
dist
build
*.log
IGNORE

cat > deploy.sh <<'DEPLOY'
#!/usr/bin/env sh
set -eu

docker compose build
docker compose up -d
docker compose ps
DEPLOY

chmod +x deploy.sh

printf '%s\n' "Docker listo."
printf '%s\n' "Levanta el proyecto con: ./deploy.sh"
printf '%s\n' "O manualmente con: docker compose up -d --build"
