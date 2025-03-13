"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

interface MinimalMapProps {
  lat: number
  lng: number
}

export default function MinimalMap({ lat, lng }: MinimalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Custom minimal style - extremely simplified
    const minimalStyle = {
      version: 8,
      sources: {
        "simple-tiles": {
          type: "vector",
          url: "https://basemaps.cartocdn.com/vector/voyager/v1/tiles.json",
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#ffffff",
          },
        },
        {
          id: "water",
          type: "fill",
          source: "simple-tiles",
          "source-layer": "water",
          paint: {
            "fill-color": "#f8f9fa",
          },
        },
        {
          id: "land",
          type: "fill",
          source: "simple-tiles",
          "source-layer": "land",
          paint: {
            "fill-color": "#ffffff",
          },
        },
        {
          id: "admin",
          type: "line",
          source: "simple-tiles",
          "source-layer": "boundaries",
          paint: {
            "line-color": "#f1f3f5",
            "line-width": 0.5,
          },
        },
      ],
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // Fallback to a minimal style
      center: [lng, lat],
      zoom: 9,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchZoomRotate: false,
    })

    // Add minimal marker
    const markerElement = document.createElement("div")
    markerElement.className = "minimal-marker"

    new maplibregl.Marker({
      element: markerElement,
    })
      .setLngLat([lng, lat])
      .addTo(map.current)

    // Remove all controls
    map.current.dragPan.disable()
    map.current.scrollZoom.disable()
    map.current.doubleClickZoom.disable()

    return () => {
      map.current?.remove()
    }
  }, [lat, lng])

  return (
    <>
      <style jsx global>{`
        .minimal-marker {
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
        }
        .maplibregl-canvas {
          cursor: default !important;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  )
}

