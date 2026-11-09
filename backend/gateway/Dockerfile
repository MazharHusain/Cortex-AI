FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts || true

COPY gateway/package*.json ./gateway/
RUN cd gateway && npm install

COPY gateway ./gateway

WORKDIR /app/gateway

EXPOSE 8000

CMD ["node", "index.js"]
