
export interface WeatherData {
    name: string;

    main: {
        temp:number;
        humidity: number;
        feels_like: number;
        temp_min: number;
        temp_max:number;
    }

    weather:{
        description: string;
        icon: string;

    }[];
    wind:{
        peed: number;
    }
}