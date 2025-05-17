import { useState } from "react";
import { weatherByCity } from "./services/api";
import type { WeatherData } from "./types/weather";

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const [city, setCity] = useState<string>("");

  const handleSearch = async () => {
    try {
      const data = await weatherByCity(city);
      setWeatherData(data);
    } catch (error) {
      console.error("Erro ao buscar dados do clima: ", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Digite uma cidade"
      />

      <button onClick={handleSearch}>Buscar</button>

      {weatherData ? (
        <div>
          <h2>{weatherData.name}</h2> {/* Nome da cidade */}
 
        <p>{weatherData.weather[0].description}</p> {/* Descrição do clima (ex: ensolarado) */}
        <p>Temperatura: {weatherData.main.temp}°C</p> {/* Temperatura */}
        <p>Sensação térmica: {weatherData.main.feels_like}°C</p> {/* Sensação térmica */}
        <p>Umidade: {weatherData.main.humidity}%</p> {/* Umidade */}
        <p>Vento: {weatherData.wind.speed} km/h</p> {/* Velocidade do vento */}
        </div>
      ) : (
        <p>Busque uma cidade para ver o clima!</p>
      )}
    </div>
  );
}

export default App;
