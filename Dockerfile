FROM node:22-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source (includes .env.local)
COPY . .

# Build Next.js (will read .env.local automatically)
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3200
EXPOSE 3200

CMD ["yarn", "start"]

