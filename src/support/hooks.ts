import _reduce from 'lodash/reduce'

import {
  Hook,
  HookType,
} from '@/types/enums'

import type {
  Project,
  RuntimeEnvironment,
} from '@/types'

// Internal
const registeredHooks: RegisteredHooks = _reduce<string, RegisteredHooks>(Object.values(Hook), (hooks, hook) => ({
  ...hooks,
  [hook]: [],
}), {} as RegisteredHooks)

export type EnvironmentConfig = Partial<RuntimeEnvironment>

export interface HookExecutor {
  after?(env?: EnvironmentConfig, project?: Project): void;
  before?(env?: EnvironmentConfig, project?: Project): void;
}

export type RegisteredHooks = Record<Hook, HookExecutor[]>

/**
 * Register a new `HookExecutor` callback for the given `hook`.
 */
export function registerHook(hook: Hook, executor: HookExecutor): void {
  const registeredHook = registeredHooks[hook]

  if (!registeredHook) {
    throw new Error(`Unable to register hook '${hook}' as it is invalid, please use: ${Object.values(Hook).join(', ')}`)
  }

  registeredHook.push(executor)
}

/**
 * Executes the given `HookExecutor`'s for `hook` and the `type`. Optional environment variables
 * can be passed through to help aid the callback functions.
 */
export function executeHook(hook: Hook, type: HookType, env?: EnvironmentConfig, project?: Project): void {
  const registeredHook = registeredHooks[hook]

  if (!registeredHook) {
    throw new Error(`Unable to execute hook '${hook}' as it is invalid, please use: ${Object.values(Hook).join(', ')}`)
  }

  for (const executor of registeredHook) {
    if (type === HookType.AFTER && executor.after) {
      executor.after(env, project)
    }

    if (type === HookType.BEFORE && executor.before) {
      executor.before(env, project)
    }
  }
}
