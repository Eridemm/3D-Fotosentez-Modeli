"use client"

import React from "react"
import { Suspense, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

class ThreeJSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.log("[v0] Three.js Error caught:", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("[v0] Three.js Error details:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">3D Model Yüklenemedi</h2>
            <p className="text-gray-700 mb-4">
              3D görselleştirme yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Dynamic imports for Three.js components with better error handling
const Canvas = dynamic(() => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <div>Canvas yükleniyor...</div>,
})

const OrbitControls = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })), {
  ssr: false,
  loading: () => null,
})

const Environment = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Environment })), {
  ssr: false,
  loading: () => null,
})

const PhotosynthesisModel = dynamic(() => import("@/components/photosynthesis-model"), {
  ssr: false,
  loading: () => null,
})

export default function PhotosynthesisVisualization() {
  const [isClient, setIsClient] = useState(false)
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  React.useEffect(() => {
    console.log("[v0] PhotosynthesisVisualization mounted")

    try {
      setIsClient(true)

      const checkComponents = () => {
        if (typeof window !== "undefined") {
          console.log("[v0] Window is available, setting components loaded")
          setComponentsLoaded(true)
        }
      }

      const timer = setTimeout(checkComponents, 100)
      return () => clearTimeout(timer)
    } catch (error) {
      console.error("[v0] Error in useEffect:", error)
      setHasError(true)
    }
  }, [])

  const [showLabels, setShowLabels] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showExplanations, setShowExplanations] = useState(false)
  const [highlightedProcess, setHighlightedProcess] = useState<string | null>(null)
  const [showProcessPanel, setShowProcessPanel] = useState(false)
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false)
  const [isMainPanelCollapsed, setIsMainPanelCollapsed] = useState(false)

  const [panelPosition, setPanelPosition] = useState({ x: 320, y: 16 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPanelPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  if (hasError) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Yükleme Hatası</h2>
          <p className="text-gray-700 mb-4">Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Sayfayı Yenile
          </Button>
        </div>
      </div>
    )
  }

  if (!isClient || !componentsLoaded) {
    console.log("[v0] Still loading - isClient:", isClient, "componentsLoaded:", componentsLoaded)
    return (
      <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 font-semibold">3D Model Yükleniyor...</p>
          <p className="text-green-600 text-sm mt-2">Lütfen bekleyin...</p>
        </div>
      </div>
    )
  }

  console.log("[v0] Rendering main component")

  const processes = [
    { id: "light-reactions", name: "Işığa Bağımlı Evre", color: "bg-yellow-500" },
    { id: "electron-transport", name: "Elektron Taşıma Sistemi", color: "bg-blue-500" },
    { id: "atp-synthesis", name: "ATP Sentezi", color: "bg-orange-500" },
    { id: "water-splitting", name: "Suyun Parçalanması", color: "bg-cyan-500" },
    { id: "light-independent", name: "Işıktan Bağımsız Evre", color: "bg-purple-500" },
    { id: "calvin-cycle", name: "Calvin Döngüsü", color: "bg-purple-600" },
  ]

  const explanations = {
    chloroplast: {
      title: "Kloroplast",
      description:
        "Bitki ve alg hücrelerinde bulunan, klorofil pigmentlerini içeren organeldir. Fotosentezin gerçekleştiği ana yerdir.",
      details:
        "Kloroplastlar çift zarlı organellerdir ve içlerinde tilakoid adı verilen disk şeklinde yapılar bulunur. Bu yapılar fotosentez için gerekli olan klorofil pigmentlerini barındırır.",
    },
    thylakoid: {
      title: "Tilakoid Zarı",
      description: "Kloroplast içinde bulunan, klorofilin yerleştiği disk şeklindeki zar yapılarıdır.",
      details:
        "Tilakoid zarında ışığa bağımlı reaksiyonlar gerçekleşir. Elektron taşıma zinciri bu zar üzerinde bulunur ve proton gradyanı oluşturur.",
    },
    lightReactions: {
      title: "Işığa Bağımlı Reaksiyonlar",
      description: "Güneş ışığı enerjisini kimyasal enerjiye (ATP ve NADPH) dönüştüren reaksiyonlardır.",
      details:
        "Fotosistem II ve I aracılığıyla ışık enerjisi yakalanır, elektronlar uyarılır ve elektron taşıma zinciri boyunca hareket eder. Bu süreçte ATP ve NADPH üretilir.",
    },
    electronTransport: {
      title: "Elektron Taşıma Zinciri",
      description: "Tilakoid zarında bulunan protein kompleksleri aracılığıyla elektronların taşındığı sistemdir.",
      details:
        "Uyarılmış elektronlar protein kompleksleri arasında hareket ederken protonlar tilakoid içine pompalanır. Bu proton gradyanı ATP sentezi için kullanılır.",
    },
    atpSynthase: {
      title: "ATP Sentaz",
      description: "Proton gradyanını kullanarak ATP üreten enzimdir.",
      details:
        "Tilakoid zarını geçen protonların hareketi ATP sentaz enzimini döndürür ve ADP + Pi'den ATP sentezlenir. Bu süreç kemiosmoz olarak adlandırılır.",
    },
    photolysis: {
      title: "Fotoliz (Su Parçalanması)",
      description: "Işık enerjisi kullanılarak su moleküllerinin parçalanması sürecidir.",
      details:
        "Oksijen geliştiren kompleks (OEC) tarafından gerçekleştirilir. 2H₂O → O₂ + 4H⁺ + 4e⁻ reaksiyonu ile su parçalanır ve atmosferdeki oksijenin kaynağını oluşturur.",
    },
    calvinCycle: {
      title: "Calvin Döngüsü",
      description: "CO₂'nin şekere dönüştürüldüğü ışığa bağımsız reaksiyonlar dizisidir.",
      details:
        "Stromada gerçekleşir. RuBisCO enzimi CO₂'yi yakalar ve ATP ile NADPH kullanılarak glikoz üretilir. Bu süreç karbon fiksasyonu olarak da bilinir.",
    },
    rubisco: {
      title: "RuBisCO Enzimi",
      description: "Calvin döngüsünde CO₂'yi yakalayan en önemli enzimdir.",
      details:
        "Dünya üzerindeki en bol bulunan proteindir. CO₂'yi 5-karbonlu RuBP molekülüne bağlayarak karbon fiksasyonunu başlatır.",
    },
  }

  return (
    <ThreeJSErrorBoundary>
      <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors border-b flex items-center justify-between"
            onClick={() => setIsMainPanelCollapsed(!isMainPanelCollapsed)}
          >
            <h1 className="text-xl font-bold text-green-800">Fotosentez 3D Modeli</h1>
            <div
              className={`text-sm text-green-600 transition-transform duration-200 ${
                isMainPanelCollapsed ? "rotate-180" : ""
              }`}
            >
              ▼
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMainPanelCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
            }`}
          >
            <div className="p-4 space-y-2">
              <Button onClick={() => setShowLabels(!showLabels)} variant={showLabels ? "default" : "outline"} size="sm">
                {showLabels ? "Etiketleri Gizle" : "Etiketleri Göster"}
              </Button>
              <Button
                onClick={() => setShowExplanations(!showExplanations)}
                variant={showExplanations ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {showExplanations ? "Açıklamaları Gizle" : "Detaylı Açıklamalar"}
              </Button>
              <Button
                onClick={() => setShowProcessPanel(!showProcessPanel)}
                variant={showProcessPanel ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {showProcessPanel ? "Süreç Panelini Kapat" : "Süreçleri Ayrı İncele"}
              </Button>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Hız:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number.parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <h2 className="font-bold text-green-800 mb-2">Açıklama</h2>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Işık Enerjisi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Uyarılmış Elektronlar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Elektron Taşıması</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>ATP Sentezi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-400 rounded"></div>
              <span>Proton Gradyanı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span>RuBisCO Enzimi</span>
            </div>
          </div>
        </div>

        {/* Process Panel */}
        {showProcessPanel && (
          <div
            ref={panelRef}
            className="absolute z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-w-sm overflow-hidden"
            style={{
              left: `${panelPosition.x}px`,
              top: `${panelPosition.y}px`,
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="bg-green-50 p-3 cursor-move hover:bg-green-100 transition-colors border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-green-800">Süreçleri Ayrı Ayrı İncele</h2>
                <div className="text-xs text-gray-500">↔ Taşınabilir</div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setHighlightedProcess(null)}
                  variant={highlightedProcess === null ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  Tümünü Göster
                </Button>
                {processes.map((process) => (
                  <Button
                    key={process.id}
                    onClick={() => setHighlightedProcess(process.id)}
                    variant={highlightedProcess === process.id ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${highlightedProcess === process.id ? process.color + " text-white" : ""}`}
                  >
                    {process.name}
                  </Button>
                ))}
              </div>

              {/* Process Description when Highlighted */}
              {highlightedProcess && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">
                    {processes.find((p) => p.id === highlightedProcess)?.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {highlightedProcess === "light-reactions" &&
                      "Fotosistem II'de klorofil moleküllerinin ışık enerjisiyle uyarılması ve elektronların yüksek enerji seviyesine çıkarılması süreci. Bu süreçte ışık enerjisi kimyasal enerjiye (ATP ve NADPH) dönüştürülür. Tilakoid zarında bulunan fotosistem kompleksleri aracılığıyla gerçekleşir ve tüm fotosentez sürecinin başlangıç noktasıdır."}
                    {highlightedProcess === "electron-transport" &&
                      "Uyarılmış elektronların Fotosistem II'den Fotosistem I'e kadar protein kompleksleri (sitokrom b6f kompleksi) arasında taşınması süreci. Bu taşıma sırasında elektronlar enerji kaybeder ve bu enerji protonların stromadan tilakoid lümenine pompalanması için kullanılır. Bu süreç elektrokimyasal gradyan oluşturarak ATP sentezi için gerekli enerjiyi sağlar."}
                    {highlightedProcess === "atp-synthesis" &&
                      "Kemiosmoz ve fotofosforilasyon yoluyla ATP üretimi. Tilakoid lümeninde biriken protonlar konsantrasyon gradyanı boyunca ATP sentaz enziminden geçerek stromaya geri döner. Bu proton akışının serbest bıraktığı enerji, ATP sentaz enziminin ADP + Pi'den ATP sentezlemesini sağlar. Bu süreç ışık enerjisi kaynaklı olduğu için fotofosforilasyon olarak adlandırılır."}
                    {highlightedProcess === "water-splitting" &&
                      "Fotoliz süreci: Fotosistem II'de ışık enerjisi kullanılarak su moleküllerinin parçalanması (2H₂O → O₂ + 4H⁺ + 4e⁻). Oksijen geliştiren kompleks (OEC) tarafından gerçekleştirilir. Bu süreçte açığa çıkan elektronlar Fotosistem II'nin kaybettiği elektronları yerine koyar, protonlar tilakoid lümeninde birikir ve oksijen atmosfere salınır. Atmosferdeki oksijenin ana kaynağıdır."}
                    {highlightedProcess === "light-independent" &&
                      "Stromada gerçekleşen, ışığa doğrudan bağımlı olmayan reaksiyonlar dizisi. Işığa bağımlı reaksiyonlarda üretilen ATP ve NADPH'ın kimyasal enerjisi kullanılarak CO₂'nin organik moleküllere dönüştürülmesi süreci. Calvin döngüsü bu evrenin ana bileşenidir ve karbon fiksasyonu bu aşamada gerçekleşir."}
                    {highlightedProcess === "calvin-cycle" &&
                      "CO₂'nin organik şekerlere dönüştürüldüğü döngüsel süreç. RuBisCO enzimi CO₂'yi 5-karbonlu RuBP molekülüne bağlayarak kararsız 6-karbonlu ara ürün oluşturur. Bu ara ürün hemen iki adet 3-fosfogliserat (3-PGA) molekülüne ayrılır. ATP ve NADPH kullanılarak bu moleküller glikoza dönüştürülür ve RuBP yeniden üretilir. Dünya üzerindeki en bol protein olan RuBisCO bu sürecin kilit enzimi olarak işlev görür."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Explanations Panel */}
        {showExplanations && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-800">Fotosentez Bileşenleri - Detaylı Açıklamalar</h2>
              <Button onClick={() => setShowExplanations(false)} variant="outline" size="sm">
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {Object.entries(explanations).map(([key, explanation]) => (
                <div key={key} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-green-700 mb-2">{explanation.title}</h3>
                  <p className="text-gray-700 mb-2">{explanation.description}</p>
                  <p className="text-sm text-gray-600 italic">{explanation.details}</p>
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Genel Fotosentez Denklemi</h3>
                <p className="text-center font-mono text-lg text-blue-700">
                  6CO₂ + 6H₂O + Işık Enerjisi → C₆H₁₂O₆ + 6O₂
                </p>
                <p className="text-sm text-blue-600 mt-2 text-center">
                  Karbondioksit + Su + Güneş Işığı → Glikoz + Oksijen
                </p>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  <strong>Kaynak:</strong> Bu açıklamalar Wikipedia ve güvenilir bilimsel kaynaklardan derlenmiştir.
                  Fotosentez, yaşamın temelini oluşturan en önemli biyolojik süreçlerden biridir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3D Scene */}
        <div className="w-full h-full">
          <Suspense
            fallback={
              <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-green-800 font-semibold">3D Sahne Yükleniyor...</p>
                </div>
              </div>
            }
          >
            {Canvas && OrbitControls && Environment && PhotosynthesisModel ? (
              <Canvas
                camera={{
                  position: [0, 0, 15],
                  fov: 60,
                  near: 0.1,
                  far: 1000,
                }}
                gl={{
                  antialias: true,
                  alpha: true,
                }}
                onCreated={() => console.log("[v0] Canvas created successfully")}
                onError={(error) => {
                  console.error("[v0] Canvas error:", error)
                  setHasError(true)
                }}
              >
                <Environment preset="studio" />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />

                <PhotosynthesisModel
                  showLabels={showLabels}
                  animationSpeed={animationSpeed}
                  highlightedProcess={highlightedProcess}
                />

                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  maxDistance={30}
                  minDistance={5}
                  maxPolarAngle={Math.PI}
                  minPolarAngle={0}
                />
              </Canvas>
            ) : (
              <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-green-800 font-semibold">3D Bileşenler Yükleniyor...</p>
                </div>
              </div>
            )}
          </Suspense>
        </div>

        {/* Information Panel */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors border-b flex items-center justify-between"
            onClick={() => setIsBottomPanelCollapsed(!isBottomPanelCollapsed)}
          >
            <h2 className="font-bold text-green-800">Fotosentez Süreci</h2>
            <div
              className={`text-sm text-green-600 transition-transform duration-200 ${isBottomPanelCollapsed ? "rotate-180" : ""}`}
            >
              ▼
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isBottomPanelCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
            }`}
          >
            <div className="p-4">
              <p className="text-sm text-gray-700">
                <strong>Enerji Akışı:</strong> Işık Enerjisi → Uyarılmış Elektronlar → ATP/NADPH → Glikoz Üretimi
              </p>
              <p className="text-xs text-gray-600 mt-1">
                3D modeli keşfetmek için fareyi kullanarak döndürün, yakınlaştırın. Yukarıdan etiketleri açıp
                kapatabilir ve animasyon hızını ayarlayabilirsiniz. <strong>"Süreçleri Ayrı Ayrı İncele"</strong>{" "}
                bölümünden her süreci tek tek vurgulayabilir,
                <strong>"Detaylı Açıklamalar"</strong> butonuna basarak tüm bileşenlerin işlevlerini öğrenebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThreeJSErrorBoundary>
  )
}
