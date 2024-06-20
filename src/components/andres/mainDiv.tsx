import React, { useState } from "react";
import { MainForm } from "@/components/andres/mainForm"

type MainFormProps = {
    onSubmit: (data: any) => void; // Adjust the type based on your actual onSubmit function
  };

export const MainDiv = ({onSubmit}: MainFormProps) => {
    return (
        <div className="flex flex-row gap-10">
            {/* left hand div with title, form */}
            <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
                <h1 className="text-slate-200 font-bold text-4xl"><a href="/">Weather Twin</a></h1>
                <h2 className="text-slate-400 font-semibold text-1xl">Find cities around the world with climates matching your own!</h2>
            </div>
            <MainForm onSubmit={onSubmit}/>
            </div>
        </div>  
    )
}
  