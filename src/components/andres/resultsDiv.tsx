import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps"
import { useRouter } from 'next/navigation'



export const ResultsDiv = ({globalMatchedCities, queryCity, USMatchedCity}: {globalMatchedCities: any, queryCity: any, USMatchedCity: any}) => {
    const mapZoom = 6;
    const router = useRouter();

    return (
        <div className="flex flex-col gap-10">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}> 
            {/* main div */}
            <div className="flex flex-col gap-10">
                {/* Title */}
                <div>
                    <h2 className="text-slate-200 font-semibold text-3xl text-center">Your results:</h2>
                </div>
                {/* Maps */}
                <div className="flex flex-row gap-10">
                    {/* first map */}
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-slate-200 font-semibold text-1xl text-center">Queried city: {queryCity.cityName}</h3>
                            <h3 className="text-slate-200 font-semibold text-1xl text-center">Closest weather station: {USMatchedCity.cityName}</h3>
                        </div>
                        <div className="flex flex-col w-[500px] h-[500px]">
                            <Map mapId={"query-city-map"} zoom={mapZoom} center={{lat: queryCity.coordinates["lat"], lng: queryCity.coordinates["lng"]}} >
                                <AdvancedMarker title={"Queried city"} position={{lat: queryCity.coordinates["lat"], lng: queryCity.coordinates["lng"]}}>
                                    <Pin background={"red"} scale={0.7}/>
                                </AdvancedMarker>
                                <AdvancedMarker title={"Closest weather station"} position={{lat: USMatchedCity.coordinates[0], lng: USMatchedCity.coordinates[1]}}>
                                    <Pin background={"blue"} scale={0.7} />
                                </AdvancedMarker>
                            </Map>
                        </div>
                    </div>
                    {/* second map */}
                    <div className="flex flex-col gap-20">
                        <div className="flex flex-col justify-center items-center">
                            <h3 className="text-slate-200 font-semibold text-1xl text-center">Matched city: {globalMatchedCities[0].id}</h3>
                        </div>
                        <div className="flex flex-col w-[500px] h-[500px]">
                            <Map mapId={"global-city-map"} zoom={mapZoom} center={{lat: globalMatchedCities[0].metadata.latitude, lng: globalMatchedCities[0].metadata.longitude}} >
                                <AdvancedMarker title={"Global city"} position={{lat: globalMatchedCities[0].metadata.latitude, lng: globalMatchedCities[0].metadata.longitude}}>
                                    <Pin background={"green"} scale={0.7} />
                                </AdvancedMarker>
                            </Map>
                        </div>
                    </div>
                </div>
            </div>
            {/* button div */}
            <div className="flex flex-col justify-center items-center gap-10">
                <button onClick={() => window.location.reload()} className=" text-slate-200 font-semibold text-2xl p-2">Try another city</button>
            </div>
            </APIProvider>
        </div>
    )
}

