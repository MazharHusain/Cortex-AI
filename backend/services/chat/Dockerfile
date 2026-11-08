FROM node:20-alpine

WORKDIR /app

# Copy backend root package.json and install shared deps
COPY backend/package*.json ./
RUN npm install --ignore-scripts || true

# Copy chat package.json and install
COPY backend/services/chat/package*.json ./services/chat/
RUN cd services/chat && npm install

# Copy source files
COPY backend/services/chat ./services/chat

WORKDIR /app/services/chat

EXPOSE 8002

CMD ["npm", "start"]
