FROM node:21.7.3-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY . .

RUN npm ci

CMD ["/bin/bash"]
