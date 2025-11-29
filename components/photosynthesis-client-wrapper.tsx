"use client"

import dynamic from "next/dynamic"

const PhotosynthesisVisualization = dynamic(() => import("@/components/photosynthesis-visualization"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-800 font-semibold">3D Model Yükleniyor...</p>
      </div>
    </div>
  ),
})

export default function PhotosynthesisClientWrapper() {
  return <PhotosynthesisVisualization />
}
