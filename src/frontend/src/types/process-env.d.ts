/**
 * TypeScript declarations for process.env variables used in the frontend
 * These are shimmed by Vite at build time
 */

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Internet Identity URL
     * Default: https://identity.ic0.app
     */
    II_URL?: string;

    /**
     * Internet Identity derivation origin
     * Optional: Used for alternative origins in Internet Identity
     */
    II_DERIVATION_ORIGIN?: string;
  }
}

// Ensure this file is treated as a module
export {};
