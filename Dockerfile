# Dockerfile
FROM node:18-alpine as backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend .

FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=backend-builder /app/backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory for storage
RUN mkdir -p /app/backend/data

EXPOSE 3000

CMD ["node", "backend/src/index.js"]