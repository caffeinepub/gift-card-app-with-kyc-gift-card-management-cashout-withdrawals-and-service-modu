# Build & Deploy Troubleshooting Guide

This document provides step-by-step instructions for building and deploying the application, along with troubleshooting guidance for common issues.

## Prerequisites

- Node.js 18+ and pnpm installed
- DFX (Internet Computer SDK) installed
- Local replica running (for local development)

## Standard Build Commands

### Local Development

1. **Start the local replica:**
   ```bash
   dfx start --clean --background
   ```

2. **Deploy canisters:**
   ```bash
   dfx deploy
   ```

3. **Start the frontend dev server:**
   ```bash
   cd frontend
   pnpm start
   ```

### Production Build

1. **Generate backend bindings:**
   ```bash
   dfx generate backend
   ```

2. **Build the frontend:**
   ```bash
   cd frontend
   pnpm build
   ```

3. **Deploy to IC:**
   ```bash
   dfx deploy --network ic
   ```

## Required Environment Variables

### Internet Identity Configuration

The application uses Internet Identity for authentication. The following environment variables control the II configuration:

- **`II_URL`** (optional): The Internet Identity provider URL
  - Default: `https://identity.ic0.app`
  - Local development: `http://localhost:4943/?canisterId={ii-canister-id}`
  - Set in `.env` file or as environment variable

- **`II_DERIVATION_ORIGIN`** (optional): Alternative origin for Internet Identity derivation
  - Only needed for specific deployment scenarios (e.g., custom domains)
  - Can be omitted for most deployments
  - Consult Internet Identity documentation for usage

### Example `.env` file:

Create a `.env` file in the `frontend/` directory with the following content:

