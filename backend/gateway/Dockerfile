FROM node:20-alpine

WORKDIR /app

# Copy backend root package.json (if exists)
COPY backend/package*.json ./
RUN npm install --ignore-scripts || true

# Copy gateway package.json and install
COPY backend/gateway/package*.json ./gateway/
RUN cd gateway && npm install

# Copy source
COPY backend/gateway ./gateway
COPY backend/shared ./shared

WORKDIR /app/gateway

EXPOSE 8000

CMD [ "npm","start" ]





