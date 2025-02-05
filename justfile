default:
    just --list

i: install

install: setup-local-db
    cd web; bun install --frozen-lockfile
    cd service; bun install --frozen-lockfile

setup-local-db:
    cd service; DATABASE_URL=file:./local.db bunx drizzle-kit push

b: build

build: build-svelte build-service

build-svelte:
    cd web; bun run build

build-service:
    cd service; bunx tsc

dev:
    (trap 'kill 0' EXIT; just dev-service & just dev-web & wait)
dev-service:
    cd service; bun dev
dev-web:
    cd web; bun dev

format:
    deno fmt --check .

format-fix:
    deno fmt .

lint:
    biome lint .

lint-fix:
    biome lint --fix .

check: format lint
    cd web; bun check
    cd service; bun check

fix: format-fix lint-fix
