import React, {Key} from 'react';


import './MiniWeatherCard.css'
import {Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography} from "@mui/material";
import {CityData, getWindDirection, traduireCodeMeteo, WeatherData} from "../App/App";

export interface MiniWeatherCardProps{
    cardId:number
    miniPostCode:string
    miniCityData:CityData
    miniWeatherData:WeatherData
    imgLink:string
    cityRemoveHandler:(key:Key) => void
    cityClickHandler:(props:MiniWeatherCardProps) => void
}

export default function MiniWeatherCard(props:MiniWeatherCardProps){
    return(
        <div>
            <Card sx={{ maxWidth: 250 }} >
                <CardActionArea onClick={() => {props.cityClickHandler(props)}}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={props.imgLink}
                        alt="weather"
                    />
                    <CardContent>

                        <div className="CurrentWeatherContainer">
                            <Typography gutterBottom variant="h5" component="div">
                                {props.miniCityData ? `${props.miniCityData.nom}` : ""}
                            </Typography>
                            <Typography variant="body1">
                                Actuellement :
                            </Typography>
                            <i className="wi wi-day-sunny"></i>
                            <Typography variant="body2" color="text.secondary">
                                {traduireCodeMeteo(props.miniWeatherData?.current_weather.weathercode)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Température : {props.miniWeatherData?.current_weather.temperature}°C
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Vent : {props.miniWeatherData?.current_weather.windspeed}km/h {getWindDirection(props.miniWeatherData?.current_weather.winddirection)}
                            </Typography>
                        </div>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary" onClick={() => props.cityRemoveHandler(props.cardId)}>
                        Remove
                    </Button>
                </CardActions>
            </Card>
        </div>
    )
}