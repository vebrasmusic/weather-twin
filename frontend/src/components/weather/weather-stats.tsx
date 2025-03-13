import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react"

interface WeatherStatsProps {
  stats: {
    temp: number
    humidity: number
    windSpeed: number
    rainfall: number
  }
  className?: string
  variant?: "blue" | "purple"
}

export default function WeatherStats({ stats, className = "", variant = "blue" }: WeatherStatsProps) {
  const getColorClass = (type: string) => {
    if (variant === "purple") {
      switch (type) {
        case "bg":
          return "bg-purple-900/20"
        case "border":
          return "border-purple-700/20"
        case "text":
          return "text-purple-300"
        case "icon":
          return "text-purple-400"
        default:
          return ""
      }
    } else {
      switch (type) {
        case "bg":
          return "bg-blue-900/20"
        case "border":
          return "border-blue-700/20"
        case "text":
          return "text-blue-300"
        case "icon":
          return "text-blue-400"
        default:
          return ""
      }
    }
  }

  return (
    <div className={`grid grid-cols-4 gap-3 ${className}`}>
      <div
        className={`${getColorClass("bg")} rounded-lg p-3 ${getColorClass("border")} border flex flex-col items-center justify-center`}
      >
        <Thermometer className={`h-5 w-5 ${getColorClass("icon")} mb-1`} />
        <div className="text-white text-lg font-medium">{stats.temp}°C</div>
        <div className={`text-xs ${getColorClass("text")}`}>Avg Temp</div>
      </div>

      <div
        className={`${getColorClass("bg")} rounded-lg p-3 ${getColorClass("border")} border flex flex-col items-center justify-center`}
      >
        <Droplets className={`h-5 w-5 ${getColorClass("icon")} mb-1`} />
        <div className="text-white text-lg font-medium">{stats.humidity}%</div>
        <div className={`text-xs ${getColorClass("text")}`}>Humidity</div>
      </div>

      <div
        className={`${getColorClass("bg")} rounded-lg p-3 ${getColorClass("border")} border flex flex-col items-center justify-center`}
      >
        <Wind className={`h-5 w-5 ${getColorClass("icon")} mb-1`} />
        <div className="text-white text-lg font-medium">{stats.windSpeed}</div>
        <div className={`text-xs ${getColorClass("text")}`}>km/h</div>
      </div>

      <div
        className={`${getColorClass("bg")} rounded-lg p-3 ${getColorClass("border")} border flex flex-col items-center justify-center`}
      >
        <CloudRain className={`h-5 w-5 ${getColorClass("icon")} mb-1`} />
        <div className="text-white text-lg font-medium">{stats.rainfall}</div>
        <div className={`text-xs ${getColorClass("text")}`}>mm/year</div>
      </div>
    </div>
  )
}

