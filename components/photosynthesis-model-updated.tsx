"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"

interface PhotosynthesisModelProps {
  showLabels: boolean
  animationSpeed: number
  highlightedProcess?: string | null
}

export default function PhotosynthesisModel({
  showLabels,
  animationSpeed,
  highlightedProcess,
}: PhotosynthesisModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const electronRef = useRef<THREE.Group>(null)
  const lightRayRef = useRef<THREE.Group>(null)
  const atpRef = useRef<THREE.Group>(null)
  const calvinRef = useRef<THREE.Group>(null)
  const oxygenRef = useRef<THREE.Group>(null)
  const protonsRef = useRef<THREE.Group>(null)

  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime() * animationSpeed

    // Rotate electrons around transport chain
    if (electronRef.current) {
      electronRef.current.rotation.z = time * 2
    }

    // Animate light rays with wave motion
    if (lightRayRef.current) {
      lightRayRef.current.children.forEach((child, index) => {
        child.position.y = Math.sin(time * 3 + index) * 0.3
        child.rotation.z = Math.sin(time * 2 + index) * 0.1
      })
    }

    // Rotate ATP synthase
    if (atpRef.current) {
      atpRef.current.rotation.y = time * 4
    }

    // Animate Calvin cycle
    if (calvinRef.current) {
      calvinRef.current.rotation.y = time * 1.5
    }

    if (oxygenRef.current) {
      oxygenRef.current.children.forEach((child, index) => {
        const bubble = child as THREE.Mesh
        bubble.position.y += Math.sin(time + index) * 0.01
        if (bubble.position.y > 4) {
          bubble.position.y = 2
        }
      })
    }

    if (protonsRef.current) {
      protonsRef.current.children.forEach((child, index) => {
        const proton = child as THREE.Mesh
        proton.position.x += Math.sin(time * 2 + index) * 0.005
        proton.position.z += Math.cos(time * 2 + index) * 0.005
      })
    }
  })

  // Generate particles for various molecules
  const oxygenBubbles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [Math.random() * 1.5 - 0.75, 2 + Math.random() * 2, Math.random() * 1.5 - 0.75] as [
        number,
        number,
        number,
      ],
      delay: i * 0.2,
    }))
  }, [])

  const co2Molecules = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [Math.cos((i * Math.PI) / 4) * 3.5, Math.sin((i * Math.PI) / 4) * 2 - 3, -1] as [
        number,
        number,
        number,
      ],
    }))
  }, [])

  const protonParticles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [Math.random() * 4 - 2, Math.random() * 1.5 + 0.5, Math.random() * 1 - 0.5] as [number, number, number],
    }))
  }, [])

  const getOpacity = (processId: string) => {
    if (!highlightedProcess) return 1
    return highlightedProcess === processId ? 1 : 0.3
  }

  const getScale = (processId: string) => {
    if (!highlightedProcess) return 1
    return highlightedProcess === processId ? 1.1 : 0.9
  }

  const getChloroplastOpacity = () => {
    if (!highlightedProcess) return 0.02 // Tümünü göster durumunda neredeyse tamamen şeffaf
    return 0.1 // Süreç seçildiğinde de çok şeffaf
  }

  const getInnerMembraneOpacity = () => {
    if (!highlightedProcess) return 0.01 // İç zar için neredeyse görünmez
    return 0.05 // Süreç seçildiğinde çok az görünür
  }

  return (
    <group ref={groupRef}>
      {/* Chloroplast Structure - Wireframe mode for better visibility */}
      <group position={[0, 0, 0]} scale={getScale("all")}>
        {/* Outer membrane - Wireframe mode */}
        <mesh scale={[3.2, 2.0, 1.4]} renderOrder={1}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshLambertMaterial
            color="#4ade80"
            transparent
            opacity={getChloroplastOpacity() * getOpacity("all")}
            wireframe={!highlightedProcess} // Tümünü göster durumunda wireframe
            side={2}
          />
        </mesh>

        {/* Thylakoids - kloroplast içine sığacak şekilde küçültüldü */}
        <group position={[0, 0, 0]}>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[0, (i - 1.5) * 0.4, 0]} renderOrder={2}>
              <cylinderGeometry args={[1.4, 1.4, 0.08, 20]} />
              <meshLambertMaterial color="#22c55e" transparent opacity={0.8 * getOpacity("all")} side={2} />
            </mesh>
          ))}
        </group>

        {/* Inner membrane - Wireframe when showing all */}
        <mesh scale={[3.0, 1.8, 1.2]} renderOrder={0}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshLambertMaterial
            color="#86efac"
            transparent
            opacity={getInnerMembraneOpacity() * getOpacity("all")}
            wireframe={!highlightedProcess} // Tümünü göster durumunda wireframe
            side={2}
          />
        </mesh>
      </group>

      {/* Light-dependent reactions - Pozisyon ve renderOrder düzeltildi */}
      <group position={[-5, 2, 3]} scale={getScale("light-reactions")}>
        <group ref={lightRayRef}>
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i} position={[0, i * 0.4 - 1.5, 0]}>
              <mesh rotation={[0, 0, Math.PI / 4]} renderOrder={10}>
                <coneGeometry args={[0.08, 2.5, 4]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={getOpacity("light-reactions")} />
              </mesh>
              <mesh position={[1, 0, 0]} renderOrder={11}>
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color="#fff700" transparent opacity={getOpacity("light-reactions")} />
              </mesh>
            </group>
          ))}
        </group>

        {showLabels && (
          <Html position={[0, 3.5, 0]} center>
            <div className="bg-yellow-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-yellow-800">Güneş Işığı</div>
              <div className="text-xs text-yellow-600">Fotonlar</div>
            </div>
          </Html>
        )}
      </group>

      {/* Chlorophyll and excited electrons - Daha stabil pozisyonlama */}
      <group position={[-2.5, 0, 1]} scale={getScale("light-reactions")}>
        <mesh renderOrder={5}>
          <boxGeometry args={[1.2, 0.6, 0.3]} />
          <meshLambertMaterial color="#16a34a" transparent opacity={getOpacity("light-reactions")} />
        </mesh>

        <mesh position={[0, 0, 0.2]} renderOrder={6}>
          <ringGeometry args={[0.2, 0.4, 8]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={getOpacity("light-reactions")} />
        </mesh>

        <group ref={electronRef}>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh
              key={i}
              position={[Math.cos((i * Math.PI) / 3) * 1.8, Math.sin((i * Math.PI) / 3) * 1.8, 0]}
              renderOrder={7}
            >
              <sphereGeometry args={[0.12]} />
              <meshBasicMaterial color="#10b981" transparent opacity={getOpacity("light-reactions")} />
            </mesh>
          ))}
        </group>

        {showLabels && (
          <Html position={[0, -1.5, 0]} center>
            <div className="bg-green-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-green-800">Klorofil</div>
              <div className="text-xs text-green-600">e⁻ uyarılmış</div>
            </div>
          </Html>
        )}
      </group>

      {/* Electron transport chain - Daha iyi görünürlük */}
      <group position={[0, 0, 1]} scale={getScale("electron-transport")}>
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[i * 1.2 - 1.8, 0, 0]}>
            <mesh renderOrder={8}>
              <cylinderGeometry args={[0.35, 0.35, 1.2, 8]} />
              <meshLambertMaterial color="#0ea5e9" transparent opacity={getOpacity("electron-transport")} />
            </mesh>
            <mesh position={[0, 0.7, 0]} renderOrder={9}>
              <sphereGeometry args={[0.2]} />
              <meshLambertMaterial color="#0284c7" transparent opacity={getOpacity("electron-transport")} />
            </mesh>
          </group>
        ))}

        {/* Enhanced electron flow arrows */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={i} position={[i * 1.2 - 1.2, 0.8, 0]} rotation={[0, 0, -Math.PI / 2]} renderOrder={10}>
            <coneGeometry args={[0.15, 0.6, 4]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={getOpacity("electron-transport")} />
          </mesh>
        ))}

        {showLabels && (
          <Html position={[0, -2, 0]} center>
            <div className="bg-blue-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-blue-800">Elektron Taşıma Zinciri</div>
              <div className="text-xs text-blue-600">Protein Kompleksleri</div>
            </div>
          </Html>
        )}
      </group>

      {/* ATP Synthase - Daha stabil renderOrder */}
      <group position={[3.5, 0, 1]} scale={getScale("atp-synthesis")}>
        <group ref={atpRef}>
          {/* ATP synthase base */}
          <mesh renderOrder={12}>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />
            <meshLambertMaterial color="#f97316" transparent opacity={getOpacity("atp-synthesis")} />
          </mesh>

          {/* Rotating head */}
          <mesh position={[0, 1, 0]} renderOrder={13}>
            <sphereGeometry args={[0.5]} />
            <meshLambertMaterial color="#ea580c" transparent opacity={getOpacity("atp-synthesis")} />
          </mesh>

          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[Math.cos((i * Math.PI) / 4) * 0.7, 1, Math.sin((i * Math.PI) / 4) * 0.7]}
              renderOrder={14}
            >
              <boxGeometry args={[0.12, 0.25, 0.06]} />
              <meshLambertMaterial color="#dc2626" transparent opacity={getOpacity("atp-synthesis")} />
            </mesh>
          ))}
        </group>

        <group ref={protonsRef}>
          {protonParticles.map((proton, i) => (
            <mesh key={i} position={proton.position} renderOrder={15}>
              <sphereGeometry args={[0.06]} />
              <meshBasicMaterial color="#ec4899" transparent opacity={getOpacity("atp-synthesis")} />
            </mesh>
          ))}
        </group>

        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[0.8, -1.2 - i * 0.4, 0]} renderOrder={16}>
            <mesh>
              <sphereGeometry args={[0.18]} />
              <meshLambertMaterial color="#fbbf24" transparent opacity={getOpacity("atp-synthesis")} />
            </mesh>
            <mesh position={[0.2, 0, 0]} renderOrder={17}>
              <sphereGeometry args={[0.12]} />
              <meshLambertMaterial color="#f59e0b" transparent opacity={getOpacity("atp-synthesis")} />
            </mesh>
            <mesh position={[0.35, 0, 0]} renderOrder={18}>
              <sphereGeometry args={[0.12]} />
              <meshLambertMaterial color="#f59e0b" transparent opacity={getOpacity("atp-synthesis")} />
            </mesh>
            {showLabels && i === 0 && (
              <Html position={[0.6, 0, 0]} center>
                <div className="text-xs font-bold text-orange-800">ATP</div>
              </Html>
            )}
          </group>
        ))}

        {showLabels && (
          <Html position={[0, -3, 0]} center>
            <div className="bg-orange-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-orange-800">ATP Sentaz</div>
              <div className="text-xs text-orange-600">H⁺ gradyanı → ATP</div>
            </div>
          </Html>
        )}
      </group>

      {/* Water splitting (Photolysis) - Enhanced */}
      <group position={[-3.5, -1, 1]} scale={getScale("water-splitting")}>
        <group>
          <mesh renderOrder={19}>
            <sphereGeometry args={[0.35]} />
            <meshLambertMaterial color="#06b6d4" transparent opacity={getOpacity("water-splitting")} />
          </mesh>
          {/* H atoms */}
          <mesh position={[0.4, 0.2, 0]} renderOrder={20}>
            <sphereGeometry args={[0.15]} />
            <meshLambertMaterial color="#e0f2fe" transparent opacity={getOpacity("water-splitting")} />
          </mesh>
          <mesh position={[-0.4, 0.2, 0]} renderOrder={21}>
            <sphereGeometry args={[0.15]} />
            <meshLambertMaterial color="#e0f2fe" transparent opacity={getOpacity("water-splitting")} />
          </mesh>
        </group>

        {/* Enhanced oxygen bubbles */}
        <group ref={oxygenRef}>
          {oxygenBubbles.map((bubble, i) => (
            <mesh key={i} position={bubble.position} renderOrder={22}>
              <sphereGeometry args={[0.12]} />
              <meshBasicMaterial color="#0ea5e9" transparent opacity={0.8 * getOpacity("water-splitting")} />
            </mesh>
          ))}
        </group>

        {showLabels && (
          <Html position={[0, -1.5, 0]} center>
            <div className="bg-cyan-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-cyan-800">Fotoliz</div>
              <div className="text-xs text-cyan-600">2H₂O → O₂ + 4H⁺ + 4e⁻</div>
            </div>
          </Html>
        )}
      </group>

      {/* Calvin Cycle (Light-independent reactions) - Enhanced */}
      <group position={[0, -3.5, 0]} scale={getScale("calvin-cycle")}>
        <group ref={calvinRef}>
          <mesh renderOrder={23}>
            <dodecahedronGeometry args={[0.6]} />
            <meshLambertMaterial color="#7c3aed" transparent opacity={getOpacity("calvin-cycle")} />
          </mesh>

          <mesh renderOrder={24}>
            <torusGeometry args={[2.5, 0.12, 8, 20]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.6 * getOpacity("calvin-cycle")} />
          </mesh>

          {co2Molecules.map((co2, i) => (
            <group key={i} position={co2.position} renderOrder={25}>
              <mesh>
                <sphereGeometry args={[0.18]} />
                <meshBasicMaterial color="#6b7280" transparent opacity={getOpacity("calvin-cycle")} />
              </mesh>
              {/* O atoms */}
              <mesh position={[0.25, 0, 0]} renderOrder={26}>
                <sphereGeometry args={[0.12]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={getOpacity("calvin-cycle")} />
              </mesh>
              <mesh position={[-0.25, 0, 0]} renderOrder={27}>
                <sphereGeometry args={[0.12]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={getOpacity("calvin-cycle")} />
              </mesh>
            </group>
          ))}
        </group>

        <group position={[0, -2.5, 0]} renderOrder={28}>
          <mesh>
            <boxGeometry args={[1.2, 1, 0.3]} />
            <meshLambertMaterial color="#fbbf24" transparent opacity={getOpacity("calvin-cycle")} />
          </mesh>
          {/* Hexagon shape for glucose */}
          <mesh position={[0, 0, 0.2]} renderOrder={29}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={getOpacity("calvin-cycle")} />
          </mesh>

          {showLabels && (
            <Html position={[0, -1, 0]} center>
              <div className="bg-yellow-100 px-2 py-1 rounded text-xs font-bold text-yellow-800">Glikoz</div>
            </Html>
          )}
        </group>

        {showLabels && (
          <Html position={[0, 3.5, 0]} center>
            <div className="bg-purple-100 px-3 py-2 rounded-lg shadow-md text-center">
              <div className="font-bold text-purple-800">Calvin Döngüsü</div>
              <div className="text-xs text-purple-600">RuBisCO + CO₂</div>
            </div>
          </Html>
        )}
      </group>

      {/* Energy flow arrows - Daha iyi görünürlük */}
      <group>
        <mesh position={[-2, 1, 2]} rotation={[0, 0, -Math.PI / 4]} renderOrder={30}>
          <coneGeometry args={[0.25, 1.5, 4]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={getOpacity("all")} />
        </mesh>

        <mesh position={[1.5, -1.5, 1]} rotation={[0, 0, -Math.PI / 3]} renderOrder={31}>
          <coneGeometry args={[0.25, 1.5, 4]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={getOpacity("all")} />
        </mesh>

        {/* Energy flow labels */}
        {showLabels && (
          <>
            <Html position={[-2, 2, 2]} center>
              <div className="bg-red-100 px-2 py-1 rounded text-xs font-bold text-red-800">Işık Enerjisi</div>
            </Html>
            <Html position={[1.5, -0.5, 1]} center>
              <div className="bg-red-100 px-2 py-1 rounded text-xs font-bold text-red-800">Kimyasal Enerji</div>
            </Html>
          </>
        )}
      </group>

      {/* Main process labels */}
      {showLabels && (
        <>
          <Html position={[-3, 4.5, 0]} center>
            <div className="bg-white px-4 py-3 rounded-lg shadow-lg text-center border-2 border-green-200">
              <h3 className="font-bold text-green-800 text-lg">Işığa Bağımlı Reaksiyonlar</h3>
              <p className="text-sm text-gray-600">Tilakoid Zarı</p>
              <p className="text-xs text-green-600 mt-1">H₂O + Işık → ATP + NADPH + O₂</p>
            </div>
          </Html>

          <Html position={[3, -5, 0]} center>
            <div className="bg-white px-4 py-3 rounded-lg shadow-lg text-center border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 text-lg">Işığa Bağımsız Reaksiyonlar</h3>
              <p className="text-sm text-gray-600">Stroma</p>
              <p className="text-xs text-purple-600 mt-1">CO₂ + ATP + NADPH → Glikoz</p>
            </div>
          </Html>
        </>
      )}
    </group>
  )
}
