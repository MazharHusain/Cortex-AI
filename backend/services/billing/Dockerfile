FROM node:20-alpine

WORKDIR /app

# Copy backend root package.json
COPY backend/package*.json ./
RUN npm install --ignore-scripts || true

# Copy billing package.json and install
COPY backend/services/billing/package*.json ./services/billing/
RUN cd services/billing && npm install

# Copy source
COPY backend/services/billing ./services/billing
COPY backend/shared ./shared

WORKDIR /app/services/billing

EXPOSE 8004

CMD [ "npm","start" ]
