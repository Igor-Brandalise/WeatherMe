import { useState } from "react";
import { weatherByCity } from "./services/api";
import type { WeatherData } from "./types/weather";

function App() {
  const [WeatherData, setWeatherData] = useState<WeatherData | null>(null);

  const [ city, setCity] = useState<string>("")

  const handleSearch = async () => {
    try {
      const data = await weatherByCity(city);
      setWeatherData(data);
    } catch (error) {
      console.error("Erro ao buscar dados do clima: ", error);
    }
  };

  return (
    <>
      <div>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)} // Atualiza o estado de city
          placeholder="Digite uma cidade"
        />
      </div>
    </>
  );
}

export default App;
