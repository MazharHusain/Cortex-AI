FROM node:20-alpine

WORKDIR /app

# Copy backend root package.json and install shared deps
COPY backend/package*.json ./
RUN npm install --ignore-scripts || true

# Copy auth package.json and install
COPY backend/services/auth/package*.json ./services/auth/
RUN cd services/auth && npm install

# Copy source files
COPY backend/services/auth ./services/auth
COPY backend/shared ./shared

WORKDIR /app/services/auth

EXPOSE 8001

CMD ["npm", "start"]
