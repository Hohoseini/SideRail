# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates unzip curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/server/package.json ./apps/server/package.json
RUN cd apps/server && npm install --omit=dev

COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./public

ENV PORT=8080
ENV SIDERAIL_DATA_DIR=/data
ENV XRAY_VERSION=v26.9.9
EXPOSE 8080

CMD ["node", "apps/server/dist/index.js"]
