FROM mcr.microsoft.com/devcontainers/universal:2

ENV BUN_VERSION=1.1.10

RUN apt update && \
        npm i -g bun@${BUN_VERSION} && \
        apt clean -y && \
        rm -rf /var/lib/apt/lists/*
