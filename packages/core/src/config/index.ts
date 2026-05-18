import { bootstrap, BootstrapConfig } from './bootstrap.js';
import {
  SettingsStore,
  type SettingsChangeEvent,
  type SettingsChangeListener,
} from './settings-store.js';
import {
  userLimitsSchema,
  loggingSchema,
  recursionSchema,
  apiSchema,
  tasksSchema,
  brandingSchema,
  templatesSchema,
  httpSchema,
  resourcesSchema,
  proxySchema,
  nzbProxySchema,
  servicesSchema,
  metadataSchema,
  posterSchema,
  rateLimitsSchema,
  presetsSchema,
  builtinsSchema,
  analyticsSchema,
} from './schema/index.js';

export const runtimeSchemas = {
  branding: brandingSchema,
  templates: templatesSchema,
  logging: loggingSchema,
  api: apiSchema,
  http: httpSchema,
  resources: resourcesSchema,
  userLimits: userLimitsSchema,
  services: servicesSchema,
  proxy: proxySchema,
  nzbProxy: nzbProxySchema,
  poster: posterSchema,
  rateLimits: rateLimitsSchema,
  recursion: recursionSchema,
  tasks: tasksSchema,
  metadata: metadataSchema,
  presets: presetsSchema,
  builtins: builtinsSchema,
  analytics: analyticsSchema,
} as const;

export const settingsStore = new SettingsStore(runtimeSchemas);

export const config = new Proxy(
  { bootstrap, ...settingsStore.current },
  {
    get(target, prop, receiver) {
      if (prop === 'bootstrap') return bootstrap;
      if (typeof prop === 'string' && prop in settingsStore.current) {
        return settingsStore.current[
          prop as keyof typeof settingsStore.current
        ];
      }
      return Reflect.get(target, prop, receiver);
    },
  }
) as { bootstrap: BootstrapConfig } & typeof settingsStore.current;

export async function initialiseConfig(): Promise<void> {
  await settingsStore.initialise();
}

export async function refreshConfigIfChanged(): Promise<boolean> {
  return settingsStore.refreshIfChanged();
}

/**
 * Subscribe to live config changes. Fires after every set/delete/reload that
 * actually changes the effective value of at least one field. Use this to
 * react to UI-driven setting edits without requiring a process restart.
 */
export function subscribeToConfig(
  listener: SettingsChangeListener<typeof runtimeSchemas>
): () => void {
  return settingsStore.subscribe(listener);
}

export type ConfigChangeEvent = SettingsChangeEvent<typeof runtimeSchemas>;
export type ConfigChangeListener = SettingsChangeListener<
  typeof runtimeSchemas
>;

export type AppConfig = typeof config;
export type { RuntimeConfigMetadata } from './types.js';
export { bootstrap, SettingsStore };
export { ConfigStartupError } from './settings-store.js';
export {
  describeSettings,
  type SettingsUiHint,
  type SettingsUiKind,
} from './describe.js';
