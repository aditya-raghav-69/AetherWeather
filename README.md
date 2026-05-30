# 🌐 Aether Weather App

A dynamic, responsive, interactive weather web application built with **React + Vite**.

## ✨ Features

- 🌤️ **Real-time weather** via OpenWeatherMap API (or vivid mock data for demo)
- 🎨 **Dynamic backgrounds** that change with weather conditions (rain, snow, storms, clear sky, night…)
- 🌧️ **Animated particles** (rain drops, snowflakes, stars, clouds)
- 📊 **Detailed stats**: humidity, wind, pressure, visibility
- ⏱️ **Hourly forecast** with temperature trend bar
- 📅 **5-day outlook**
- 🧭 **Wind compass** with animated needle
- 🌅 **Sun arc** showing sunrise/sunset progress
- 🌡️ **°C / °F** toggle
- 📍 **Geolocation** support
- 🔍 **Quick city chips** for fast navigation
- 📱 **Fully responsive** — mobile, tablet, desktop

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔑 API Key Setup

The app works out of the box with **mock/demo data**. For live weather:

1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Click the **⚙️ settings** button in the app header
3. Paste your API key and click **Save Key**

Your key is stored in `localStorage` — no backend needed.

## 📁 Project Structure

```
weather-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # React entry point
    ├── App.jsx           # Main app component
    ├── App.css           # All component styles
    ├── index.css         # Global styles & animations
    ├── weatherUtils.js   # API, data transforms, helpers
    └── ParticleCanvas.jsx # Animated weather particles
```

--- kindlyy use your own open weather api, no api shared in this repository

Made with ❤️ from **Aditya Pratap Singh**
