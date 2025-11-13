# analytics-plugin-rewardful

> Rewardful plugin for the [Analytics](https://github.com/DavidWells/analytics) library

This library exports the Rewardful plugin for the analytics package. It makes it easier to integrate Rewardful affiliate tracking with your analytics implementation.

## Installation

```bash
pnpm install analytics analytics-plugin-rewardful
```

## Usage

```typescript
import Analytics from 'analytics'
import rewardfulPlugin from 'analytics-plugin-rewardful'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    rewardfulPlugin({
      apiKey: 'your-rewardful-api-key'
    })
  ]
})
```

## Configuration

The plugin accepts a configuration object with the following options:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your Rewardful API key |

## Methods

### `conversion(email: string)`

Track a conversion in Rewardful. This method should be called when a user completes a purchase or other conversion event.

```typescript
// Track a conversion
analytics.plugins.rewardful.conversion('user@example.com')
```

## How it Works

This plugin:

1. Injects the Rewardful preload script into your page
2. Loads the Rewardful tracking script from `https://r.wdfl.co/rw.js`
3. Provides methods to track conversions

The plugin is browser-only and will not execute in server-side environments.

## API Reference

For more information on the Rewardful JavaScript API, see:
- [Rewardful JavaScript API Overview](https://developers.rewardful.com/javascript-api/overview)

## TypeScript

This plugin is written in TypeScript and includes type definitions.

## License

MIT

## Related

- [Analytics](https://github.com/DavidWells/analytics) - Lightweight analytics library
- [Rewardful](https://www.rewardful.com/) - Affiliate and referral tracking for Stripe
