import React, {useEffect, useState} from 'react';
import {Button, Card, CardActionArea, CardActions, CardContent, CardMedia, TextField, Typography} from "@mui/material";

import './FocusedWeatherCard.css'
//Passer la valeur de la direction du vent et du code météo calculés en amont au lieu d'importer la fonction
import {CityData, WeatherData} from "../App/App";
import {Simulate} from "react-dom/test-utils"
import error = Simulate.error;

export interface FocusedWeatherCardProps {
    focusedPostCode?: string
    focusedCityData?: CityData
    focusedWeatherData?: WeatherData
    imgLink?: string
    addButtonDisabled?: boolean
    cityAddHandler: (imgLink: string) => void
    getWindDirection: (angleEnDegres?: number) => string
    weatherCodeTraduction: (codeMeteo?: number) => string
}


export default function FocusedWeatherCard(props: FocusedWeatherCardProps) {

    const [imgLink, setImgLink] = useState('https://images.photowall.com/products/65706/lizard-life.jpg?h=699&q=85')
    const [hoursPrevision, setHoursPrevision] = useState(0)
    const [hourlyStartIndex, setHourlyStartIndex] = useState(0)


    useEffect(() => {
        if (props.focusedCityData && props.focusedCityData.nom != 'Montpellier') {
            if (props.imgLink) {
                setImgLink(props.imgLink)
            } else {
                fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyDeGahhYuic0QMDZaa_fMBO-m8AwRP5zJA&cx=90346a7b158bf40aa&searchType=image&q=${props.focusedCityData?.nom} ville`)
                    .then(response => response.json())
                    .then((data) => {
                        if (data) {
                            setImgLink(data.items[0].link)
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        }
    }, [props.focusedCityData])

    useEffect(() => {
        if (props.focusedWeatherData) {
            setHourlyStartIndex(props.focusedWeatherData.hourly.time.indexOf(props.focusedWeatherData.current_weather.time))
        }
    })

    const handleHoursChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(/^[0][0-9]+$/.test(event.target.value)){
            event.target.value = event.target.value.slice(1)
        }
        if (event.target.value === '') {
            setHoursPrevision(0)
        } else if (/^[0-9]+$/.test(event.target.value)) {
            const hours: number = parseInt(event.target.value)
            if (hours < 0) {
                setHoursPrevision(0)
            } else if (hours > 72) {
                setHoursPrevision(72)
            } else {
                setHoursPrevision(hours)
            }
        }
    }

    return (
        <div>
            <Card sx={{maxWidth: 500}}>
                <CardMedia
                    component="img"
                    height="140"
                    image={imgLink}
                    alt={`Photo de la ville de ${props.focusedCityData?.nom}`}
                />
                <CardContent>

                    <Typography gutterBottom variant="h5" component="div" sx={{marginBottom: 2, marginTop: 0.5}}>
                        {props.focusedCityData ? `${props.focusedCityData.nom} (${props.focusedPostCode})` : ""}
                    </Typography>

                    <div style={{display: "flex", gap: "1rem", justifyContent: "space-evenly"}}>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                            flexDirection: "column",
                            width: 200
                        }}>
                            <div className="CurrentWeatherContainer">
                                <Typography variant="body1">
                                    Actuellement :
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.weatherCodeTraduction(props.focusedWeatherData?.current_weather.weathercode)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.focusedWeatherData?.current_weather.temperature}°C
                                    / {props.focusedWeatherData?.hourly.apparent_temperature[hourlyStartIndex]}°C
                                    ressentis
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Vent
                                    : {props.focusedWeatherData?.current_weather.windspeed}km/h {props.getWindDirection(props.focusedWeatherData?.current_weather.winddirection)}
                                </Typography>
                            </div>

                            <div className="TodayWeatherContainer">
                                <Typography variant="body1">
                                    Aujourd'hui :
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.weatherCodeTraduction(props.focusedWeatherData?.daily.weathercode[0])}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Minimum : {props.focusedWeatherData?.daily.temperature_2m_min[0]}°C
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Maximum : {props.focusedWeatherData?.daily.temperature_2m_max[0]}°C
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.focusedWeatherData?.daily.precipitation_sum[0] === 0 ?
                                        "Précipitations : < 0,1mm" :
                                        `Précipitations : ${props.focusedWeatherData?.daily.precipitation_sum[0]}mm en ${props.focusedWeatherData?.daily.precipitation_hours[0]}h`}
                                </Typography>

                            </div>
                        </div>

                        <div style={{width: 200}}>
                            <div className="HourlyWeatherContainer">
                                <TextField type="number" size="small" sx={{width: 115}}
                                           label={`Dans ${hoursPrevision} heures`}
                                           value={hoursPrevision} onChange={handleHoursChanged}/>
                                <Typography variant="body2" color="text.secondary">
                                    {props.weatherCodeTraduction(props.focusedWeatherData?.hourly.weathercode[hourlyStartIndex + hoursPrevision])}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.focusedWeatherData?.hourly.temperature_2m[hourlyStartIndex + hoursPrevision]}°C
                                    / {props.focusedWeatherData?.hourly.apparent_temperature[hourlyStartIndex + hoursPrevision]}°C
                                    ressentis
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Vent
                                    : {props.focusedWeatherData?.hourly.windspeed_10m[hourlyStartIndex + hoursPrevision]}km/h {props.getWindDirection(props.focusedWeatherData?.hourly.winddirection_10m[hourlyStartIndex + hoursPrevision])}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`${props.focusedWeatherData?.hourly.precipitation_probability[hourlyStartIndex + hoursPrevision]}% de chances de précipitation`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {props.focusedWeatherData?.hourly.precipitation[hourlyStartIndex + hoursPrevision] === 0 ?
                                        "Précipitations : < 0,1mm" :
                                        `Précipitations : ${props.focusedWeatherData?.hourly.precipitation[hourlyStartIndex + hoursPrevision]}mm`}
                                </Typography>
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardActions>
                    <Button size="small" color="primary" onClick={() => props.cityAddHandler(imgLink)}
                            disabled={props.addButtonDisabled}>
                        Add to list
                    </Button>
                </CardActions>
            </Card>
        </div>
    )
}