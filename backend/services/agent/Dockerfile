FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts || true

COPY services/agent/package*.json ./services/agent/
RUN cd services/agent && npm install

COPY services/agent ./services/agent

WORKDIR /app/services/agent

EXPOSE 8003

CMD ["node", "index.js"]
