A modern weather application built with Vue 3, TypeScript, and TailwindCSS. Provides real-time weather data and forecasts for multiple cities.

## Features

- Multi-city weather tracking
- Real-time current weather data
- 5-day weather forecast
- Responsive design
- TypeScript implementation

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- TailwindCSS
- Vite
- WeatherAPI.com

## How to Run

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- WeatherAPI.com API key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd weatherapp
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Get your free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx) and add it to your `.env` file:
   ```env
   VITE_WEATHER_API_KEY=your_api_key_here
   VITE_WEATHER_API_BASE_URL=http://api.weatherapi.com/v1
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Run tests:
   ```bash
   pnpm test
   ```

6. Build for production:
   ```bash
   pnpm build
   ```

The application will be available at `http://localhost:5173`

## Testing

The project includes unit tests using Vitest and Vue Test Utils:

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run
```

Tests cover components, composables, and services in the `/tests` directory.