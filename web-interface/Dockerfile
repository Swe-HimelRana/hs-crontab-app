FROM node:18-alpine AS base

# Install Python, cron, and other dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    libc6-compat \
    python3 \
    make \
    g++ \
    supervisor \
    dcron \
    inotify-tools \
    bash

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory (no static assets needed for this app)
RUN mkdir -p public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Python logs server
COPY logs-server.py ./
RUN chmod +x logs-server.py

# Create logs directory
RUN mkdir -p /app/logs

# Create supervisor directories
RUN mkdir -p /var/log/supervisor /var/run/supervisor

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy crontab service script
COPY start-cron.sh ./
RUN chmod +x start-cron.sh

# Create crontab directory
RUN mkdir -p /etc/cron.d

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose both ports
EXPOSE 3000 3001

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use supervisor to manage all processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
