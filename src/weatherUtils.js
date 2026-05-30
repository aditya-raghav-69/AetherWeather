// API key for the live data 
const apiKey = import.meta.env.VITE_WEATHER_API_KEY;  





// Weather conditions mapped to visual themes
export const weatherThemes = {
  clear_day: {
    bg: 'linear-gradient(160deg, #1a6fc4 0%, #56a0d3 40%, #87ceeb 100%)',
    accent: '#f9ca24',
    particles: 'sun',
  },
  clear_night: {
    bg: 'linear-gradient(160deg, #0d1b2a 0%, #1b2d4a 50%, #243b55 100%)',
    accent: '#a8d8f0',
    particles: 'stars',
  },
  clouds: {
    bg: 'linear-gradient(160deg, #485563 0%, #29323c 100%)',
    accent: '#b0bec5',
    particles: 'clouds',
  },
  rain: {
    bg: 'linear-gradient(160deg, #2c3e50 0%, #3d5a6e 50%, #4a6b82 100%)',
    accent: '#74b9ff',
    particles: 'rain',
  },
  thunderstorm: {
    bg: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#fdcb6e',
    particles: 'thunder',
  },
  snow: {
    bg: 'linear-gradient(160deg, #b8cce4 0%, #d6e8f5 50%, #eaf4fb 100%)',
    accent: '#74b9ff',
    particles: 'snow',
  },
  mist: {
    bg: 'linear-gradient(160deg, #606c88 0%, #9da5b4 100%)',
    accent: '#dfe6e9',
    particles: 'mist',
  },
  dawn: {
    bg: 'linear-gradient(160deg, #2d1b69 0%, #b5451b 40%, #ff9a56 80%, #ffd89b 100%)',
    accent: '#ff9a56',
    particles: 'sun',
  },
};

export function getWeatherTheme(condition, isDay = true) {
  const key = condition.toLowerCase();
  if (key.includes('thunder')) return weatherThemes.thunderstorm;
  if (key.includes('drizzle') || key.includes('rain')) return weatherThemes.rain;
  if (key.includes('snow') || key.includes('sleet')) return weatherThemes.snow;
  if (key.includes('mist') || key.includes('fog') || key.includes('haze')) return weatherThemes.mist;
  if (key.includes('cloud') || key.includes('overcast')) return weatherThemes.clouds;
  if (key.includes('clear') || key.includes('sun')) return isDay ? weatherThemes.clear_day : weatherThemes.clear_night;
  return isDay ? weatherThemes.clear_day : weatherThemes.clear_night;
}

export function getWeatherEmoji(condition) {
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('drizzle')) return '🌦️';
  if (c.includes('rain')) return '🌧️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('sleet')) return '🌨️';
  if (c.includes('mist') || c.includes('fog')) return '🌫️';
  if (c.includes('haze')) return '🌁';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('overcast')) return '🌥️';
  if (c.includes('sun') || c.includes('clear')) return '☀️';
  return '🌡️';
}

export function getWindDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function formatTime(timestamp, timezone = 0) {
  const date = new Date((timestamp + timezone) * 1000);
  const h = date.getUTCHours();
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

export function isDay(sunrise, sunset, current) {
  return current > sunrise && current < sunset;
}

// Mock weather data generator for demo/fallback
export function generateMockWeather(city = 'New Delhi') {
  const conditions = [
    'Clear Sky', 'Few Clouds', 'Scattered Clouds', 'Broken Clouds',
    'Light Rain', 'Moderate Rain', 'Thunderstorm', 'Light Snow', 'Mist'
  ];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.round(Math.random() * 35 + 10);
  const now = Math.floor(Date.now() / 1000);

  return {
    city,
    country: 'IN',
    temp,
    feels_like: temp - Math.round(Math.random() * 5),
    condition,
    description: condition.toLowerCase(),
    humidity: Math.round(Math.random() * 60 + 30),
    wind_speed: Math.round(Math.random() * 25 + 2),
    wind_deg: Math.round(Math.random() * 360),
    pressure: Math.round(Math.random() * 30 + 1000),
    visibility: Math.round(Math.random() * 8 + 2),
    uv_index: Math.round(Math.random() * 10 + 1),
    sunrise: now - 3600 * 4,
    sunset: now + 3600 * 4,
    timezone: 19800,
    current_time: now,
    forecast: Array.from({ length: 5 }, (_, i) => ({
      day: ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      high: temp + Math.round(Math.random() * 6 - 2),
      low: temp - Math.round(Math.random() * 10 + 3),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      pop: Math.round(Math.random() * 80),
    })),
    hourly: Array.from({ length: 8 }, (_, i) => ({
      time: `${(new Date().getHours() + i * 3) % 24}:00`,
      temp: temp + Math.round(Math.random() * 8 - 4),
      condition: conditions[Math.floor(Math.random() * 4)],
    })),
  };
}

// Real OpenWeatherMap fetch (users can add their own key)
export async function fetchWeatherReal(city, apiKey) {
  const base = 'https://api.openweathermap.org/data/2.5';
  const res = await fetch(`${base}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
  if (!res.ok) throw new Error(`City not found`);
  const d = await res.json();

  const forecastRes = await fetch(`${base}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
  const forecastData = await forecastRes.json();

  const dailyMap = {};
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en', { weekday: 'short' });
    if (!dailyMap[day]) {
      dailyMap[day] = { temps: [], condition: item.weather[0].main, pop: item.pop * 100 };
    }
    dailyMap[day].temps.push(item.main.temp);
  });

  const forecast = Object.entries(dailyMap).slice(0, 5).map(([day, v]) => ({
    day,
    high: Math.round(Math.max(...v.temps)),
    low: Math.round(Math.min(...v.temps)),
    condition: v.condition,
    pop: Math.round(v.pop),
  }));

  const hourly = forecastData.list.slice(0, 8).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true }),
    temp: Math.round(item.main.temp),
    condition: item.weather[0].main,
  }));

  return {
    city: d.name,
    country: d.sys.country,
    temp: Math.round(d.main.temp),
    feels_like: Math.round(d.main.feels_like),
    condition: d.weather[0].main,
    description: d.weather[0].description,
    humidity: d.main.humidity,
    wind_speed: Math.round(d.wind.speed * 3.6),
    wind_deg: d.wind.deg || 0,
    pressure: d.main.pressure,
    visibility: Math.round((d.visibility || 10000) / 1000),
    uv_index: null,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    timezone: d.timezone,
    current_time: d.dt,
    forecast,
    hourly,
  };
}
