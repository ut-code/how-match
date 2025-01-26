build: build-svelte build-worker
build-svelte:
    bun run build
build-worker:
    cd worker; bunx tsc
