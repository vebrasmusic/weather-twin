"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

interface MapComponentProps {
  lat: number
  lng: number
  zoom: number
  mapStyle?: "light" | "dark"
}

export default function MapComponent({ lat, lng, zoom, mapStyle = "light" }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Choose style based on prop
    const styleUrl =
      mapStyle === "dark"
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    })

    // Add marker
    new maplibregl.Marker({
      color: "#9ca3af", // gray-400
    })
      .setLngLat([lng, lat])
      .addTo(map.current)

    // Add minimal navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "top-right",
    )

    return () => {
      map.current?.remove()
    }
  }, [lat, lng, zoom, mapStyle])

  return (
    <>
      <style jsx global>{`
        .maplibregl-ctrl-group {
          background: rgba(4, 16, 8, 0.3) !important;
          border: none !important;
          box-shadow: none !important;
        }
        .maplibregl-ctrl-group button {
          color: white !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: rgba(156, 163, 175, 0.2) !important;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  )
}

