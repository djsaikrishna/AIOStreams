import { seconds, secondsAllowingDisabled } from './helpers.js';
import type { RuntimeConfigSection } from '../types.js';

/**
 * Background maintenance task schedules and retention.
 *
 * Subsections:
 * - `pruning`: removing inactive users
 *
 * (Stream precache/preload behaviour now lives under `resources`; analytics
 * retention has moved to the dedicated `analytics` section.)
 */
export const tasksSchema = {
  pruning: {
    interval: {
      schema: seconds,
      default: 86400,
      label: 'Pruning interval',
      description:
        'How often to run the inactive-user pruning task (accepts e.g. "12h", "1d").',
      env: 'PRUNE_INTERVAL',
      requiresRestart: true,
      secret: false,
      ui: { kind: 'duration' },
    },
    maxDays: {
      schema: secondsAllowingDisabled,
      default: -1,
      label: 'Pruning max days',
      description:
        'Days of inactivity before a user is pruned. Use -1 to disable pruning entirely.',
      env: 'PRUNE_MAX_DAYS',
      requiresRestart: false,
      secret: false,
      // This is a *days* count (not seconds), so it is not a `duration`
      // field. The auto-classifier picks `number` for the
      // `secondsAllowingDisabled` union, and `NumberInput` coerces the
      // env-set value to `0`, producing an instantly-dirty form that Save
      // can't clear. A plain text input round-trips the integer / `-1`
      // through the schema correctly. (Same precedent as `proxy.public.port`.)
      ui: { kind: 'string' },
    },
  },
} as const satisfies RuntimeConfigSection;
