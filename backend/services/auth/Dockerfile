FROM node:22-alpine

WORKDIR /app

COPY backend/services/auth/package*.json ./services/auth/
RUN cd services/auth && npm ci --omit=dev

COPY backend/services/auth ./services/auth

WORKDIR /app/services/auth

EXPOSE 8001

CMD ["node", "index.js"]
