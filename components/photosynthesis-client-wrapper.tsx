"use client";

import dynamic from "next/dynamic";

const Visualization = dynamic(
  () => import("./photosynthesis-visualization"),
  { ssr: false }
);

export default function ClientWrapper() {
  return <Visualization />;
}
