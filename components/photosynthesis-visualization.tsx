"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { OrbitControls } from "@react-three/drei";

// Canvas'ı SSR kapalı şekilde doğrudan import et
const Canvas = dynamic(
  () =>
    import("@react-three/fiber").then((mod) => {
      return mod.Canvas;
    }),
  { ssr: false }
);

// Modeli dinamik yükle
const PhotosynthesisModel = dynamic(
  () => import("../models/PhotosynthesisModel"),
  { ssr: false }
);

export default function PhotosynthesisVisualization() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1} />

          <PhotosynthesisModel />

          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
