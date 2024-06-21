# The base image.
FROM node:22.3.0-bullseye-slim AS base

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV BUN_VERSION=1.1.15

WORKDIR /app

RUN apt update && \
        npm i -g bun@${BUN_VERSION} && \
        apt clean -y && \
        rm -rf /var/lib/apt/lists/*

# The development installer image.
FROM base AS dev-installer

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile --ignore-scripts

# The builder image.
FROM dev-installer AS builder

ENV NODE_ENV=production

WORKDIR /app

ADD . .
RUN bun run build

# The production installer image.
FROM base AS prd-installer

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile --production

# The runner image.
FROM gcr.io/distroless/nodejs22-debian12

ENV NODE_ENV=production
ENV PATH="/nodejs/bin:${PATH}"

WORKDIR /app

COPY --from=busybox:1.36.1-uclibc /bin/sh /bin/sh
COPY --from=builder /app/node_modules/saaskitty/package.json /app/node_modules/saaskitty/package.json
COPY --from=builder /app/node_modules/saaskitty/build/production /app/node_modules/saaskitty/build/production
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/app/.server/databases/primary/migrations /app/app/.server/databases/primary/migrations

ENTRYPOINT [ "node", "/app/node_modules/saaskitty/build/production/main.js" ]
CMD [ "start", "--service=server"]
