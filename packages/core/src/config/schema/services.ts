import { serviceCredentialsMap } from './helpers.js';
import type { RuntimeConfigSection } from '../types.js';

/**
 * Debrid service credentials.
 *
 * Both fields share the same shape:
 *   `Record<serviceId, Record<credentialId, string>>`.
 *
 * Env shape: one `serviceId.credentialId=value` entry per line.
 */
export const servicesSchema = {
  defaultCredentials: {
    schema: serviceCredentialsMap,
    default: {} as Record<string, Record<string, string>>,
    label: 'Default service credentials',
    description:
      'Default credentials applied to user configurations when not provided. Format: one `serviceId.credentialId=value` per line.',
    env: 'DEFAULT_SERVICE_CREDENTIALS',
    requiresRestart: false,
    secret: true,
    ui: { multiline: true },
  },
  forcedCredentials: {
    schema: serviceCredentialsMap,
    default: {} as Record<string, Record<string, string>>,
    label: 'Forced service credentials',
    description:
      'Credentials that override whatever the user has configured. Same format as default credentials.',
    env: 'FORCED_SERVICE_CREDENTIALS',
    requiresRestart: false,
    secret: true,
    ui: { multiline: true },
  },
} as const satisfies RuntimeConfigSection;
