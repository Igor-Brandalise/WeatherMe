import { useState, useEffect } from "react";
import { weatherByCity } from "./services/api";
import type { WeatherData } from "./types/weather";
import type { City } from "./types/city";
import { fetchCities } from "./services/geoService";

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [query, setQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 380);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setCitySuggestions([]);
      return;
    }
    const fetchData = async () => {
      const results = await fetchCities(debouncedQuery);
      const uniqueCities = results.filter(
        (city, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.name === city.name && c.lat === city.lat && c.lon === city.lon,
          ),
      );
      setCitySuggestions(uniqueCities);
    };
    fetchData();
  }, [debouncedQuery]);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setQuery(`${city.name}, ${city.country}`);
    setCitySuggestions([]);
  };

  const handleSearch = async () => {
    if (!selectedCity?.name) return;
    try {
      const data = await weatherByCity(selectedCity.name);
      setWeatherData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 flex items-center justify-center p-6 selection:bg-sky-500/30">
      <main className="w-full max-w-[440px] relative group">
        {/* Glow de fundo decorativo */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] group-hover:bg-sky-500/20 transition-all duration-700"></div>

        <section className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
          <header className="mb-8">
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-sky-500 mb-1">
              SkyCast
            </h1>
            <p className="text-2xl font-semibold text-white tracking-tight">
              Onde você está?
            </p>
          </header>

          <div className="relative z-20 space-y-4">
            <div className="relative group/input">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: São Paulo, BR"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all"
              />

              {citySuggestions.length > 0 && (
                <ul className="absolute w-full mt-2 bg-[#161d2f] border border-slate-700/50 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
                  {citySuggestions.map((city) => (
                    <li
                      key={`${city.lat}-${city.lon}`}
                      onClick={() => handleSelectCity(city)}
                      className="px-5 py-4 hover:bg-sky-500/10 cursor-pointer transition-colors text-sm flex flex-col"
                    >
                      <span className="text-white font-medium">
                        {city.name}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {city.state || city.country}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={!selectedCity}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)] active:scale-95 transition-all"
            >
              Consultar Clima
            </button>
          </div>

          {weatherData ? (
            <article className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-400/20 blur-3xl rounded-full"></div>
                  <img
                       
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
         
                    className="w-40 h-40 relative z-10 drop-shadow-2xl"
                  />
                </div>

                <div className="text-center -mt-4">
                  <span className="text-7xl font-black text-white tracking-tighter">
                    {Math.round(weatherData.main.temp)}°
                  </span>
                  <h2 className="text-xl font-medium text-slate-300 mt-1">
                    {weatherData.name}
                  </h2>
                  <p className="text-sky-400 font-semibold uppercase text-[10px] tracking-[0.2em] mt-2">
                    {weatherData.weather[0].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-10">
                  <WeatherCard
                    label="Sensação"
                    value={`${Math.round(weatherData.main.feels_like)}°`}
                  />
                  <WeatherCard
                    label="Umidade"
                    value={`${weatherData.main.humidity}%`}
                  />
                  <WeatherCard
                    label="Vento"
                    value={`${weatherData.wind.speed} km/h`}
                    span
                  />
                </div>
              </div>
            </article>
          ) : (
            <div className="mt-12 text-center py-10 border-2 border-dashed border-slate-800 rounded-[2rem]">
              <p className="text-slate-600 text-sm font-medium">
                Aguardando localização...
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function WeatherCard({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div
      className={`bg-slate-950/40 border border-white/5 p-4 rounded-[1.5rem] flex flex-col items-center justify-center ${span ? "col-span-2" : ""}`}
    >
      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">
        {label}
      </span>
      <span className="text-lg font-bold text-white tracking-tight">
        {value}
      </span>
    </div>

  );
}

export default App;
