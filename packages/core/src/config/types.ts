import type { z } from 'zod';

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue };

export type ConfigSource = 'environment' | 'database' | 'default';

/**
 * Optional per-field UI overrides surfaced verbatim through `describeSettings`.
 */
export interface RuntimeConfigUiOverride {
  /** When the auto-classified `kind === 'string'`, render as a textarea. */
  multiline?: boolean;
  /** Column ratio for `KeyValueListField`. */
  mapWidth?: 'equal' | 'wide-key' | 'wide-value';
  /**
   * Force a specific UI kind, overriding the auto-classifier.
   */
  kind?:
    | 'boolean'
    | 'number'
    | 'string'
    | 'enum'
    | 'list'
    | 'map'
    | 'boolOrList'
    | 'duration'
    | 'json';
}

/**
 * A leaf entry in a runtime config schema. The storage key is derived from the
 * dotted path of the field within its section (e.g. `userLimits.regex.access`).
 */
export interface RuntimeConfigField<T extends ConfigValue = ConfigValue> {
  schema: z.ZodType<T>;
  default: T;
  label: string;
  description: string;
  /** Environment variable name that overrides the DB-backed value. */
  env: string | null;
  /** If true, changes require a process restart to take effect. */
  requiresRestart: boolean;
  /** If true, the value should be masked in logs and UI. */
  secret: boolean;
  /** Optional UI rendering hints surfaced via `describeSettings`. */
  ui?: RuntimeConfigUiOverride;
}

/**
 * A node within a runtime config section: either a leaf field, or a nested
 * subsection of further nodes.
 */
export type RuntimeConfigNode =
  | RuntimeConfigField<any>
  | { [key: string]: RuntimeConfigNode };

/**
 * A whole runtime config section, written as a tree of subsections and leaf
 * fields. Use `satisfies RuntimeConfigSection` on each section's schema to keep
 * concrete field types narrow while validating overall shape.
 */
export type RuntimeConfigSection = { [key: string]: RuntimeConfigNode };

export interface RuntimeConfigMetadata {
  key: string;
  label: string;
  description: string;
  env: string | null;
  requiresRestart: boolean;
  secret: boolean;
  valueType: string;
  default: ConfigValue;
  source: ConfigSource;
}

export function isRuntimeConfigField(
  node: unknown
): node is RuntimeConfigField {
  return (
    typeof node === 'object' &&
    node !== null &&
    'schema' in node &&
    'default' in node &&
    'label' in node
  );
}
