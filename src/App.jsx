import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParticleCanvas from './ParticleCanvas.jsx';
import {
  getWeatherTheme, getWeatherEmoji, getWindDirection,
  formatTime, isDay, generateMockWeather, fetchWeatherReal
} from './weatherUtils.js';
import './App.css';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, delay = 0 }) {
  return (
    <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}<span className="stat-unit">{unit}</span></span>
    </div>
  );
}

//  Forecast Day 
function ForecastDay({ day, high, low, condition, pop, delay = 0 }) {
  return (
    <div className="forecast-day animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <span className="forecast-day-name">{day}</span>
      <span className="forecast-emoji">{getWeatherEmoji(condition)}</span>
      <span className="forecast-condition">{condition}</span>
      {pop > 20 && <span className="forecast-pop">💧 {pop}%</span>}
      <div className="forecast-temps">
        <span className="forecast-high">{high}°</span>
        <span className="forecast-divider">/</span>
        <span className="forecast-low">{low}°</span>
      </div>
    </div>
  );
}

//  Hourly Strip
function HourlyStrip({ hourly }) {
  return (
    <div className="hourly-strip">
      {hourly.map((h, i) => (
        <div key={i} className="hourly-item animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
          <span className="hourly-time">{h.time}</span>
          <span className="hourly-emoji">{getWeatherEmoji(h.condition)}</span>
          <span className="hourly-temp">{h.temp}°</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sun Arc ──────────────────────────────────────────────────────────────────
function SunArc({ sunrise, sunset, current }) {
  const total = sunset - sunrise;
  const elapsed = Math.max(0, Math.min(current - sunrise, total));
  const pct = total > 0 ? elapsed / total : 0;
  const angle = Math.PI * pct; // 0 → π
  const cx = 120, cy = 90, r = 75;
  const x = cx + r * Math.cos(Math.PI - angle);
  const y = cy - r * Math.sin(angle);
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="sun-arc-container animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <h4 className="section-title">Sun Journey</h4>
      <svg viewBox="0 0 240 100" className="sun-arc-svg">
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff9a56" />
            <stop offset="50%" stopColor="#f9ca24" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <path d={d} fill="none" stroke="url(#arcGrad)" strokeWidth="2.5"
          strokeDasharray={`${Math.PI * r * pct} ${Math.PI * r}`} />
        <circle cx={x} cy={y} r="7" fill="#f9ca24" opacity="0.9">
          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={x} cy={y} r="14" fill="#f9ca24" opacity="0.15">
          <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={cx - r - 2} y={cy + 14} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">Rise</text>
        <text x={cx + r + 2} y={cy + 14} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">Set</text>
      </svg>
      <div className="sun-times">
        <span>🌅 Rise</span>
        <span className="sun-time-val">—</span>
        <span>🌇 Set</span>
      </div>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <p className="loading-text">Fetching skies…</p>
    </div>
  );
}



// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [activeTab, setActiveTab] = useState('now');
  const inputRef = useRef(null);

  const toUnit = (c) => unit === 'C' ? c : Math.round(c * 9 / 5 + 32);
  const unitLabel = unit === 'C' ? '°C' : '°F';

  const theme = weather
    ? getWeatherTheme(weather.condition, isDay(weather.sunrise, weather.sunset, weather.current_time))
    : { bg: 'linear-gradient(160deg, #0d1b2a 0%, #1b2d4a 100%)', accent: '#a8d8f0', particles: 'stars' };

  const fetchWeather = useCallback(async (city) => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherReal(city, import.meta.env.VITE_WEATHER_API_KEY);
      setWeather(data);
      setActiveTab('now');
    } catch (e) {
      setError(e.message || 'Could not fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default city on mount
  useEffect(() => {
    fetchWeather('New Delhi');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) fetchWeather(query.trim());
  };

  const handleGeo = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`);
          const d = await res.json();
          fetchWeather(d.name);
        } catch { setLoading(false); setError('Location error'); }
      },
      () => { setLoading(false); setError('Location permission denied'); }
    );
  };

  const tempColor = (t) => {
    if (t < 0) return '#a8d8f0';
    if (t < 15) return '#74b9ff';
    if (t < 25) return '#f9ca24';
    if (t < 35) return '#fd9644';
    return '#ee5a24';
  };

  return (
    <div className="app" style={{ background: theme.bg }}>
      {/* Animated background particles */}
      <div className="particle-layer">
        <ParticleCanvas type={theme.particles} />
      </div>

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      <div className="content-wrapper">
        {/* ── Header ── */}
        <header className="app-header animate-fade-up">
          <div className="logo">
            <span className="logo-icon">🌐</span>
            <span className="logo-text">Aether</span>
          </div>
          <div className="header-actions">
            <button
              className="unit-toggle"
              onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
              title="Toggle unit"
            >
              {unit === 'C' ? '°F' : '°C'}
            </button>
          </div>
        </header>

        {/* ── Search Bar ── */}
        <form className="search-form animate-fade-up animate-delay-1" onSubmit={handleSearch}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              placeholder="Search city…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="clear-btn" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
            )}
          </div>
          <button type="button" className="geo-btn" onClick={handleGeo} title="My location">
            📍
          </button>
          <button type="submit" className="search-submit">Search</button>
        </form>

        {/* ── Quick Cities ── */}
        <div className="quick-cities animate-fade-up animate-delay-2">
          {['New Delhi', 'Mumbai', 'London', 'Tokyo', 'New York', 'Paris'].map(c => (
            <button key={c} className={`city-chip ${weather?.city === c ? 'active' : ''}`}
              onClick={() => { setQuery(c); fetchWeather(c); }}>
              {c}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-msg">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <LoadingScreen />}

        {/* ── Weather Content ── */}
        {weather && !loading && (
          <main className="weather-main">
            {/* Hero */}
            <section className="hero-section">
              <div className="hero-left">
                <div className="location-row animate-fade-up">
                  <h1 className="city-name">{weather.city}</h1>
                  <span className="country-badge">{weather.country}</span>
                </div>
                <p className="condition-text animate-fade-up animate-delay-1">
                  {weather.description}
                </p>
                <div className="temp-display animate-fade-up animate-delay-2">
                  <span className="temp-num" style={{ color: tempColor(toUnit(weather.temp)) }}>
                    {toUnit(weather.temp)}
                  </span>
                  <span className="temp-label">{unitLabel}</span>
                </div>
                <p className="feels-like animate-fade-up animate-delay-3">
                  Feels like {toUnit(weather.feels_like)}{unitLabel}
                </p>
              </div>
              <div className="hero-right animate-fade-up animate-delay-2">
                <div className="weather-emoji-big">{getWeatherEmoji(weather.condition)}</div>
              </div>
            </section>

            {/* Tabs */}
            <div className="tabs animate-fade-up animate-delay-3">
              {['now', 'hourly', 'forecast'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'now' ? '📊 Now' : tab === 'hourly' ? '⏱️ Hourly' : '📅 5-Day'}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            {activeTab === 'now' && (
              <div className="panel">
                {/* Stats grid */}
                <div className="stats-grid">
                  <StatCard icon="💧" label="Humidity" value={weather.humidity} unit="%" delay={0.0} />
                  <StatCard icon="💨" label="Wind" value={`${weather.wind_speed} ${getWindDirection(weather.wind_deg)}`} unit=" km/h" delay={0.05} />
                  <StatCard icon="🔵" label="Pressure" value={weather.pressure} unit=" hPa" delay={0.1} />
                  <StatCard icon="👁️" label="Visibility" value={weather.visibility} unit=" km" delay={0.15} />
                  {weather.uv_index && <StatCard icon="☀️" label="UV Index" value={weather.uv_index} unit="" delay={0.2} />}
                </div>

                {/* Sun arc */}
                <SunArc
                  sunrise={weather.sunrise}
                  sunset={weather.sunset}
                  current={weather.current_time}
                />

                {/* Wind compass */}
                <div className="wind-compass animate-fade-up" style={{ animationDelay: '0.5s' }}>
                  <h4 className="section-title">Wind Direction</h4>
                  <div className="compass">
                    <div className="compass-ring">
                      {['N','E','S','W'].map((d, i) => (
                        <span key={d} className="compass-dir" style={{ transform: `rotate(${i * 90}deg) translateY(-38px) rotate(-${i * 90}deg)` }}>{d}</span>
                      ))}
                      <div
                        className="compass-needle"
                        style={{ transform: `rotate(${weather.wind_deg}deg)` }}
                      />
                      <div className="compass-center" />
                    </div>
                    <p className="compass-label">{weather.wind_speed} km/h · {getWindDirection(weather.wind_deg)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hourly' && (
              <div className="panel">
                <h4 className="section-title animate-fade-up">Next 24 Hours</h4>
                <HourlyStrip hourly={weather.hourly} />
                {/* Temp trend bar */}
                <div className="temp-trend animate-fade-up animate-delay-2">
                  {weather.hourly.map((h, i) => {
                    const maxT = Math.max(...weather.hourly.map(x => x.temp));
                    const minT = Math.min(...weather.hourly.map(x => x.temp));
                    const pct = maxT !== minT ? ((h.temp - minT) / (maxT - minT)) * 100 : 50;
                    return (
                      <div key={i} className="trend-bar-wrap" title={`${h.temp}°`}>
                        <div className="trend-bar" style={{ height: `${Math.max(10, pct)}%`, background: tempColor(h.temp) }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'forecast' && (
              <div className="panel">
                <h4 className="section-title animate-fade-up">5-Day Outlook</h4>
                <div className="forecast-grid">
                  {weather.forecast.map((f, i) => (
                    <ForecastDay key={i} {...f} delay={i * 0.07} />
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        {/* Empty state */}
        {!weather && !loading && !error && (
          <div className="empty-state animate-fade-up animate-delay-2">
            <span className="empty-icon">🌍</span>
            <p>Search a city to see the weather</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p>Made with ❤️ from <strong>Aditya Pratap Singh</strong></p>
        <p className="footer-sub">Real-time weather · Responsive · Interactive</p>
      </footer>
    </div>
  );
}
