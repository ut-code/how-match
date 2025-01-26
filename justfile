default:
    just --list

i: install
install:
    cd web; bun install --frozen-lockfile
    cd service; bun install --frozen-lockfile

b: build
build: build-svelte build-worker
build-svelte:
    bun run build
build-worker:
    cd worker; bunx tsc
