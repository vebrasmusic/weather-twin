import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react"

interface ClimateDataProps {
  stats: {
    temp: number
    humidity: number
    windSpeed: number
    rainfall: number
  }
}

export default function ClimateData({ stats }: ClimateDataProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Thermometer className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Temp</div>
        </div>
        <div className="text-sm font-mono">{stats.temp}°C</div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Droplets className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Humidity</div>
        </div>
        <div className="text-sm font-mono">{stats.humidity}%</div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <Wind className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Wind</div>
        </div>
        <div className="text-sm font-mono">{stats.windSpeed} km/h</div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <CloudRain className="h-3 w-3 text-gray-400" />
          <div className="text-xs text-gray-600 font-mono">Rain</div>
        </div>
        <div className="text-sm font-mono">{stats.rainfall} mm</div>
      </div>
    </div>
  )
}

