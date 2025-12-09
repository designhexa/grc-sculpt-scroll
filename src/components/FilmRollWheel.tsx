import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Html, useTexture } from "@react-three/drei";
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
    category: string;
    warranty: string;
  };
}

const WHEEL_RADIUS = 8;

const ornamentData: OrnamentData[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Ornamen ${i + 1}`,
  texture: grcOrnament,
  description: `Ornamen GRC premium dengan desain klasik yang elegan. Dibuat dari material Glass Fiber Reinforced Concrete berkualitas tinggi dengan presisi tinggi. Cocok untuk dekorasi eksterior maupun interior bangunan modern dan klasik.`,
  specs: {
    material: "Glass Fiber Reinforced Concrete",
    dimensions: `${60 + i * 5}cm × ${40 + i * 3}cm × ${8 + i}cm`,
    weight: `${12 + i * 2} kg`,
    finish: i % 2 === 0 ? "Natural Stone" : "Painted Finish",
    category: i % 3 === 0 ? "Exterior" : i % 3 === 1 ? "Interior" : "Universal",
    warranty: "10 tahun",
  },
}));

interface CardProps {
  data: OrnamentData;
  angle: number;
  radius: number;
  isSelected: boolean;
  onClick: () => void;
}

function Card({ data, angle, radius, isSelected, onClick }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // Position on the wheel circle - wheel rotates around X axis (horizontal axis)
  // Cards positioned in Y-Z plane, facing outward (-Z direction toward camera)
  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  // Keep cards upright and facing camera
  const rotationX = -angle;

  return (
    <group position={[0, y, z]} rotation={[rotationX, 0, 0]}>
      {/* Card frame */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[4, 2.8, 0.05]} />
        <meshStandardMaterial
          color={isSelected ? "#00ffff" : "#1a1a2e"}
          metalness={0.9}
          roughness={0.1}
          emissive={isSelected ? "#00ffff" : "#0a0a15"}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>

      {/* Main card - landscape, texture on front (facing -Z, toward camera) */}
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <boxGeometry args={[3.8, 2.6, 0.15]} />
        <meshStandardMaterial
      map={texture}
      metalness={0.1}
      roughness={0.5}
      emissive={isSelected ? "#00aaff" : "#000000"}
      emissiveIntensity={isSelected ? 0.2 : 0}
      side={THREE.DoubleSide}
    />
      </mesh>

      {/* Neon edge glow - front side */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[3.9, 2.7, 0.01]} />
        <meshBasicMaterial
          color={isSelected ? "#00ffff" : "#334455"}
          transparent
          opacity={isSelected ? 0.8 : 0.3}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, -1.8, 0.2]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400/50 whitespace-nowrap shadow-lg">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            ORN. {data.id}
          </span>
        </div>
      </Html>
    </group>
  );
}

function RoboticWheel({
  selectedId,
  onSelect,
  rotation,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  rotation: number;
}) {
  const radius = WHEEL_RADIUS;
  const cardCount = ornamentData.length;
  const angleStep = (Math.PI * 2) / cardCount;

  // NOTE: jangan set position di sini — kontrol posisi dari Scene
  return (
    <group rotation={[rotation, 0, 0]}>
      {/* Central hub - robotic style, rotated to face camera */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Main cylinder core */}
        <mesh>
          <cylinderGeometry args={[2, 2, 1, 32]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Outer ring (rotated to match wheel plane) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.4, 0.2, 8, 64]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Hexagonal bolts */}
        {Array.from({ length: 8 }, (_, i) => {
          const boltAngle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(boltAngle) * 1.8, 0.55, Math.sin(boltAngle) * 1.8]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.2, 6]} />
              <meshStandardMaterial
                color="#00aaff"
                metalness={0.9}
                roughness={0.1}
                emissive="#00aaff"
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Outer structural ring - vertical plane facing camera */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.4, 0.2, 8, 64]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Inner structural ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius - 0.4, 0.15, 8, 64]} />
        <meshStandardMaterial color="#0f0f1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cards - positioned on the wheel */}
      {ornamentData.map((data, index) => (
        <Card
          key={data.id}
          data={data}
          angle={index * angleStep}
          radius={radius}
          isSelected={selectedId === data.id}
          onClick={() => onSelect(selectedId === data.id ? null : data.id)}
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
    <div className="absolute left-6 md:left-12 top-24 bottom-8 w-[380px] md:w-[480px] z-30 animate-fade-in">
      {/* Glassmorphism container - more transparent */}
      <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_64px_rgba(0,255,255,0.08)] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,255,0.6)]" />
              <h2 className="text-2xl font-light text-white tracking-[0.3em] uppercase">
                {data.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
            >
              <span className="text-white text-xl font-light">×</span>
            </button>
          </div>
        </div>

        {/* Image preview */}
        <div className="p-6">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative">
            <img
              src={data.texture}
              alt={data.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur-md rounded-full text-xs font-mono text-cyan-300 uppercase tracking-wider border border-cyan-400/30">
                {data.specs.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            {data.description}
          </p>
        </div>

        {/* Specifications grid */}
        <div className="flex-1 px-6 pb-6 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-cyan-400/50" />
            Spesifikasi Teknis
            <div className="flex-1 h-[1px] bg-white/10" />
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.specs).map(([key, value]) => (
              <div
                key={key}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-400/30 transition-colors"
              >
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">
                  {key === "material" ? "Material" 
                    : key === "dimensions" ? "Dimensi"
                    : key === "weight" ? "Berat"
                    : key === "finish" ? "Finishing"
                    : key === "category" ? "Kategori"
                    : "Garansi"}
                </span>
                <span className="text-sm font-medium text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/10">
          <button className="w-full py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-mono text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            Hubungi Kami
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-muted-foreground font-mono text-sm tracking-wider">LOADING...</p>
      </div>
    </div>
  );
}

function Scene({ selectedId, onSelect, isAutoPlaying }) {
  const wheelPivot = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const CAMERA_POS = [0, 0.5, 12];
  const rotationSpeed = isAutoPlaying ? 0.01 : 0;

  // Pivot tetap di kanan layar (POV)
  const PIVOT_X = 5.0; // pivot lebih ke kanan layar
  const WHEEL_OFFSET_X = -5.0; // geser wheel relatif ke pivot

  useEffect(() => {
    camera.position.set(...CAMERA_POS);
    camera.lookAt(0, 0, 0);
  }, []);

  useFrame(() => {
    if (wheelPivot.current) {
      // animasi dari belakang ke depan
      wheelPivot.current.rotation.x -= rotationSpeed;
    }
  });

  return (
    <group position={[PIVOT_X, 0, 0]}>       {/* pivot lebih ke kanan */}
      <group ref={wheelPivot} position={[WHEEL_OFFSET_X, 0, 0]}>
        <RoboticWheel
          selectedId={selectedId}
          onSelect={onSelect}
          rotation={0} 
        />
      </group>
    </group>
  );
}

// Helper: Kamera lookAt tanpa error
function CameraLookAt({ target }) {
  useFrame(({ camera }) => {
    camera.lookAt(...target);
  });
  return null;
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

  return (
    <div className="relative w-full h-screen bg-[#080810] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(0,255,255,0.05)_0%,_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(0,136,255,0.03)_0%,_transparent_40%)] pointer-events-none z-0" />

      {/* Header - minimal futuristic */}
      <div className="absolute top-0 left-0 right-0 h-20 z-20">
        <div className="h-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_15px_hsl(var(--accent))]" />
            <h1 className="text-lg md:text-xl font-light text-foreground tracking-[0.4em] uppercase">
              GRC Ornaments
            </h1>
          </div>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-6 py-2.5 rounded-full border transition-all font-mono text-xs uppercase tracking-widest ${
              isAutoPlaying
                ? "bg-accent/20 border-accent/50 text-accent shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                : "bg-background/20 border-accent/20 text-muted-foreground hover:border-accent/40"
            }`}
          >
            {isAutoPlaying ? "◼ PAUSE" : "▶ PLAY"}
          </button>
        </div>
      </div>

      {/* Detail Panel - left side glassmorphism */}
      <DetailPanel data={selectedData} onClose={() => setSelectedId(null)} />

      {/* Instructions */}
      {!selectedId && (
        <div className="absolute bottom-8 left-12 z-20 animate-fade-in">
          <div className="bg-background/10 backdrop-blur-md px-6 py-3 rounded-full border border-accent/20">
            <p className="text-sm text-muted-foreground font-mono flex items-center gap-3 tracking-wider">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              CLICK TO VIEW DETAILS
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
  style={{ background: "#87CEEB" }} // sky blue
>
  {/* Kamera */}
  <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />

  {/* Cahaya */}
  <ambientLight intensity={0.8} />
  <directionalLight position={[10, 10, 5]} intensity={1.2} />

  <Scene selectedId={selectedId} onSelect={handleSelect} isAutoPlaying={isAutoPlaying} />
</Canvas>

        </Suspense>
      </div>
    </div>
  );
}
