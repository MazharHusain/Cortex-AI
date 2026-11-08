FROM node:20-alpine

WORKDIR /app

# Copy backend root package.json and install shared deps
COPY backend/package*.json ./
RUN npm install --ignore-scripts || true

# Copy agent package.json and install
COPY backend/services/agent/package*.json ./services/agent/
RUN cd services/agent && npm install

# Copy source files
COPY backend/services/agent ./services/agent

WORKDIR /app/services/agent

EXPOSE 8003

CMD ["npm", "start"]
