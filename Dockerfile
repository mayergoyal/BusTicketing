# Stage 1: Build the React frontend
FROM node:20-alpine AS build
WORKDIR /app/bus
COPY bus/package*.json ./
RUN npm cache clean --force
RUN npm install
COPY bus/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./

# Built frontend ko server ke public folder mein copy karo
# FIX: Yahan 'build' ko 'dist' se badal diya hai
COPY --from=build /app/bus/dist ./public

# Port expose karo
EXPOSE 3001

# Server start karne ki command
CMD ["node", "index.js"]