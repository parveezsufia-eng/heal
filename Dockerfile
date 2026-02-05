# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the server
RUN npm run server:build

# Optional: Build expo web if landing page is needed
# RUN npx expo export --platform web

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built server and node_modules
COPY --from=builder /app/server_dist ./server_dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy templates and assets if needed by the server
COPY --from=builder /app/server/templates ./server/templates
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/app.json ./app.json

# Optional: Copy static build if expo web was built
# COPY --from=builder /app/dist ./static-build

EXPOSE 5000

# Start the server
CMD ["npm", "run", "server:prod"]
