FROM node:20-alpine

WORKDIR /app

COPY backend/gateway/package*.json ./gateway/
RUN cd gateway && npm ci --omit=dev

COPY backend/gateway ./gateway

WORKDIR /app/gateway

EXPOSE 8000

CMD ["node", "index.js"]
