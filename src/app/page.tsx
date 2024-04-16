'use client'
import React from "react";

import { MainForm } from "@/components/andres/mainForm"
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { MainDiv } from "@/components/andres/mainDiv";
import { LoadingDiv } from "@/components/andres/loadingDiv";
import { ResultsDiv } from "@/components/andres/resultsDiv";

const apiUrl = process.env.NEXT_PUBLIC_API_URL


export default function Home() {

  const [globalMatchedCities, setGlobalMatchedCities] = useState<any>([]);
  const [queryCity, setQueryCity] = useState<any>([]);
  const [USMatchedCity, setUSMatchedCity] = useState<any>([]);
  const [currentState, setCurrentState] = useState("main");

  const renderDiv = () => {
    switch (currentState){
      case "loading":
        return <LoadingDiv/>
      case "main":
        return <MainDiv onSubmit={onSubmit}/>
      case "success":
        return <ResultsDiv globalMatchedCities={globalMatchedCities} queryCity={queryCity} USMatchedCity={USMatchedCity}/>
      case "error":
        return <div>Error</div>
      default:
        return <MainDiv onSubmit={onSubmit}/>
    }
  }

  async function onSubmit(values: any) {
    const params = {
        cityName: values.cityName
    }

    try {
        setCurrentState("loading");
        const response = await axios.get(`${apiUrl}/cities/match`, {params});   
        //TODO: loading screen
        const globalMatchedCityObject = response.data.globalMatchedCities;
        const queryCityObject = response.data.queryCity;
        const USMatchedCityObject = response.data.USMatchedCity;
        //console.log(matchedCities);
        setGlobalMatchedCities(globalMatchedCityObject);
        setQueryCity(queryCityObject);
        setUSMatchedCity(USMatchedCityObject);
        setCurrentState("success");
    } catch (error) {
        setCurrentState("error");
        console.log(error);
        //TODO: error message did u type it in right?
    }
}

  return (
    <main>
      {/* find ur city section */}
      <section className="flex flex-col items-center gap-10 justify-center h-screen bg-slate-950">
        {/* horizontal main div */}
        {renderDiv()}
        {/* footer */}
        <div className="absolute bottom-2">
          <h3 className="text-slate-400 font-bold text-sm">Made by <a href="https://andresduvvuri.com" className="text-slate-300 hover:text-slate-400">Andrés Duvvuri</a></h3>
        </div>
      </section>
      {/* about section */}
      <section className="flex flex-col items-center gap-10 justify-center h-screen bg-slate-900">
        <h1 className="text-slate-200 font-bold text-4xl">About</h1>
      </section>
    </main>
  );
}
