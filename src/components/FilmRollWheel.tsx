import { useRef, useEffect, useState, Suspense } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import grcOrnament from "@/assets/grc-ornament.jpg";

/* ------------------------------------------------------------------
 * DATA
 * ------------------------------------------------------------------ */

interface OrnamentData {
  id: number;
  name: string;
  texture: string;
  description: string;
  specs: {
    material: string;
    dimensions: string;
    weight: string;
    finish: string;
  };
}

const ornamentData: OrnamentData[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Ornamen ${i + 1}`,
  texture: grcOrnament,
  description: `Ornamen GRC premium dengan desain klasik yang elegan.`,
  specs: {
    material: "Glass Fiber Reinforced Concrete",
    dimensions: `${60 + i * 5}cm x ${40 + i * 3}cm x ${8 + i}cm`,
    weight: `${12 + i * 2} kg`,
    finish: i % 2 === 0 ? "Natural Stone" : "Painted Finish",
  },
}));

/* ------------------------------------------------------------------
 * CARD COMPONENT
 * ------------------------------------------------------------------ */

function Card({ data, angle, radius, isSelected, onClick, wheelRotation }) {
  const meshRef = useRef(null);
  const texture = useTexture(data.texture);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const totalAngle = angle + wheelRotation;
  const x = Math.sin(totalAngle) * radius;
  const z = Math.cos(totalAngle) * radius;

  return (
    <group position={[x, 0, z]} rotation={[0, totalAngle, 0]}>
      {/* Shadow panel */}
      <mesh position={[6.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1510" />
      </mesh>

      {/* Card texture */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <boxGeometry args={[3.4, 2.4, 0.12]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Label */}
      <Html position={[0, -1.6, 0.1]} center distanceFactor={8}>
        <div className="backdrop-blur-md bg-white/30 text-black px-3 py-1 rounded-md border border-white/50">
          ORN. {data.id}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------
 * GEARED WHEEL (FULL MEKANISME)
 * ------------------------------------------------------------------ */

function WheelWithGear({ selectedId, onSelect, rotation }) {
  const radius = 4.2;
  const cardCount = ornamentData.length;
  const angleStep = (Math.PI * 2) / cardCount;

  const gearInnerRadius = 1.2;
  const gearOuterRadius = 2.2;
  const gearTeeth = 24;

  return (
    <group position={[3.2, 0, 0]}>
      {/* Central rotating gear */}
      <group rotation={[Math.PI / 2, 0, rotation]}>
        <mesh>
          <cylinderGeometry args={[gearInnerRadius, gearInnerRadius, 0.4, 32]} />
          <meshStandardMaterial color="#4A3F35" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Teeth */}
        {Array.from({ length: gearTeeth }, (_, i) => {
          const angle = (i / gearTeeth) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * gearInnerRadius,
                0,
                Math.sin(angle) * gearInnerRadius,
              ]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.4, 0.35, 0.25]} />
              <meshStandardMaterial
                color="#5C4A3D"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          );
        })}

        {/* Center hole */}
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
          <meshStandardMaterial color="#3D332A" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
          <meshStandardMaterial color="#3D332A" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Rings */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Rods connecting gear → cards */}
      {Array.from({ length: cardCount }, (_, i) => {
        const rodAngle = (i / cardCount) * Math.PI * 2 + rotation;

        const innerX = Math.sin(rodAngle) * gearOuterRadius;
        const innerZ = Math.cos(rodAngle) * gearOuterRadius;

        const outerX = Math.sin(rodAngle) * (radius - 0.5);
        const outerZ = Math.cos(rodAngle) * (radius - 0.5);

        const midX = (innerX + outerX) / 2;
        const midZ = (innerZ + outerZ) / 2;
        const rodLength = Math.sqrt(
          Math.pow(outerX - innerX, 2) + Math.pow(outerZ - innerZ, 2)
        );

        return (
          <mesh key={i} position={[midX, 0, midZ]} rotation={[0, -rodAngle, 0]}>
            <boxGeometry args={[rodLength, 0.06, 0.06]} />
            <meshStandardMaterial
              color="#6B5B4F"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* Cards */}
      {ornamentData.map((data, index) => (
        <Card
          key={data.id}
          data={data}
          angle={index * angleStep}
          radius={radius}
          wheelRotation={rotation}
          isSelected={selectedId === data.id}
          onClick={() => onSelect(selectedId === data.id ? null : data.id)}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
 * DETAIL PANEL
 * ------------------------------------------------------------------ */

function DetailPanel({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="absolute left-4 md:left-6 top-24 bottom-24 w-72 md:w-80 bg-background/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden z-30 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-primary uppercase tracking-wider">
              {data.name}
            </h2>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="p-4">
          <div className="aspect-video rounded-xl overflow-hidden border border-primary/20">
            <img
              src={data.texture}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-4 md:px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Specifications */}
        <div className="flex-1 px-4 md:px-6 pb-6 overflow-auto">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3">
            Spesifikasi
          </h3>
          <div className="space-y-3">
            {Object.entries(data.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-primary/10">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {key === "material"
                    ? "Material"
                    : key === "dimensions"
                    ? "Dimensi"
                    : key === "weight"
                    ? "Berat"
                    : "Finishing"}
                </span>
                <span className="text-sm font-medium max-w-[50%] text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * LOADING FALLBACK
 * ------------------------------------------------------------------ */

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * 3D SCENE
 * ------------------------------------------------------------------ */

function Scene({ selectedId, onSelect, isAutoPlaying }) {
  const pivotRef = useRef();
  const controlsRef = useRef();

  const [rotation, setRotation] = useState(0);

  useFrame((_, delta) => {
    if (isAutoPlaying) setRotation((r) => r + delta * 0.15);
  });

  useEffect(() => {
    controlsRef.current?.target.set(6, 0, 0);
    controlsRef.current?.update();
  }, []);

  return (
    <>
      <color attach="background" args={["#1a1510"]} />
      <PerspectiveCamera makeDefault position={[14, 3, 16]} />

      {/* Pivot */}
      <group ref={pivotRef} position={[6, 0, 0]}>
        <WheelWithGear
          selectedId={selectedId}
          onSelect={onSelect}
          rotation={rotation}
        />
      </group>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={25}
      />

      <ambientLight intensity={0.6} />
      <Environment preset="studio" />
    </>
  );
}

/* ------------------------------------------------------------------
 * MAIN COMPONENT
 * ------------------------------------------------------------------ */

export default function FilmRollWheel() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const selectedData = selectedId
    ? ornamentData.find((o) => o.id === selectedId) || null
    : null;

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    if (id) setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm z-20">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">
            GRC Ornaments
          </h1>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all ${
              isAutoPlaying
                ? "bg-accent/20 border-accent text-accent"
                : "bg-primary/10 border-primary/30 text-foreground"
            }`}
          >
            <span className="text-xs md:text-sm uppercase">
              {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
            </span>
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel data={selectedData} onClose={() => setSelectedId(null)} />

      {/* Instruction */}
      {!selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="bg-background/80 backdrop-blur-md px-4 md:px-6 py-3 rounded-full border border-primary/30 shadow-lg">
            <p className="text-xs md:text-sm text-muted-foreground">
              Klik ornamen untuk melihat detail
            </p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas>
            <Scene
              selectedId={selectedId}
              onSelect={handleSelect}
              isAutoPlaying={isAutoPlaying}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
