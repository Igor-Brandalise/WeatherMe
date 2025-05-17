import type{ WeatherData } from "../types/weather";

const API_key = import.meta.env.VITE_OPENWEATHER_KEY

export const weatherByCity = async (city:string): Promise<WeatherData> => {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric&lang=pt_br`
    )

    if(!response.ok){
        throw new Error("Erro ao buscar dados da API")
    }

    const data: WeatherData = await response.json()
    return data
}
