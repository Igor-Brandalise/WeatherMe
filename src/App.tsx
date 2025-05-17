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

  // Debounce para não buscar a cada letra digitada imediatamente
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Buscar sugestões ao digitar (com filtro de duplicados)
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setCitySuggestions([]);
      return;
    }
    const fetchData = async () => {
      const results = await fetchCities(debouncedQuery);

      // Remove duplicatas combinando nome + lat + lon como chave única
      const uniqueCities = results.filter((city, index, self) =>
        index === self.findIndex(c =>
          c.name === city.name && c.lat === city.lat && c.lon === city.lon
        )
      );

      setCitySuggestions(uniqueCities);
    };
    fetchData();
  }, [debouncedQuery]);

  // Quando o usuário digitar no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Quando o usuário selecionar uma sugestão
  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setQuery(city.name);
    setCitySuggestions([]);
  };

  // Buscar clima da cidade selecionada
  const handleSearch = async () => {
    if (!selectedCity?.name) {
      alert("Selecione uma cidade válida da lista.");
      return;
    }
    try {
      const data = await weatherByCity(selectedCity.name);
      setWeatherData(data);
    } catch (error) {
      console.error("Erro ao buscar dados do clima: ", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Digite uma cidade"
      />
      {citySuggestions.length > 0 && (
        <ul style={{ border: "1px solid #ccc", paddingLeft: 0 }}>
          {citySuggestions.map((city) => (
            <li
              key={`${city.lat}-${city.lon}`}
              onClick={() => handleSelectCity(city)}
              style={{ cursor: "pointer", listStyle: "none", padding: "5px" }}
            >
              {city.name} {city.state ? `- ${city.state}` : ""}, {city.country}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleSearch}>Buscar</button>

      {weatherData ? (
        <div>
          <h2>{weatherData.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
          <p>{weatherData.weather[0].description}</p>
          <p>Temperatura: {weatherData.main.temp}°C</p>
          <p>Sensação térmica: {weatherData.main.feels_like}°C</p>
          <p>Umidade: {weatherData.main.humidity}%</p>
          <p>Vento: {weatherData.wind.speed} km/h</p>
        </div>
      ) : (
        <p>Busque uma cidade para ver o clima!</p>
      )}
    </div>
  );
}

export default App;
