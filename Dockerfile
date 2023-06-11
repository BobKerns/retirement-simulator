FROM node as pnpm

WORKDIR /app
ENV SHELL=/bin/bash
RUN corepack enable \
    && corepack prepare pnpm@latest --activate \
    && pnpm setup

RUN pnpm install -g tsc

ENTRYPOINT [ "pnpm" ]
