# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source files
COPY . .

# Build the application with environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
