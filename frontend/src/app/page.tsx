"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import MapComponent from "@/components/weather/map-component";
import ClimateData from "@/components/weather/climate-data";
import ShareMenu from "@/components/weather/share-menu";
import AnimatedBackground from "@/components/weather/animated-background";
import SearchInput from "@/components/weather/search-input";

export default function WeatherTwin() {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    sourceCity: {
      name: string;
      lat: number;
      lng: number;
      country: string;
      stats: {
        temp: number;
        humidity: number;
        windSpeed: number;
        rainfall: number;
      };
      koppen: string;
      koppenFull: string;
    };
    matchCity: {
      name: string;
      lat: number;
      lng: number;
      country: string;
      climate: string;
      description: string;
      stats: {
        temp: number;
        humidity: number;
        windSpeed: number;
        rainfall: number;
      };
      matchPercentage: number;
      koppen: string;
      koppenFull: string;
    };
  } | null>(null);

  const handleSearch = (cityName: string) => {
    if (!cityName.trim()) return;

    setCity(cityName);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      setResults({
        sourceCity: {
          name: cityName,
          lat: 32.7157,
          lng: -117.1611,
          country: "United States",
          stats: {
            temp: 22,
            humidity: 65,
            windSpeed: 12,
            rainfall: 260,
          },
          koppen: "Csa",
          koppenFull: "Mediterranean hot summer climate",
        },
        matchCity: {
          name: "Casablanca",
          lat: 33.5731,
          lng: -7.5898,
          country: "Morocco",
          climate: "Mediterranean",
          description:
            "Casablanca has a Mediterranean climate with mild, wet winters and hot, dry summers. The average temperature ranges from 12°C (54°F) in winter to 23°C (73°F) in summer, similar to coastal Southern California.",
          stats: {
            temp: 21,
            humidity: 70,
            windSpeed: 14,
            rainfall: 280,
          },
          matchPercentage: 92,
          koppen: "Csa",
          koppenFull: "Mediterranean hot summer climate",
        },
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050806] to-[#041008] text-white">
      <AnimatedBackground />
      {!results ? (
        <div className="h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl px-6 z-10">
              <div className="mb-16 relative">
                <h1 className="text-3xl font-light tracking-tight text-white absolute -top-20 left-0">
                  Weather Twin
                </h1>

                <div className="relative">
                  <SearchInput onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8 px-6">
            <p className="text-gray-500 text-sm text-center max-w-md mx-auto">
              Find cities around the world with climates matching your own.
            </p>
            <p className="text-gray-500 text-sm text-center max-w-md mx-auto mt-4">
              Disclaimer: This is using mock data right now as we build out the
              backend.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setResults(null)}
                className="flex hover:cursor-pointer items-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>

              <ShareMenu />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-light text-white">
                    {results.sourceCity.name}
                  </h2>
                  <div className="text-xs text-gray-500 font-mono">
                    {results.sourceCity.country}
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden mb-3">
                  <MapComponent
                    lat={results.sourceCity.lat}
                    lng={results.sourceCity.lng}
                    zoom={10}
                    mapStyle="dark"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <div className="text-xs py-1 px-2 bg-[#041008] text-gray-400 font-mono">
                    {results.sourceCity.koppen}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {results.sourceCity.koppenFull}
                  </div>
                </div>

                <ClimateData stats={results.sourceCity.stats} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-light text-white">
                    {results.matchCity.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 font-mono">
                      {results.matchCity.country}
                    </div>
                    <div className="text-xs py-0.5 px-2 bg-[#041008] text-gray-400 font-mono">
                      {results.matchCity.matchPercentage}% Match
                    </div>
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden mb-3">
                  <MapComponent
                    lat={results.matchCity.lat}
                    lng={results.matchCity.lng}
                    zoom={10}
                    mapStyle="dark"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <div className="text-xs py-1 px-2 bg-[#041008] text-gray-400 font-mono">
                    {results.matchCity.koppen}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {results.matchCity.koppenFull}
                  </div>
                </div>

                <ClimateData stats={results.matchCity.stats} />

                <div className="mt-4 text-sm text-gray-400 leading-relaxed">
                  {results.matchCity.description}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#0A1A0A]">
              <h3 className="text-xs uppercase tracking-wider text-gray-600 mb-4 font-mono">
                Climate Comparison
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-mono">
                    Temperature
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {results.sourceCity.stats.temp}°C
                    </span>
                    <span className="text-white font-mono">
                      {results.matchCity.stats.temp}°C
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              results.sourceCity.stats.temp -
                                results.matchCity.stats.temp
                            ) *
                              10
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-mono">
                    Humidity
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {results.sourceCity.stats.humidity}%
                    </span>
                    <span className="text-white font-mono">
                      {results.matchCity.stats.humidity}%
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              results.sourceCity.stats.humidity -
                                results.matchCity.stats.humidity
                            )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-mono">
                    Wind Speed
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {results.sourceCity.stats.windSpeed} km/h
                    </span>
                    <span className="text-white font-mono">
                      {results.matchCity.stats.windSpeed} km/h
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              results.sourceCity.stats.windSpeed -
                                results.matchCity.stats.windSpeed
                            ) *
                              5
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-mono">
                    Annual Rainfall
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {results.sourceCity.stats.rainfall} mm
                    </span>
                    <span className="text-white font-mono">
                      {results.matchCity.stats.rainfall} mm
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              results.sourceCity.stats.rainfall -
                                results.matchCity.stats.rainfall
                            ) /
                              5
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-16 text-center text-xs text-gray-700 font-mono">
              <p>Made by Andrés Duvvuri</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
