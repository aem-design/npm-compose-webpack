import { Hook, HookType } from './enum'

import {
  WebpackEnvironment,
} from './types'

export type EnvironmentConfig = Partial<WebpackEnvironment>

export interface HookExecutor {
  after?(env?: EnvironmentConfig): void;
  before?(env?: EnvironmentConfig): void;
}

export type RegisteredHooks = Record<Hook, HookExecutor[]>

// Internal
const registeredHooks: Partial<RegisteredHooks> = {
  [Hook.POST_INIT] : [],
  [Hook.PRE_INIT]  : [],
}

/**
 * Register a new `HookExecutor` callback for the given `hook`.
 */
export function registerHook(hook: Hook, executor: HookExecutor) {
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
export function executeHook(hook: Hook, type: HookType, env?: EnvironmentConfig) {
  const registeredHook = registeredHooks[hook]

  if (!registeredHook) {
    throw new Error(`Unable to execute hook '${hook}' as it is invalid, please use: ${Object.values(Hook).join(', ')}`)
  }

  for (const executor of registeredHook) {
    if (type === HookType.AFTER && executor.after) {
      executor.after(env)
    }

    if (type === HookType.BEFORE && executor.before) {
      executor.before(env)
    }
  }
}
