#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
yarn build
sudo systemctl restart megyk-books.service

echo "Deploy complete!"

