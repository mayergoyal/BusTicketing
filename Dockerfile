# frontend
FROM node:18-alpine AS build
WORKDIR /app/bus
COPY bus/package*.json ./
RUN npm install
COPY bus/ ./
RUN npm run build

#backend
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./

# Copy the built frontend from the 'build' stage into the server's public directory
COPY --from=build /app/bus/build ./public

EXPOSE 3001

CMD ["node", "index.js"]