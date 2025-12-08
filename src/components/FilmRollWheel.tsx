import { useRef, useEffect, useState, Suspense } from "react";
import { OrbitControls, PerspectiveCamera, Environment, Html, useTexture } from "@react-three/drei";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import grcOrnament from "@/assets/grc-ornament.jpg";

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

/* ---------- Constants to control layout ---------- */
const PIVOT_WORLD_X = 6;      // world X coordinate that will act as "screen-right line" (pivot)
const CAMERA_POS = [14, 3, 16]; // keep camera at right of pivot so pivot projects near right edge
const WHEEL_RADIUS = 6;       // radius same as wheel code

const ornamentData: OrnamentData[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Ornamen ${i + 1}`,
  texture: grcOrnament,
  description: `Ornamen GRC premium dengan desain klasik yang elegan. Cocok untuk dekorasi eksterior maupun interior bangunan.`,
  specs: {
    material: "Glass Fiber Reinforced Concrete",
    dimensions: `${60 + i * 5}cm x ${40 + i * 3}cm x ${8 + i}cm`,
    weight: `${12 + i * 2} kg`,
    finish: i % 2 === 0 ? "Natural Stone" : "Painted Finish",
  },
}));

interface CardProps {
  data: OrnamentData;
  angle: number;
  radius: number;
  isSelected: boolean;
  onClick: () => void;
  wheelRotation: number;
}

function Card({ data, angle, radius, isSelected, onClick, wheelRotation }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);

  // ensure texture wrapping if needed
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const totalAngle = angle + wheelRotation;
  const x = Math.sin(totalAngle) * radius;
  const z = Math.cos(totalAngle) * radius;
  // Face outward - rotation points away from center
  const rotationY = totalAngle;

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Card frame (behind) */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[3.6, 2.6, 0.04]} />
        <meshStandardMaterial
          color={isSelected ? "#D4A574" : "#8B7355"}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Main card - landscape orientation */}
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <boxGeometry args={[3.4, 2.4, 0.12]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.2}
          roughness={0.6}
          emissive={isSelected ? "#D4A574" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, -1.6, 0.1]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md border border-primary/30 whitespace-nowrap">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            ORN. {data.id}
          </span>
        </div>
      </Html>
    </group>
  );
}

interface WheelProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isAutoPlaying: boolean;
}

// WheelWithGear: pivot is NOT here — this component assumes it's placed as child of pivot
function WheelWithGear({ selectedId, onSelect, rotation }) {
  const radius = WHEEL_RADIUS;
  const cardCount = ornamentData.length;
  const angleStep = (Math.PI * 2) / cardCount;

  const gearTeeth = 24;
  const gearInnerRadius = 1.2;
  const gearOuterRadius = 1.6;

  // IMPORTANT: wheel itself is shifted LEFT by `radius` so that pivot (parent) sits at the right-edge of wheel.
  return (
    <group position={[-radius, 0, 0] /* shift wheel left relative to pivot */}>
      {/* Center gear hub - rotates around pivot because this group is child of pivot */}
      <group rotation={[Math.PI / 2, 0, rotation]}>
        <mesh>
          <cylinderGeometry args={[gearInnerRadius, gearInnerRadius, 0.4, 32]} />
          <meshStandardMaterial color="#4A3F35" metalness={0.7} roughness={0.3} />
        </mesh>

        {Array.from({ length: gearTeeth }, (_, i) => {
          const toothAngle = (i / gearTeeth) * Math.PI * 2;
          const toothX = Math.cos(toothAngle) * gearInnerRadius;
          const toothZ = Math.sin(toothAngle) * gearInnerRadius;
          return (
            <mesh key={i} position={[toothX, 0, toothZ]} rotation={[0, -toothAngle, 0]}>
              <boxGeometry args={[0.4, 0.35, 0.25]} />
              <meshStandardMaterial color="#5C4A3D" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}

        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
          <meshStandardMaterial color="#3D332A" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
          <meshStandardMaterial color="#3D332A" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Outer rings, rods, cards (the rest of your wheel visuals) */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* rods */}
      {Array.from({ length: cardCount }, (_, i) => {
        const rodAngle = (i / cardCount) * Math.PI * 2 + rotation;
        const innerX = Math.sin(rodAngle) * gearOuterRadius;
        const innerZ = Math.cos(rodAngle) * gearOuterRadius;
        const outerX = Math.sin(rodAngle) * (radius - 0.5);
        const outerZ = Math.cos(rodAngle) * (radius - 0.5);
        const midX = (innerX + outerX) / 2;
        const midZ = (innerZ + outerZ) / 2;
        const rodLength = Math.hypot(outerX - innerX, outerZ - innerZ);

        return (
          <mesh key={i} position={[midX, 0, midZ]} rotation={[0, -rodAngle, 0]}>
            <boxGeometry args={[rodLength, 0.06, 0.06]} />
            <meshStandardMaterial color="#6B5B4F" metalness={0.5} roughness={0.4} />
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
          isSelected={selectedId === data.id}
          onClick={() => onSelect(selectedId === data.id ? null : data.id)}
          wheelRotation={rotation}
        />
      ))}
    </group>
  );
}

interface DetailPanelProps {
  data: OrnamentData | null;
  onClose: () => void;
}

function DetailPanel({ data, onClose }: DetailPanelProps) {
  if (!data) return null;

  return (
    <div className="absolute left-4 md:left-6 top-24 bottom-24 w-72 md:w-80 bg-background/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden z-30 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h2 className="text-lg md:text-xl font-bold text-primary uppercase tracking-wider">
                {data.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            >
              <span className="text-foreground text-lg">×</span>
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
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            Spesifikasi
          </h3>
          <div className="space-y-3">
            {Object.entries(data.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center py-2 border-b border-primary/10"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {key === "material"
                    ? "Material"
                    : key === "dimensions"
                    ? "Dimensi"
                    : key === "weight"
                    ? "Berat"
                    : "Finishing"}
                </span>
                <span className="text-sm font-medium text-foreground text-right max-w-[50%]">
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

// Scene: create pivot at PIVOT_WORLD_X, attach WheelWithGear as its child.
// Camera positioned to the right (CAMERA_POS) so that PIVOT_WORLD_X projects near screen-right.
// Controls are locked (no pan, limited azimuth) — user tidak bisa menggeser pivot/wheel.
function Scene({ selectedId, onSelect, isAutoPlaying }: WheelProps) {
  const pivotRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  const [rotation, setRotation] = useState(0);

  // auto-rotate: rotate the wheel by rotating the child group (WheelWithGear uses rotation prop)
  useFrame((_, delta) => {
    if (isAutoPlaying) setRotation((r) => r + delta * 0.15);
  });

  useEffect(() => {
    controlsRef.current.target.set(PIVOT_WORLD_X, 0, 0);
    controlsRef.current.update();
  }, []);

  return (
    <>
      <color attach="background" args={["#1a1510"]} />
      <fog attach="fog" args={["#1a1510", 12, 30]} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#fff8e7" />

      {/* Pivot placed at the world X that acts as "screen right line" */}
      <group ref={pivotRef} position={[PIVOT_WORLD_X, 0, 0]}>
        {/* wheel is child of pivot; wheel itself is shifted left inside WheelWithGear */}
        <WheelWithGear selectedId={selectedId} onSelect={onSelect} rotation={rotation} />
      </group>

      {/* ground, env, etc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0d0a08" metalness={0.2} roughness={0.9} />
      </mesh>

      {/* Camera — placed to the right; pivot at PIVOT_WORLD_X will therefore appear near right screen edge */}
      <PerspectiveCamera 
        makeDefault 
        position={[22, 6, 14]} 
        fov={40}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableRotate={false}   // ⛔ matikan rotasi kamera
        enableZoom={true}
        minDistance={10}
        maxDistance={25}
      />

      <Environment preset="warehouse" background={false} />
    </>
  );
}

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

  const isDragging = useRef(false);
const lastX = useRef(0);

const onPointerDown = (e) => {
  isDragging.current = true;
  lastX.current = e.clientX;
};

const onPointerUp = () => {
  isDragging.current = false;
};

const onPointerMove = (e) => {
  if (!isDragging.current) return;

  const delta = (e.clientX - lastX.current) * 0.01;
  setRotation(r => r + delta);
  lastX.current = e.clientX;
};

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none z-0" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm z-20">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
            <h1 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">
              GRC Ornaments
            </h1>
          </div>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all ${
              isAutoPlaying
                ? "bg-accent/20 border-accent text-accent"
                : "bg-primary/10 border-primary/30 text-foreground"
            }`}
          >
            <span className="text-xs md:text-sm font-medium uppercase tracking-wide">
              {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
            </span>
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel data={selectedData} onClose={() => setSelectedId(null)} />

      {/* Instructions */}
      {!selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="bg-background/80 backdrop-blur-md px-4 md:px-6 py-3 rounded-full border border-primary/30 shadow-lg">
            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Klik ornamen untuk melihat detail
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
          >
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
