default:
    just --list

i: install

install:
    cd web; bun install --frozen-lockfile
    cd service; bun install --frozen-lockfile

b: build

build: build-svelte build-worker

build-svelte:
    cd web; bun run build

build-worker:
    cd worker; bunx tsc

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
