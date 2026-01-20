# GEMINI.md - Project Context

## Project Overview

**Name:** Judgment System (leetcode-judgment)
**Description:** A high-performance, secure, and isolated code execution engine designed for validating user-submitted code in various programming languages. It uses advanced Linux kernel features (namespaces, cgroups v2, pivot_root) to create lightweight containers for code execution.

### Key Technologies

*   **Core Backend:** Rust (Edition 2024)
*   **Sandboxing:** Linux Namespaces (PID, Mount, Network, User, IPC, UTS), cgroups v2, overlayfs, pivot_root
*   **Networking:** WebSocket (`tungstenite`), MessagePack (`rmp-serde`) for API communication
*   **Security:** Capabilities dropping (`capctl`), resource limits (`rlimit`), and filesystem isolation
*   **Testing:** Node.js, Vitest, TypeScript, `@msgpack/msgpack`
*   **Supported Languages:** C, C++, C#, Go, Java, JavaScript (Node.js), PHP, Python, Rust, TypeScript (Deno)

## Building and Running

### Development Environment Setup

The system requires specific Linux kernel features and usually needs `sudo` or specific capabilities to manage namespaces and cgroups.

*   **Docker (Recommended):**
    ```bash
    docker compose up --build
    ```
    Access the test console at `http://localhost:8500/test`.

*   **Native Development (Linux only):**
    Run the provided development script which handles environment setup and runs the Rust backend:
    ```bash
    chmod +x dev.sh
    ./dev.sh
    ```
    This script compiles a local `yargs` utility, sets up required directories (`dev_rootfs`, `dev_env`, etc.), and executes `cargo run` with `sudo -E`.

### Key Commands

*   **Build Backend:** `cargo build`
*   **Run Backend:** `cargo run` (Requires root/sudo for sandbox setup)
*   **Run Tests:** `pnpm test` (Requires the server to be running)
*   **Fix Linting/Formatting:** `pnpm fix` (If Biome is configured, though not explicitly found, standard Rust/TS tools apply)

## Project Structure

*   `src/`: Core Rust logic.
    *   `main.rs`: Entry point, WebSocket server, and request handling.
    *   `sandbox.rs`: The heart of the isolation logic (namespaces, mounting, capabilities).
    *   `languages.rs`: Manages language configurations.
    *   `network.rs`: Sandbox network isolation setup.
*   `runners/`: Shell scripts executed inside the sandbox to compile and run user code for each language.
*   `languages.json`: Configuration file defining supported languages, their Docker images, and "Hello World" examples.
*   `test/`: Integration tests written in TypeScript using Vitest.
*   `setup/`: Deployment scripts, systemd service files, and static binaries (like `bash`).
*   `yargs.c`: A small utility to handle argument passing via null-terminated files.
*   `dev_rootfs/`, `dev_env/`, `dev_overlay_upper/`: Local directories used to simulate the container environment during native development.

## Development Conventions

### API Communication
The system communicates via WebSocket using MessagePack.
*   **Endpoint:** `/api/v1/ws/execute`
*   **Request Format:** A MessagePack map containing `language`, `code`, `input`, `arguments`, `options`, and `timeout`.
*   **Response Format:** A stream of MessagePack messages (`Stdout`, `Stderr`) followed by a `Done` message containing execution statistics (real time, memory usage, exit status, etc.).

### Sandbox Environment
*   Code is executed in `/JD/`.
*   User code is written to `/JD/code`.
*   Standard input is read from `/JD/input`.
*   Arguments and options are passed via `/JD/arguments` and `/JD/options`.
*   The environment is isolated using `pivot_root` into a merged `overlayfs` filesystem.

### Environment Variables
The following variables control the system's behavior (often set in `dev.sh`):
*   `JD_BIND`: Address to bind the server (e.g., `[::]:8500`).
*   `JD_CGROUP_PATH`: Path to the cgroup v2 mount (e.g., `/sys/fs/cgroup`).
*   `JD_ROOTFS_PATH`: Directory containing the root filesystems for languages.
*   `JD_ENV_PATH`: Directory containing environment variable definitions for languages.
*   `JD_OVERLAY_UPPER_PATH`: Directory for the overlayfs upper layer.
*   `JD_BASH_PATH`: Path to a reliable static bash binary.
*   `JD_YARGS_PATH`: Path to the `yargs` utility.
