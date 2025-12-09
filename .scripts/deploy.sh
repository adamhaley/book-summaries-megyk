#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
yarn install
yarn build

echo "Deploy complete!"

