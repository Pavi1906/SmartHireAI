# Dockerfile for SmartHireAI frontend (Vite + React)
# Use a lightweight Node image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install only production dependencies (skip dev deps for runtime)
COPY package.json package-lock.json* tsconfig.json vite.config.ts ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose Vite development server port (default 3000)
EXPOSE 3000

# Default command – run the dev server
CMD ["npm", "run", "dev"]
