# Multi-stage build for Web (Vite)
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY tsconfig.json ./

# Development stage
FROM base AS development

# Copy package files for installation
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install

# Copy source code (will be overridden by volume mount in dev)
COPY apps/web ./apps/web

EXPOSE 5173

CMD ["pnpm", "--filter", "web", "dev", "--", "--host"]

# Production build stage
FROM base AS build

# Copy all source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm --filter web build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy built application
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
