FROM node as pnpm

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@latest --activate

ENTRYPOINT [ "pnpm" ]
