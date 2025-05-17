import type { City } from "../types/city";

export const fetchCities = async( query: string): Promise<City[]> => {
    try{
        const limit = 5
        const api_key = import.meta.env.VITE_OPENWEATHER_KEY
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${api_key}`

        const response = await fetch(url)
        if(!response.ok){
            throw new Error('Erro ao buscar cidade')
        }

        const data: City[] = await response.json()
        return data
    }catch (error){
        console.error(error)
        return []
    }
}