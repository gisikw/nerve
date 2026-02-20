# List available recipes
default:
    @just --list

# Ensure frontend deps are installed
_npm-deps:
    cd ui && [ -x node_modules/.bin/vitest ] || npm install

# Run the full test suite (frontend first — fails fast)
test: _npm-deps
    cd ui && npx vitest run
    cd ui && npx vite build
    cd src-tauri && cargo test

# Build release binary
build:
    cd ui && npm install
    cargo tauri build

# Run in dev mode (Vite hot-reload + Rust rebuild on save)
dev:
    cargo tauri dev

# Run frontend only in browser with fake backend
dev-ui:
    cd ui && npx vite

# Build frontend only (useful on sandbox without GTK)
build-ui: _npm-deps
    cd ui && npx vite build

# Take a screenshot via headless Chromium + fake backend
screenshot *ARGS:
    cd ui && npx tsx screenshot.ts {{ARGS}}

# Run Rust tests only
test-rust:
    cd src-tauri && cargo test

# Check Rust compilation without producing binary
check:
    cd src-tauri && cargo check

# Format Rust code
fmt:
    cd src-tauri && cargo fmt

# Lint Rust code
lint:
    cd src-tauri && cargo clippy -- -D warnings
