# ── build ────────────────────────────────────────────────────────────────────
# Next is only needed to produce the static site; it does not run in production.
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first, so edits to the site do not re-install node_modules.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Set at build time when deploying to a subpath, e.g. --build-arg
# NEXT_PUBLIC_BASE_PATH=/l4now-driving-school
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

RUN npm run build

# ── serve ────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
