FROM node:19 as pnpm

WORKDIR /app
ENV HOME=/app
ENV SHELL=/bin/bash
ENV PNPM_HOME=/usr/local/lib/pnpm/bin
ENV PATH=$PNPM_HOME:$PATH
RUN (addgroup pnpm || getent group) \
    && adduser --disabled-password \
    --gecos 'pnpm' \
    --gid "$(getent group pnpm | cut -d ':' -f3)" \
    --home /app \
    pnpm
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    git \
    rsync \
    jq \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
    && corepack prepare pnpm@latest --activate \
    && npm install -g npm@latest \
    && mkdir -p /usr/local/lib/pnpm/bin \
    && pnpm setup \
    && pnpm config set store-dir /app/.pnpm-store \
    && pnpm config set cache-dir /app/.pnpm-cache \
    && pnpm config set shared-store-dir /app/.pnpm-shared-store \
    && pnpm config set shared-cache-dir /app/.pnpm-shared-cache


COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN pnpm install -g tsc

ENTRYPOINT [ "/startup.sh", "pnpm" ]
