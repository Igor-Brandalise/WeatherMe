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
    }, 550);
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
      const uniqueCities = results.filter(
        (city, index, self) =>
          index === self.findIndex(
            (c) =>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] to-[#253349] text-white">
      <div className="">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Digite uma cidade"
          className="border-1 p-2 text-center border-gray-400"
        />
        {citySuggestions.length > 0 && (
          <ul style={{ border: "1px solid #ccc", paddingLeft: 0 }}>
            {citySuggestions.map((city) => (
              <li
                key={`${city.lat}-${city.lon}`}
                onClick={() => handleSelectCity(city)}
                style={{ cursor: "pointer", listStyle: "none", padding: "5px" }}
              >
                {city.name} {city.state ? `- ${city.state}` : ""},{" "}
                {city.country}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleSearch}
          className="m-3 border border-gray-400 w-[4.5em] h-[2em]"
        >
          Buscar
        </button>
      </div>

      {weatherData ? (
        <div className="flex flex-col p-5 ">
          <h2>{weatherData.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
          <p className="p-1 font-bold">{weatherData.weather[0].description}</p>
          <p className="p-1 font-bold">
            Temperatura: {weatherData.main.temp}°C
          </p>
          <p className="p-1 font-bold">
            Sensação térmica: {weatherData.main.feels_like}°C
          </p>
          <p className="p-1 font-bold">Umidade: {weatherData.main.humidity}%</p>
          <p className="p-1 font-bold">Vento: {weatherData.wind.speed} km/h</p>
        </div>
      ) : (
        <p className="mt-4">Busque uma cidade para ver o clima!</p>
      )}
    </div>
  );
}

export default App;
