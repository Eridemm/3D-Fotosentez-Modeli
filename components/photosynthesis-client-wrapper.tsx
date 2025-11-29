"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

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
  const [webglSupported, setWebglSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl =
        canvas.getContext("webgl") ||
        (canvas.getContext("webgl2") as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)

      if (!gl) {
        setWebglSupported(false)
        setError("WebGL not supported. Try updating your graphics drivers.")
        console.log("[v0] WebGL not supported in this browser")
      } else {
        console.log("[v0] WebGL supported - renderer:", gl.getParameter(gl.RENDERER))
      }
    } catch (err) {
      console.log("[v0] WebGL check error:", err)
      setError("Graphics initialization failed.")
    }
  }, [])

  if (!webglSupported) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">WebGL Not Supported</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">Try:</p>
          <ul className="text-sm text-left text-gray-600 space-y-2 mb-4">
            <li>• Using Firefox or Safari</li>
            <li>• Updating your graphics drivers</li>
            <li>• Disabling hardware acceleration and re-enabling it</li>
            <li>• Checking chrome://flags for WebGL settings</li>
          </ul>
        </div>
      </div>
    )
  }

  return <PhotosynthesisVisualization />
}
