interface CityInfoProps {
  city: {
    name: string
    country: string
    climate: string
    description: string
    koppen: string
    koppenFull: string
  }
}

export default function CityInfo({ city }: CityInfoProps) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center mb-2">
        <div className="text-xs py-1 px-2 bg-blue-900/50 text-blue-300 rounded font-mono">{city.koppen}</div>
        <div className="text-xs text-slate-400 ml-2">{city.koppenFull}</div>
      </div>

      <p className="text-sm text-slate-300">{city.description}</p>
    </div>
  )
}

