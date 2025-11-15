/**
 * Rewardful plugin for Analytics
 *
 * There's no npm package, so we need to load it directly into the browser, like google analytics.
 *
 * https://developers.rewardful.com/javascript-api/overview
 *
 * Example plugins:
 *
 * - https://github.com/deevus/analytics-plugin-posthog/blob/main/src/index.ts
 * - https://github.com/deevus/analytics-plugin-tapfiliate/blob/develop/src/index.ts
 * - https://github.com/metro-fs/analytics-plugin-posthog/blob/main/src/index.ts
 * - https://github.com/DavidWells/analytics/blob/master/packages/analytics-plugin-google-tag-manager/src/browser.js
 */
import { AnalyticsInstance, AnalyticsPlugin } from "analytics"

// Rewardful function type
interface RewardfulFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (action: string, ...args: any[]): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  q?: any[]
}

declare global {
  interface Window {
    rewardful?: RewardfulFunction
    Rewardful?: unknown
    _rwq?: string
    // Allow dynamic string indexing for the preload script
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

// TODO why is this needed? Why can't we define this within analytics?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metadata = Record<string, any>

export interface RewardfulPluginConfig {
  apiKey: string
}

// TODO feels like this should be in the analytics package as well
interface Params {
  payload: {
    event: string
    userId: string
    properties: Metadata
    traits: Metadata
  }
  config: RewardfulPluginConfig
  instance: AnalyticsInstance
}

const SCRIPT_SRC = "https://r.wdfl.co/rw.js"

export function scriptLoaded(scriptSrc: string): boolean {
  const scripts = document.querySelectorAll<HTMLScriptElement>("script[src]")

  return Array.from(scripts).some((script) => script.src === scriptSrc)
}

export function insertScript(scriptSrc: string, apiKey: string): void {
  const scriptElement = document.createElement("script")
  scriptElement.src = scriptSrc
  scriptElement.async = true
  scriptElement.type = "text/javascript"
  scriptElement.setAttribute("data-rewardful", apiKey)

  document.head.appendChild(scriptElement)
}

/**
 * Inject `window.rewardful` preload script
 *
 * @see https://developers.rewardful.com/javascript-api/overview
 */
function injectPreloadScript() {
  if (typeof window.rewardful !== "undefined")
    return false

  // script injection below is copy/pasted from the rewardful docs
  ;(function (w, r) {
    w._rwq = r
    w[r] =
      w[r] ||
      function () {
        ;(w[r].q = w[r].q || []).push(arguments)
      }
  })(window, "rewardful")

  return true
}

/**
 * Inject `window.rewardful`
 *
 * https://developers.rewardful.com/javascript-api/overview
 */
export default function rewardfulPlugin(
  config: RewardfulPluginConfig,
): AnalyticsPlugin {
  let isReady = false

  return {
    name: "rewardful",
    config,

    initialize({ config }: Params): void {
      // browser only
      if (typeof window === "undefined") {
        return
      }

      if (injectPreloadScript()) {
        // only attach a listener once, in case this is initialized multiple times
        window.rewardful?.("ready", function () {
          isReady = true
        })
      }

      if (!scriptLoaded(SCRIPT_SRC)) {
        insertScript(SCRIPT_SRC, config.apiKey)
      }
    },

    // TODO support conversion event via `track`?
    // page: ({ payload }: Params) => {},
    // track: ({ payload }: Params) => {},
    // identify: ({ payload }: Params) => {},

    loaded() {
      return isReady
    },

    methods: {
      conversion(this: { instance: AnalyticsInstance }, email: string) {
        // this methods accepts no additional arguments/traits
        window.rewardful?.("convert", { email })
      },
    },
  }
}
