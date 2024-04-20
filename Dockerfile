FROM node:21.7.3-bullseye

WORKDIR /workspace

COPY . .
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
