// FilmRollWheelFull.tsx
import React, { useRef, useEffect, useState, useCallback, forwardRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  useTexture,
} from "@react-three/drei";
import grcOrnament from "@/assets/grc-ornament.jpg";

/**
 * FULL IMPLEMENTATION
 * - Pivot (rotation axis) fixed at PIVOT_WORLD_X (this maps to "screen right" via camera offset)
 * - Wheel rendered as child of pivot, but shifted left by radius so pivot is wheel's right edge
 * - Drag rotates pivot (so wheel rotates around that axis)
 * - Inertia on drag release
 * - Auto-rotate (play/pause)
 * - Hover effects on cards
 * - Detail panel (left)
 * - Camera group offset trick so pivot projects to the right side of the viewport
 *
 * Usage: paste into your React project; ensure drei & @react-three/fiber present.
 */

/* =========================
   CONFIG / CONSTANTS
   ========================= */
const PIVOT_WORLD_X = 6; // world X coordinate used as the pivot (screen-right line)
const CAMERA_GROUP_OFFSET_X = 10; // move camera group left/right so pivot projects near screen edge
const CAMERA_BASE_POS: [number, number, number] = [12, 3, 9];
const WHEEL_RADIUS = 6;
const CARD_COUNT = 12;

/* =========================
   DATA
   ========================= */
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

const ornamentData: OrnamentData[] = Array.from({ length: CARD_COUNT }).map((_, i) => ({
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

/* =========================
   Card component
   ========================= */
interface CardProps {
  data: OrnamentData;
  angle: number;
  radius: number;
  isSelected: boolean;
  onClick: (id: number) => void;
  wheelRotation: number; // used to compute final angle (if needed)
}

function Card({ data, angle, radius, isSelected, onClick, wheelRotation }: CardProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const texture = useTexture(data.texture);

  // safe wrapping
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const totalAngle = angle + wheelRotation;
  const x = Math.sin(totalAngle) * radius;
  const z = Math.cos(totalAngle) * radius;
  const rotationY = totalAngle + Math.PI; // face outward (adjust as needed)

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onClick(data.id);
  };

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Back frame */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.6, 2.6, 0.04]} />
        <meshStandardMaterial color={isSelected ? "#D4A574" : "#6B5B4F"} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Main card */}
      <mesh ref={meshRef} onClick={handleClick} castShadow receiveShadow>
        <boxGeometry args={[3.4, 2.4, 0.12]} />
        <meshStandardMaterial map={texture} metalness={0.2} roughness={0.7} />
      </mesh>

      {/* HTML label (unaffected by pointer events) */}
      <Html position={[0, -1.6, 0.1]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md border border-white/20 text-xs font-bold text-primary">
          ORN. {data.id}
        </div>
      </Html>
    </group>
  );
}

/* =========================
   WheelWithGear (forwardRef)
   - Receives rotation value (via pivot group) but actual rotation is via parent pivot.
   - This returns a group shifted left by radius so pivot sits on wheel right-edge.
   ========================= */
type WheelWithGearProps = {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  wheelRotationLocal: number; // optional local rotation for decorations
};

const WheelWithGear = forwardRef<THREE.Group, WheelWithGearProps>(function WheelWithGear(
  { selectedId, onSelect, wheelRotationLocal },
  ref
) {
  const radius = WHEEL_RADIUS;
  const cardCount = CARD_COUNT;
  const angleStep = (Math.PI * 2) / cardCount;

  // gear geometry params
  const gearTeeth = 24;
  const gearInnerRadius = 1.2;
  const gearOuterRadius = 1.6;

  return (
    <group ref={ref} position={[-radius, 0, 0]} rotation={[0, 0, 0]}>
      {/* Center gear body (rotates visually by wheelRotationLocal) */}
      <group rotation={[Math.PI / 2, 0, wheelRotationLocal || 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[gearInnerRadius, gearInnerRadius, 0.4, 32]} />
          <meshStandardMaterial color="#4A3F35" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* teeth */}
        {Array.from({ length: gearTeeth }).map((_, i) => {
          const toothAngle = (i / gearTeeth) * Math.PI * 2;
          const toothX = Math.cos(toothAngle) * gearInnerRadius;
          const toothZ = Math.sin(toothAngle) * gearInnerRadius;
          return (
            <mesh key={i} position={[toothX, 0, toothZ]} rotation={[0, -toothAngle, 0]} castShadow>
              <boxGeometry args={[0.38, 0.28, 0.25]} />
              <meshStandardMaterial color="#5C4A3D" metalness={0.6} roughness={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* Outer rings */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 128]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 128]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* rods */}
      {Array.from({ length: cardCount }).map((_, i) => {
        const rodAngle = (i / cardCount) * Math.PI * 2 + (wheelRotationLocal || 0);
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
            <meshStandardMaterial color="#6B5B4F" metalness={0.45} roughness={0.35} />
          </mesh>
        );
      })}

      {/* cards */}
      {ornamentData.map((data, index) => (
        <Card
          key={data.id}
          data={data}
          angle={index * angleStep}
          radius={radius}
          isSelected={selectedId === data.id}
          onClick={(id) => onSelect(id)}
          wheelRotation={wheelRotationLocal}
        />
      ))}
    </group>
  );
});

/* =========================
   DetailPanel (left)
   ========================= */
function DetailPanel({ data, onClose }: { data: OrnamentData | null; onClose: () => void }) {
  if (!data) return null;
  return (
    <div className="absolute left-4 md:left-6 top-24 bottom-24 w-72 md:w-80 bg-background/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden z-30 animate-fade-in">
      <div className="h-full flex flex-col">
        <div className="p-4 md:p-6 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h2 className="text-lg md:text-xl font-bold text-primary uppercase tracking-wider">{data.name}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center">
              <span className="text-foreground text-lg">×</span>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="aspect-video rounded-xl overflow-hidden border border-primary/20">
            <img src={data.texture} alt={data.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="px-4 md:px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </div>

        <div className="flex-1 px-4 md:px-6 pb-6 overflow-auto">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" /> Spesifikasi
          </h3>
          <div className="space-y-3">
            {Object.entries(data.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {key === "material" ? "Material" : key === "dimensions" ? "Dimensi" : key === "weight" ? "Berat" : "Finishing"}
                </span>
                <span className="text-sm font-medium text-foreground text-right max-w-[50%]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   LoadingFallback
   ========================= */
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

/* =========================
   Scene
   - pivotRef at world X (this is rotation axis)
   - cameraGroup is offset so pivot projects to the right side
   - mouse drag rotates pivot (and only pivot)
   - inertia implemented for smooth spin after release
   ========================= */
function Scene({
  selectedId,
  onSelect,
  isAutoPlaying,
  setIsAutoPlaying,
  setSelectedId,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isAutoPlaying: boolean;
  setIsAutoPlaying: (v: boolean) => void;
  setSelectedId: (id: number | null) => void;
}) {
  const pivotRef = useRef<THREE.Group | null>(null);
  const cameraGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const wheelRef = useRef<THREE.Group | null>(null);

  const [wheelRotationLocal, setWheelRotationLocal] = useState(0);

  // drag state
  const isDragging = useRef(false);
  const prevX = useRef(0);
  const velocity = useRef(0); // angular velocity (radians/sec)
  const lastFrame = useRef<number | null>(null);

  // auto-rotate speed (when isAutoPlaying)
  const AUTO_SPEED = 0.15; // rad/s

  // Handle drag events on window
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      // only left button
      if (e.button !== 0) return;
      isDragging.current = true;
      prevX.current = e.clientX;
      velocity.current = 0;
      setIsAutoPlaying(false); // stop auto-play while dragging
    };

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !pivotRef.current) return;
      const dx = e.clientX - prevX.current;
      prevX.current = e.clientX;

      // Map screen delta to rotation around pivot's Y axis
      const rotationDelta = -dx * 0.01; // tweak sensitivity
      pivotRef.current.rotation.y += rotationDelta;

      // update instantaneous velocity (simple lowpass)
      velocity.current = THREE.MathUtils.lerp(velocity.current, rotationDelta / (1 / 60), 0.2);
    };

    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      // on release, we let inertia (velocity) spin and then decay
      // If velocity is very small, ignore
      if (Math.abs(velocity.current) < 0.0005) velocity.current = 0;
    };

    // touch support
    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      prevX.current = e.touches[0].clientX;
      velocity.current = 0;
      setIsAutoPlaying(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !pivotRef.current) return;
      const dx = e.touches[0].clientX - prevX.current;
      prevX.current = e.touches[0].clientX;
      const rotationDelta = -dx * 0.01;
      pivotRef.current.rotation.y += rotationDelta;
      velocity.current = THREE.MathUtils.lerp(velocity.current, rotationDelta / (1 / 60), 0.2);
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      if (Math.abs(velocity.current) < 0.0005) velocity.current = 0;
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [setIsAutoPlaying]);

  // useFrame loop: apply inertia if not dragging, apply auto-rotate if enabled
  useFrame((state, delta) => {
    // keep controls target locked to pivot
    if (controlsRef.current) {
      controlsRef.current.target.set(PIVOT_WORLD_X, 0, 0);
      controlsRef.current.update();
    }

    // auto rotate when enabled and not dragging and no velocity
    if (isAutoPlaying && !isDragging.current && Math.abs(velocity.current) < 0.0001 && pivotRef.current) {
      pivotRef.current.rotation.y += AUTO_SPEED * delta;
    }

    // if inertia present (velocity), apply it and decay
    if (!isDragging.current && Math.abs(velocity.current) > 0.000001 && pivotRef.current) {
      pivotRef.current.rotation.y += velocity.current * delta;
      // decay factor (friction)
      const friction = Math.max(0.92, 1 - 1.5 * delta); // tweak for feel
      velocity.current *= friction;
      // clamp tiny velocities to zero
      if (Math.abs(velocity.current) < 0.00002) velocity.current = 0;
    }

    // keep a local wheel rotation for visual gear spin (inverse of pivot rotation for charm)
    if (pivotRef.current) {
      setWheelRotationLocal(-pivotRef.current.rotation.y * 0.7);
    }
  });

  // Set camera view offset so pivot projects to right edge-ish
  useEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // shift the camera's view so pivot appears further to the right.
      // setViewOffset(fullWidth, fullHeight, x, y, fullWidth, fullHeight)
      // we place pivot near 80% of screen width -> x offset = w * 0.7
      const offsetX = Math.floor(w * 0.5); // we offset half width inside cameraGroup; cameraGroup also offsets
      // NOTE: Using setViewOffset can behave strangely when resizing; keep a mild offset
      cam.setViewOffset(w, h, Math.floor(w * 0.48), 0, w, h);
      cam.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // lock pointer cursor while dragging
  useEffect(() => {
    const onMove = () => {
      document.body.style.cursor = isDragging.current ? "grabbing" : "auto";
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <color attach="background" args={["#0f0b09"]} />
      <fog attach="fog" args={["#0f0b09", 10, 40]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 12, 6]} intensity={1.2} color="#fff8e7" />
      <pointLight position={[-8, 2, -6]} intensity={0.25} color="#d4a574" />

      {/* Pivot group: fixed X position in world space. Rotating this rotates the wheel around right-edge axis. */}
      <group ref={pivotRef} position={[PIVOT_WORLD_X, 0, 0]}>
        {/* WheelWithGear (shifted left inside) */}
        <WheelWithGear ref={wheelRef} selectedId={selectedId} onSelect={onSelect} wheelRotationLocal={wheelRotationLocal} />
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0d0a08" metalness={0.2} roughness={0.9} />
      </mesh>

      {/* Camera group: shifted left (negative X) so pivot appears at right screen */}
      <group ref={cameraGroupRef} position={[-CAMERA_GROUP_OFFSET_X, 0, 0]}>
        <PerspectiveCamera ref={cameraRef} makeDefault position={CAMERA_BASE_POS} fov={50} />

        {/* OrbitControls: keep zoom/pan off; rotation disabled so user can't move camera around pivot */}
        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          // rotateSpeed/limits irrelevant because rotate disabled
        />
      </group>

      <Environment preset="warehouse" background={false} />
    </>
  );
}

/* =========================
   Main Page Component
   ========================= */
export default function FilmRollWheelFull() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id) setIsAutoPlaying(false);
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none z-0" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm z-20">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
            <h1 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">GRC Ornaments</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying((s) => !s)}
              className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all ${
                isAutoPlaying ? "bg-accent/20 border-accent text-accent" : "bg-primary/10 border-primary/30 text-foreground"
              }`}
            >
              <span className="text-xs md:text-sm font-medium uppercase tracking-wide">{isAutoPlaying ? "⏸ Pause" : "▶ Play"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DetailPanel */}
      <DetailPanel data={selectedId ? ornamentData.find((o) => o.id === selectedId) || null : null} onClose={() => setSelectedId(null)} />

      {/* Instruction bubble */}
      {!selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="bg-background/80 backdrop-blur-md px-4 md:px-6 py-3 rounded-full border border-primary/30 shadow-lg">
            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Klik dan geser untuk memutar roda
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas shadows dpr={[1, 2]}>
            <Scene
              selectedId={selectedId}
              onSelect={handleSelect}
              isAutoPlaying={isAutoPlaying}
              setIsAutoPlaying={setIsAutoPlaying}
              setSelectedId={setSelectedId}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
