# Judgment System

This directory contains the code judgment system used for executing and validating user-submitted code in various programming languages.

## Supported Languages

The system currently supports the following languages:

- **C** (GCC, Clang)
- **C++** (GCC)
- **Go** (Native, GCC)
- **Java**
- **JavaScript** (Node.js)
- **PHP**
- **Python** (v2, v3 with common libraries)
- **Rust**
- **TypeScript** (Deno)

## Structure

- `runners/`: Shell scripts for executing code in different environments.
- `src/`: Core logic for the sandbox and judgment engine (Rust).
- `languages.json`: Configuration for supported languages, including Docker images and "Hello World" examples.
- `Dockerfile`: Docker configuration for the judgment environment.

## Development

### Using Docker (Recommended for Consistency)
```bash
docker compose up --build
```
Access the test console at http://localhost:8500/test

### Native Development (Faster iteration)
If you want to run the Rust backend natively on your Linux host:
1. Ensure you have `gcc` and `cargo` installed.
2. Run the dev script:
   ```bash
   chmod +x dev.sh
   ./dev.sh
   ```
Note: Native development still requires `sudo` because the sandbox uses Linux namespaces and mounting.




