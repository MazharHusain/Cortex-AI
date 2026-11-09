FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts || true

COPY services/chat/package*.json ./services/chat/
RUN cd services/chat && npm install

COPY services/chat ./services/chat

WORKDIR /app/services/chat

EXPOSE 8002

CMD ["node", "index.js"]
