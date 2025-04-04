import { Stats } from "@/lib/types";
import { Thermometer, Droplets, Wind, CloudRain, Gauge } from "lucide-react";

interface ClimateDataProps {
  stats: Stats;
}

export default function ClimateData({ stats }: ClimateDataProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Thermometer className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Temp</div>
        </div>
        <div className="text-sm font-mono">
          {stats.temp != null
            ? `${stats.temp[0]} - ${stats.temp[1]}°C`
            : "No data"}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Gauge className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Pressure</div>
        </div>
        <div className="text-sm font-mono">
          {stats.pressure != null
            ? `${stats.pressure[0]} - ${stats.pressure[1]} hPa`
            : "No data"}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Wind className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Wind</div>
        </div>
        <div className="text-sm font-mono">
          {stats.windspeed != null
            ? `${stats.windspeed[0]} - ${stats.windspeed[1]} km/h`
            : "No data"}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <CloudRain className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Rain</div>
        </div>
        <div className="text-sm font-mono">
          {stats.rainfall != null
            ? `${stats.rainfall[0]} - ${stats.rainfall[1]} mm`
            : "No data"}
        </div>
      </div>
    </div>
  );
}
