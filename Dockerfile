# Stage 1: Build the React frontend
# FIX 1: Node version 18 se 20 kar diya hai
FROM node:20-alpine AS build
# NOTE: Aapke folder ka naam 'bus' use kar raha hoon
WORKDIR /app/bus
COPY bus/package*.json ./
# FIX 2: Install se pehle cache clean karne ki command add ki hai
RUN npm cache clean --force
RUN npm install
COPY bus/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
# FIX 1: Yahan bhi Node version 20 kar diya hai
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./

# Built frontend ko server ke public folder mein copy karo
COPY --from=build /app/bus/build ./public

# Port expose karo
EXPOSE 3001

# Server start karne ki command
CMD ["node", "index.js"]