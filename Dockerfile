FROM node:21.7.3-bullseye

WORKDIR /app

COPY . .

RUN \
  npm ci && \
  apt-get update && \
  apt-get install -y postgresql-client

EXPOSE 3000
