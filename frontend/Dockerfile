# =============================================================
# Stage 1 – Node build
# =============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first for maximum layer cache reuse
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy source and produce an optimised production bundle
COPY . .
RUN npm run build

# =============================================================
# Stage 2 – Nginx static file server
# =============================================================
FROM nginx:1.27-alpine AS runtime

# Remove the default config and replace with our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
