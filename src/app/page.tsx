'use client'

import React from "react";

import { MainForm } from "@/components/andres/mainForm"
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useState } from "react";
import { z } from "zod"
import { APIProvider, Map } from "@vis.gl/react-google-maps";
const apiUrl = process.env.NEXT_PUBLIC_API_URL


export default function Home() {

  const [matchedCities, setMatchedCities] = useState<any>([]);

  async function onSubmit(values: any) {
    const params = {
        cityName: values.cityName
    }

    try {
        const response = await axios.get(`${apiUrl}/cities/match`, {params});   
        //TODO: loading screen
        const matchedCityObjects = response.data.globalMatchedCities;
        //console.log(matchedCities);
        setMatchedCities(matchedCityObjects);
    } catch (error) {
        console.log(error);
        //TODO: error message did u type it in right?
    }
}

  return (
    <main>
      {/* find ur city section */}
      <section className="flex flex-col items-center gap-10 justify-center h-screen bg-slate-950">
        {/* horizontal main div */}
        <div className="flex flex-row gap-10">
          {/* left hand div with title, form */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <h1 className="text-slate-200 font-bold text-4xl"><a href="/">Weather Twin</a></h1>
              <h2 className="text-slate-400 font-semibold text-1xl">Find cities with climates matching your own!</h2>
            </div>
            <MainForm onSubmit={onSubmit}/>
          </div>
          {/* Spacer */}
          <Separator className="h-full my-4" orientation="vertical"/>
          {/* right hand div with 3D canvas */}
          <div className="flex flex-col w-full h-full gap-4 text-slate-400 font-semibold text-1xl items-center justify-center">
            {matchedCities.map((city: { id: string; score: number; metadata: any }) => (
                <div key={city.id}>{city.id}, {city.score},{city.metadata.latitude}, {city.metadata.longitude}</div> // Adjusted to render city.id or any other property you're interested in
            ))}
            <APIProvider apiKey="AIzaSyBDn7ORoKc3ky6RMxkpXvDaWRFIp92WHpQ">
              <Map zoom={10} center={{lat: 53.54992, lng: 10.00678}} />
            </APIProvider>
          </div>
        </div>
        {/* footer */}
        <div className="absolute bottom-2">
          <h3 className="text-slate-400 font-bold text-sm">Made by <a href="https://andresduvvuri.com" className="text-slate-300 hover:text-slate-400">Andrés Duvvuri</a>, powered by <a href="https://openweathermap.org/api" className="text-slate-300 hover:text-slate-400">OpenWeather</a></h3>
        </div>
      </section>
      {/* about section */}
      <section className="flex flex-col items-center gap-10 justify-center h-screen bg-slate-900">
        <h1 className="text-slate-200 font-bold text-4xl">About</h1>
      </section>
    </main>
  );
}
