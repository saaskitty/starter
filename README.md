# starter

The starter template for quickly launching your full-stack web application.

## Prerequisites

- Install [Docker](https://www.docker.com/products/docker-desktop/)
- Install NodeJS >= 22.0.0
- Install Bun

## Getting Started

1. Install dependencies.

```sh
bun install
```

2. Configure your environment variables by creating and editing `.env` (for development)
and `.env.docker` (for preview in Docker).

```sh
bun configure
```

> [!IMPORTANT]
> You will need to manually fill in the secret values in `.env` and `.env.docker`.

3. Setup Postgres/Redis/S3 locally.

```sh
bun app up
```

4. Start developing.

```sh
bun dev
```
