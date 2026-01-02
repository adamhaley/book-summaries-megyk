#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
yarn install
docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d --build megyk-books

echo "Deploy complete!"
