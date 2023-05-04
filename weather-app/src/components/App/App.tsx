import React, {Key, MouseEventHandler, useEffect, useState} from 'react';
import {Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";

import './App.css';
import FocusedWeatherCard from "../FocusedWeatherCard/FocusedWeatherCard";
import {constants} from "os";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import MiniWeatherCard, {MiniWeatherCardProps} from "../MiniWeatherCard/MiniWeatherCard";

export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        is_day: number;
        time: string;
    };
    hourly_units: {
        time: string;
        precipitation_probability: string;
        precipitation: string;
        weathercode: string;
    };
    hourly: {
        "time": string[],
        "temperature_2m": number[],
        "apparent_temperature":number[],
        "precipitation_probability": number[],
        "precipitation": number[],
        "weathercode": number[],
        "windspeed_10m": number[],
        "winddirection_10m": number[]
    };
    daily_units: {
        time: string;
        weathercode: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        apparent_temperature_max: string;
        apparent_temperature_min: string;
        precipitation_sum: string;
        precipitation_hours: string;
    };
    daily: {
        time: string[];
        weathercode: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        apparent_temperature_max: number[];
        apparent_temperature_min: number[];
        precipitation_sum: number[];
        precipitation_hours: number[];
    };
}

export interface CityData {
    centre: {
        type: string;
        coordinates: number[];
    };
    nom: string;
    code: string;
}

interface FocusedWeatherCardData{
    focusedPostCode:string
    focusedCityData:CityData
    focusedWeatherData:WeatherData
    imgLink?:string
    addButtonDisabled:boolean
}
interface MiniWeatherCardData{
    miniPostCode:string
    miniCityData:CityData
    miniWeatherData:WeatherData
    imgLink:string
    id:number
}

export default function App() {

    const [postCode,setPostCode] = useState('')
    const [searchedPostCode, setSearchedPostCode] = useState('34000')
    const [searchErrorMsg, setSearchErrorMsg] = useState<string>('')
    const [focusedWeatherCardData, setFocusedWeatherCardData] = useState<FocusedWeatherCardData|null>(null)
    const [miniWeatherCardList, setMiniWeatherCardList] = useState<MiniWeatherCardData[]>([])

    useEffect(() => {
            fetch(`https://geo.api.gouv.fr/communes?codePostal=${searchedPostCode}&fields=centre`)
                .then(response => response.json())
                .then(currentCityData => {
                    if(currentCityData.length>0){
                        let currentCoordinates = currentCityData[0].centre.coordinates
                        fetch(`https://api.open-meteo.com/v1/forecast?longitude=${currentCoordinates[0]}&latitude=${currentCoordinates[1]}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_hours&current_weather=true&forecast_days=4&timezone=auto`)
                            .then(response => response.json())
                            .then(currentWeatherData => {
                                setFocusedWeatherCardData({
                                    focusedWeatherData:currentWeatherData,
                                    focusedCityData:currentCityData[0],
                                    focusedPostCode:searchedPostCode,
                                    addButtonDisabled:false
                                })
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    } else {
                        setSearchErrorMsg(searchedPostCode+" : Aucune ville trouvée")
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
    },[searchedPostCode])

    const handlePostCodeChange = (event : React.ChangeEvent<HTMLInputElement>) => {
       if( /^([0-9]{0,5})$/.test(event.target.value) ){
           setPostCode(event.target.value)
           setSearchErrorMsg("")
       } else if(event.target.value.length>5 && /^[0-9]+$/.test(event.target.value)) {
           setSearchErrorMsg("5 chiffres max")
       } else {
           setSearchErrorMsg(event.target.value.slice(-1)+" : caractère interdit")
       }
    }

    const handleCitySearch = () => {
        if(/^([0-9]{5})$/.test(postCode)){
            setSearchedPostCode(postCode);
        }
    }

    const handleCityAdd = (imgLink:string) => {
        if(focusedWeatherCardData) {
            const cardData: MiniWeatherCardData = {
                miniPostCode: focusedWeatherCardData.focusedPostCode,
                miniCityData: focusedWeatherCardData.focusedCityData,
                miniWeatherData: focusedWeatherCardData.focusedWeatherData,
                imgLink: imgLink,
                id: Date.now()
            }
            setMiniWeatherCardList([...miniWeatherCardList, cardData])
            setFocusedWeatherCardData({
                focusedWeatherData:focusedWeatherCardData.focusedWeatherData,
                focusedPostCode:focusedWeatherCardData.focusedPostCode,
                focusedCityData:focusedWeatherCardData.focusedCityData,
                addButtonDisabled:true
            })
        }
    }

    const handleCityRemove = (key:Key) => {
        if(focusedWeatherCardData!=null &&
            focusedWeatherCardData?.focusedPostCode === miniWeatherCardList.find((cardData => cardData.id == key))?.miniPostCode){
            setFocusedWeatherCardData({
                focusedWeatherData:focusedWeatherCardData.focusedWeatherData,
                focusedPostCode:focusedWeatherCardData.focusedPostCode,
                focusedCityData:focusedWeatherCardData.focusedCityData,
                addButtonDisabled:false
            })
        }
        setMiniWeatherCardList(miniWeatherCardList.filter((cardData => cardData.id != key)))
    }

    const handleMiniCityClick = (props:MiniWeatherCardProps) => {
        setFocusedWeatherCardData({
            focusedWeatherData:props.miniWeatherData,
            focusedCityData:props.miniCityData,
            focusedPostCode:props.miniPostCode,
            imgLink:props.imgLink,
            addButtonDisabled:true
        })
    }

    const getWindDirection = (angleEnDegres?:number): string => {
        if(angleEnDegres || angleEnDegres === 0) {
            let directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW','N'];
            let angleCalcul = angleEnDegres + 22.5;
            let index = Math.round(angleEnDegres / 45) % 8;
            return directions[index];
        } else {
            return ""
        }
    }

    const traduireCodeMeteo = (codeMeteo?: number): string => {
        switch (codeMeteo) {
            case 0:
                return "Ciel dégagé";
            case 1:
                return "Ciel principalement dégagé";
            case 2:
                return "Partiellement nuageux";
            case 3:
                return "Couvert";
            case 45:
                return "Brouillard";
            case 48:
                return "Brouillard givrant";
            case 51:
                return "Bruine légère";
            case 53:
                return "Bruine modérée";
            case 55:
                return "Bruine forte";
            case 56:
                return "Bruine verglaçante légère";
            case 57:
                return "Bruine verglaçante forte";
            case 61:
                return "Pluie légère";
            case 63:
                return "Pluie modérée";
            case 65:
                return "Pluie forte";
            case 66:
                return "Pluie verglaçante légère";
            case 67:
                return "Pluie verglaçante forte";
            case 71:
                return "Neige légère";
            case 73:
                return "Neige modérée";
            case 75:
                return "Neige forte";
            case 77:
                return "Grésil";
            case 80:
                return "Averses de pluie légères";
            case 81:
                return "Averses de pluie modérées";
            case 82:
                return "Averses de pluie violentes";
            case 85:
                return "Averses de neige légères";
            case 86:
                return "Averses de neige fortes";
            case 95:
                return "Orage léger ou modéré";
            case 96:
                return "Orage avec grêle légère";
            case 99:
                return "Orage avec grêle forte";
            default:
                return "Condition météo inconnue";
        }
    }

  return (
    <div className="App">

      <h1>WEATHER REPORT</h1>

        <div className="searchBar">
            <TextField id="postCodeInput" label="Code postal" variant="outlined" size="small"
                       value={postCode} onChange={handlePostCodeChange}
                       error={searchErrorMsg.length>0} helperText={searchErrorMsg}
                       />
            <Button variant="contained" onClick={handleCitySearch}>Search</Button>
        </div>

        <div className="FocusedWeatherCardContainer">
                <FocusedWeatherCard focusedPostCode={focusedWeatherCardData?.focusedPostCode}
                                    focusedWeatherData={focusedWeatherCardData?.focusedWeatherData}
                                    focusedCityData={focusedWeatherCardData?.focusedCityData}
                                    cityAddHandler={handleCityAdd}
                                    getWindDirection={getWindDirection}
                                    weatherCodeTraduction={traduireCodeMeteo}
                                    imgLink={focusedWeatherCardData?.imgLink}
                                    addButtonDisabled={focusedWeatherCardData?.addButtonDisabled}/>
        </div>

        <div className="MiniWeatherCardContainer">
            {miniWeatherCardList.map((cardData:MiniWeatherCardData) => {
                    return(
                        <MiniWeatherCard cardId={cardData.id}
                                         miniPostCode={cardData.miniPostCode}
                                         miniCityData={cardData.miniCityData}
                                         miniWeatherData={cardData.miniWeatherData}
                                         imgLink={cardData.imgLink}
                                         getWindDirection={getWindDirection}
                                         weatherCodeTraduction={traduireCodeMeteo}
                                         cityRemoveHandler={handleCityRemove}
                                         cityClickHandler={handleMiniCityClick}
                                         key={cardData.id} />
                    )
            })}
        </div>

    </div>
  );


}







