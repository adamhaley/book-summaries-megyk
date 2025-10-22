#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
yarn build

