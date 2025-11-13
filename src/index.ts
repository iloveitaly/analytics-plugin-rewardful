/**
 * Rewardful plugin for Analytics
 *
 * Integrates Rewardful affiliate tracking with the analytics library.
 *
 * @see https://developers.rewardful.com/javascript-api/overview
 */
import { AnalyticsInstance, AnalyticsPlugin } from "analytics"

declare global {
  interface Window {
    rewardful?: any
    Rewardful?: any
    _rwq?: any
  }
}

type Metadata = Record<string, any>

export interface RewardfulPluginConfig {
  apiKey: string
}

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

  // Script injection below is from the Rewardful documentation
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
 * Rewardful analytics plugin
 *
 * @param config - Plugin configuration
 * @param config.apiKey - Your Rewardful API key
 *
 * @example
 * ```typescript
 * import Analytics from 'analytics'
 * import rewardfulPlugin from 'analytics-plugin-rewardful'
 *
 * const analytics = Analytics({
 *   app: 'my-app',
 *   plugins: [
 *     rewardfulPlugin({
 *       apiKey: 'your-api-key'
 *     })
 *   ]
 * })
 *
 * // Track a conversion
 * analytics.plugins.rewardful.conversion('user@example.com')
 * ```
 */
export default function rewardfulPlugin(
  config: RewardfulPluginConfig,
): AnalyticsPlugin {
  let isReady = false

  return {
    name: "rewardful",
    config,

    initialize({ config }: Params): void {
      // Browser only - Rewardful is a client-side script
      if (typeof window === "undefined") {
        return
      }

      if (!config.apiKey) {
        throw new Error("Rewardful API key is required")
      }

      if (injectPreloadScript()) {
        // Only attach a listener once, in case this is initialized multiple times
        window.rewardful("ready", function () {
          isReady = true
        })
      }

      if (!scriptLoaded(SCRIPT_SRC)) {
        insertScript(SCRIPT_SRC, config.apiKey)
      }
    },

    loaded() {
      return isReady
    },

    methods: {
      /**
       * Track a conversion in Rewardful
       *
       * @param email - The email address of the converting user
       */
      conversion(this: { instance: AnalyticsInstance }, email: string) {
        if (typeof window === "undefined" || !window.rewardful) {
          console.warn("Rewardful is not loaded")
          return
        }

        window.rewardful("convert", { email })
      },
    },
  }
}
