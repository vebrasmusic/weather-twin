'use client'

import React from "react";
import { MainForm } from "@/components/andres/mainForm"
import { Separator } from "@/components/ui/separator";

export default function Home() {

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
              <h1 className="text-slate-200 font-bold text-4xl">Weather Twin</h1>
              <h2 className="text-slate-400 font-semibold text-1xl">Find which city has a similar climate to yours!</h2>
            </div>
            <MainForm />
          </div>
          {/* Spacer */}
          <Separator className="h-full my-4" orientation="vertical"/>
          {/* right hand div with 3D canvas */}
          <div className="flex flex-col gap-4">

          </div>
        </div>
        {/* footer */}
        <div className="absolute bottom-2">
          <h3 className="text-slate-400 font-bold text-sm">Made by <a href="https://andresduvvuri.com" className="text-slate-300 hover:text-slate-400">Andrés Duvvuri</a>, powered by <a href="https://openweathermap.org/api" className="text-slate-300 hover:text-slate-400">OpenWeather</a></h3>
        </div>
      </section>
      {/* about section */}
      <section>
        <h1 className="text-slate-200 font-bold text-4xl">About</h1>
      </section>
    </main>
  );
}
