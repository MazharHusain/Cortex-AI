FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts || true

COPY services/auth/package*.json ./services/auth/
RUN cd services/auth && npm install

COPY services/auth ./services/auth

WORKDIR /app/services/auth

EXPOSE 8001

CMD ["npm", "start"]
