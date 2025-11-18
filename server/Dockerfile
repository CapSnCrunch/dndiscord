# Start from an official Node LTS image
FROM node:18-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if you have one)
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy tsconfig.json and source code
COPY tsconfig.json ./
COPY src ./src

# Compile TS → JS into /dist
RUN npm run build

# ---------------------------------------------
# Final stage: produce a much smaller "production" image
FROM node:18-slim

WORKDIR /usr/src/app

# 1) Install production deps
COPY package*.json ./
RUN npm ci --only=production

# 2) Install CA certificates
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 3) Copy compiled JS from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (Cloud Run ignores this but it documents intent)
EXPOSE 8080

# Ensure PORT env var is set (Cloud Run will override this at runtime)
ENV PORT=8080

# Launch the app (mapped to "dist/app.js")
CMD ["npm", "run", "start:prod"]

