# Backend
FROM node:18 as backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server .
EXPOSE 3001

# Frontend
FROM node:18 as frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build
EXPOSE 3000

# Production
FROM node:18
WORKDIR /app
COPY --from=backend /app/server ./server
COPY --from=frontend /app/client ./client

# Start both servers
CMD ["sh", "-c", "cd server && npm start & cd ../client && npm start"]
