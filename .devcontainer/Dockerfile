FROM mcr.microsoft.com/devcontainers/javascript-node:22

ENV BUN_VERSION=1.1.10

RUN apt update && \
        npm i -g bun@${BUN_VERSION} && \
        apt clean -y && \
        rm -rf /var/lib/apt/lists/*
