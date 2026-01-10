"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MapComponent from "@/components/weather/map-component";
import ClimateData from "@/components/weather/climate-data";
import ShareMenu from "@/components/weather/share-menu";
import AnimatedBackground from "@/components/weather/animated-background";
import SearchInput from "@/components/weather/search-input";
import axios, { AxiosError, AxiosResponse } from "axios";
import { WeatherTwinResponse } from "@/lib/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateKoppenSimilarity } from "@/lib/utils";
import { useImmer } from "use-immer";
import { Button } from "@/components/ui/button";

export default function WeatherTwin() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WeatherTwinResponse | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useImmer(0);

  const fullSocketUrl = useMemo(() => {
    if (!requestId) return null;

    // Use the proxy WebSocket endpoint
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    return `${protocol}//${host}/api/ws?request_id=${requestId}`;
  }, [requestId]);

  const { lastMessage } = useWebSocket(
    fullSocketUrl,
    {
      onOpen: async () => {
        try {
          // Use the proxy API endpoint
          const response: AxiosResponse<WeatherTwinResponse> = await axios.get(
            `/api/matches`,
            {
              params: {
                city_name: city,
                request_id: requestId,
              },
            },
          );
          setIsLoading(false);
          setResults(response.data);
        } catch (e) {
          console.log("There was an error:", e);
          setIsLoading(false);
          if (axios.isAxiosError(e)) {
            const msg = e.response?.data.detail;
            if (msg === "No climate data found for station.") {
              toast.error("Couldn't find any data for that city, try another!");
            } else {
              toast.error("Something went wrong :(");
            }
          } else {
            toast.error("Unexpected error");
          }
        }
      },
    },
    !!requestId,
  );

  const handleSearch = async (cityName: string) => {
    if (!cityName.trim()) return;
    const newRequestId = uuidv4();
    setRequestId(newRequestId);
    setIsLoading(true);
    setCity(cityName);
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
                  <SearchInput
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    loadingText={lastMessage?.data}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8 px-6">
            <p className="text-gray-500 text-sm text-center max-w-md mx-auto">
              Find cities around the world with climates matching your own.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setResults(null);
                  setCurrentMatch(0);
                }}
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
                    <strong>{results.input.metadata.city}</strong>
                  </h2>
                  <div className="text-xs text-gray-500 font-mono">
                    {results.input.metadata.country}
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden mb-3">
                  <MapComponent
                    lat={results.input.metadata.lat}
                    lng={results.input.metadata.lng}
                    zoom={10}
                    mapStyle="dark"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <div className="text-xs py-1 px-2 bg-[#041008] text-gray-400 font-mono">
                    {results.input.metadata.koppen_code}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {results.input.metadata.koppen_description}
                  </div>
                </div>

                <ClimateData stats={results.input.metadata.stats} />

                <ScrollArea className="mt-4 text-sm text-gray-400 leading-relaxed h-30 mask-alpha mask-b-from-black mask-b-from-60% mask-b-to-transparent">
                  {results.input.metadata.description ? (
                    <>
                      <p>{results.input.metadata.description}</p>
                      <div className="h-8" /> {/* adds empty vertical space */}
                    </>
                  ) : (
                    "No description."
                  )}
                </ScrollArea>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-light text-gray-500">
                    {`Match ${currentMatch + 1}`} (
                    {calculateKoppenSimilarity(
                      results.matches[currentMatch].metadata.koppen_code,
                      results.input.metadata.koppen_code,
                    )}
                    % Similar):{" "}
                    <strong className="text-white">
                      {results.matches[currentMatch].metadata.city}
                    </strong>
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 font-mono">
                      {results.matches[currentMatch].metadata.country}
                    </div>
                  </div>
                </div>

                <div className="aspect-video relative overflow-hidden mb-3">
                  <MapComponent
                    lat={results.matches[currentMatch].metadata.lat}
                    lng={results.matches[currentMatch].metadata.lng}
                    zoom={10}
                    mapStyle="dark"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <div className="text-xs py-1 px-2 bg-[#041008] text-gray-400 font-mono">
                    {results.matches[currentMatch].metadata.koppen_code}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {results.matches[currentMatch].metadata.koppen_description}
                  </div>
                </div>

                <ClimateData
                  stats={results.matches[currentMatch].metadata.stats}
                />

                <ScrollArea className="mt-4 text-sm text-gray-400 leading-relaxed h-30 mask-alpha mask-b-from-black mask-b-from-60% mask-b-to-transparent">
                  {results.matches[currentMatch].metadata.description ? (
                    <>
                      <p>
                        {results.matches[currentMatch].metadata.description}
                      </p>
                      <div className="h-8" /> {/* adds empty vertical space */}
                    </>
                  ) : (
                    "No description."
                  )}
                </ScrollArea>
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
                      {results.input.metadata.stats.temp
                        ? `${(
                            (results.input.metadata.stats.temp[0] +
                              results.input.metadata.stats.temp[1]) /
                            2
                          ).toFixed(1)}°C`
                        : "No data"}
                    </span>
                    <span className="text-white font-mono">
                      {results.matches[currentMatch].metadata.stats.temp
                        ? `${(
                            (results.matches[currentMatch].metadata.stats
                              .temp[0] +
                              results.matches[currentMatch].metadata.stats
                                .temp[1]) /
                            2
                          ).toFixed(1)}°C`
                        : "No data"}
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              (results.input.metadata.stats.temp
                                ? (results.input.metadata.stats.temp[0] +
                                    results.input.metadata.stats.temp[1]) /
                                  2
                                : 0) -
                                (results.matches[currentMatch].metadata.stats
                                  .temp
                                  ? (results.matches[currentMatch].metadata
                                      .stats.temp[0] +
                                      results.matches[currentMatch].metadata
                                        .stats.temp[1]) /
                                    2
                                  : 0),
                            ) *
                              10,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-mono">
                    Pressure
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {results.input.metadata.stats.pressure
                        ? `${(
                            (results.input.metadata.stats.pressure[0] +
                              results.input.metadata.stats.pressure[1]) /
                            2
                          ).toFixed(1)} hPa`
                        : "No data"}
                    </span>
                    <span className="text-white font-mono">
                      {results.matches[currentMatch].metadata.stats.pressure
                        ? `${(
                            (results.matches[currentMatch].metadata.stats
                              .pressure[0] +
                              results.matches[currentMatch].metadata.stats
                                .pressure[1]) /
                            2
                          ).toFixed(1)} hPa`
                        : "No data"}
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              (results.input.metadata.stats.pressure
                                ? (results.input.metadata.stats.pressure[0] +
                                    results.input.metadata.stats.pressure[1]) /
                                  2
                                : 0) -
                                (results.matches[currentMatch].metadata.stats
                                  .pressure
                                  ? (results.matches[currentMatch].metadata
                                      .stats.pressure[0] +
                                      results.matches[currentMatch].metadata
                                        .stats.pressure[1]) /
                                    2
                                  : 0),
                            ),
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
                      {results.input.metadata.stats.windspeed
                        ? `${(
                            (results.input.metadata.stats.windspeed[0] +
                              results.input.metadata.stats.windspeed[1]) /
                            2
                          ).toFixed(1)} km/h`
                        : "No data"}
                    </span>
                    <span className="text-white font-mono">
                      {results.matches[currentMatch].metadata.stats.windspeed
                        ? `${(
                            (results.matches[currentMatch].metadata.stats
                              .windspeed[0] +
                              results.matches[currentMatch].metadata.stats
                                .windspeed[1]) /
                            2
                          ).toFixed(1)} km/h`
                        : "No data"}
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              ((results.input.metadata.stats.windspeed?.[0] ??
                                0) +
                                (results.input.metadata.stats.windspeed?.[1] ??
                                  0)) /
                                2 -
                                ((results.matches[currentMatch].metadata.stats
                                  .windspeed?.[0] ?? 0) +
                                  (results.matches[currentMatch].metadata.stats
                                    .windspeed?.[1] ?? 0)) /
                                  2,
                            ) *
                              5,
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
                      {results.input.metadata.stats.rainfall
                        ? `${(
                            (results.input.metadata.stats.rainfall[0] +
                              results.input.metadata.stats.rainfall[1]) /
                            2
                          ).toFixed(1)} mm`
                        : "No data"}
                    </span>
                    <span className="text-white font-mono">
                      {results.matches[currentMatch].metadata.stats.rainfall
                        ? `${(
                            (results.matches[currentMatch].metadata.stats
                              .rainfall[0] +
                              results.matches[currentMatch].metadata.stats
                                .rainfall[1]) /
                            2
                          ).toFixed(1)} mm`
                        : "No data"}
                    </span>
                  </div>
                  <div className="h-px bg-[#0A1A0A] overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${Math.abs(
                          100 -
                            Math.abs(
                              ((results.input.metadata.stats.rainfall?.[0] ??
                                0) +
                                (results.input.metadata.stats.rainfall?.[1] ??
                                  0)) /
                                2 -
                                ((results.matches[currentMatch].metadata.stats
                                  .rainfall?.[0] ?? 0) +
                                  (results.matches[currentMatch].metadata.stats
                                    .rainfall?.[1] ?? 0)) /
                                  2,
                            ) *
                              5,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between pt-4">
              <Button
                variant={"ghost"}
                disabled={currentMatch === 0}
                onClick={() => setCurrentMatch((draft) => draft - 1)}
              >
                <ArrowLeft size={50} /> Previous Match
              </Button>
              <Button
                variant={"ghost"}
                disabled={currentMatch === 2}
                onClick={() => setCurrentMatch((draft) => draft + 1)}
              >
                Next Match <ArrowRight size={50} />
              </Button>
            </div>
            <footer className="text-center text-xs text-gray-700 font-mono">
              <p>Made by Andrés Duvvuri</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
