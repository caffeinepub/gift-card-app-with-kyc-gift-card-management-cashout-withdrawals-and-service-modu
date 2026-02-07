/**
 * TypeScript declaration merging to extend the backend actor interface
 * with authorization initialization methods used by the frontend
 * 
 * This file augments the generated backend interface to include methods
 * that are added by the authorization mixin but not reflected in the
 * auto-generated type definitions.
 */

import { backendInterface } from './backend';

declare module './backend' {
  interface backendInterface {
    /**
     * Initialize access control with a secret token
     * This method is called during actor initialization to set up
     * the first admin user when the authorization system is used.
     * 
     * @param secret - The admin initialization secret token
     * @returns Promise that resolves when initialization is complete
     */
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
