import React from 'react';
import { BiLockAlt } from 'react-icons/bi';
import { Field } from '@/components/ui/form';
import { Tooltip } from '@/components/ui/tooltip';
import type { SettingsKey } from '../queries';
import {
  KeyValueListField,
  StringListField,
  JsonField,
  BoolOrListField,
  MultilineStringField,
  DurationField,
} from './custom-fields';

/** dotted config key → react-hook-form-safe flat name (no dots/brackets). */
export const toName = (key: string) => key.replace(/\./g, '--');

function LockBadge({ env }: { env: string }) {
  return (
    <Tooltip trigger={<BiLockAlt className="inline text-[--muted]" />}>
      Set by environment variable: <code>{env}</code>
    </Tooltip>
  );
}

/**
 * Renders one config key into the appropriate Field.* based on the
 * server-provided UI hint + metadata. Env-overridden fields are read-only
 * with a lock badge (the effective value is shown, not hidden).
 */
export function SettingsField({ k }: { k: SettingsKey }) {
  const name = toName(k.key);
  const envLocked = k.source === 'environment';
  const disabled = envLocked;
  const labelNode = (
    <span className="inline-flex items-center gap-1.5">
      {k.label}
      {envLocked && k.env && <LockBadge env={k.env} />}
    </span>
  );
  const help = k.description || undefined;

  if (k.secret) {
    const secretHelp = k.secretSet
      ? `${help ? help + ' · ' : ''}A value is set. Type to replace it.`
      : help;
    // Multi-line secrets (e.g. env-style credential maps) need a textarea —
    // a single-line password input mangles newlines and hides everything
    // behind dots which is unusable for this format. We accept the
    // weakened on-screen masking as the right trade-off here.
    if (k.ui.multiline) {
      return (
        <MultilineStringField
          name={name}
          label={k.label}
          help={secretHelp}
          disabled={disabled}
        />
      );
    }
    return (
      <Field.Text
        name={name}
        label={labelNode as unknown as string}
        help={secretHelp}
        type="password"
        placeholder={k.secretSet ? '•••••••• (unchanged)' : ''}
        disabled={disabled}
      />
    );
  }

  switch (k.ui.kind) {
    case 'boolean':
      return (
        <Field.Switch
          name={name}
          label={labelNode as unknown as string}
          help={help}
          side="right"
          disabled={disabled}
        />
      );
    case 'number':
      return (
        <Field.Number
          name={name}
          label={labelNode as unknown as string}
          help={help}
          disabled={disabled}
        />
      );
    case 'enum':
      return (
        <Field.Select
          name={name}
          label={labelNode as unknown as string}
          help={help}
          disabled={disabled}
          options={(k.ui.options ?? []).map((o) => ({ label: o, value: o }))}
        />
      );
    case 'list':
      return (
        <StringListField
          name={name}
          label={k.label}
          help={help}
          disabled={disabled}
        />
      );
    case 'map':
      return (
        <KeyValueListField
          name={name}
          label={k.label}
          help={help}
          disabled={disabled}
          valueKind={k.ui.mapValueKind ?? 'string'}
          width={k.ui.mapWidth ?? 'equal'}
        />
      );
    case 'duration':
      return (
        <DurationField
          name={name}
          label={k.label}
          help={help}
          disabled={disabled}
        />
      );
    case 'boolOrList':
      return (
        <BoolOrListField
          name={name}
          label={k.label}
          help={help}
          disabled={disabled}
        />
      );
    case 'json':
      return (
        <JsonField
          name={name}
          label={k.label}
          help={help}
          disabled={disabled}
        />
      );
    case 'string':
    default:
      if (k.ui.multiline) {
        return (
          <MultilineStringField
            name={name}
            label={k.label}
            help={help}
            disabled={disabled}
          />
        );
      }
      return (
        <Field.Text
          name={name}
          label={labelNode as unknown as string}
          help={help}
          disabled={disabled}
        />
      );
  }
}
