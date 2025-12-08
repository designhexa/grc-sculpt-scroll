import React, {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Html, useTexture } from "@react-three/drei";
import grcOrnament from "@/assets/grc-ornament.jpg";

/**
 * FilmRollWheel.tsx
 *
 * Single-file component that draws a circular "wheel" of ornament cards.
 * Pivot (rotation axis) is fixed at world X = PIVOT_WORLD_X (a vertical line).
 * The wheel visuals are shifted left so the pivot sits at the RIGHT edge
 * of the wheel. Mouse drag left/right rotates the pivot (thus wheel rotates).
 *
 * Key configuration:
 *  - Pivot X = 4 (user requested)
 *  - Camera sits to the right of pivot so pivot appears near right edge
 *  - No panning of camera; mouse only rotates the wheel
 *
 * Notes:
 *  - This file is intentionally verbose (lots of comments) so you can read
 *    and tweak behavior easily.
 */

/* ===========================
   CONFIG
   =========================== */

const PIVOT_WORLD_X = 4; // user requested pivot vertical line X=4 (screen-right axis)
const WHEEL_RADIUS = 6; // visible radius of wheel
const CAMERA_POSITION: [number, number, number] = [10.5, 3.0, 11]; // camera placed right of pivot
const CAMERA_FOV = 45;

/* ===========================
   Data: sample ornaments
   =========================== */

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
  description:
    "Ornamen GRC premium dengan desain klasik yang elegan. Cocok untuk dekorasi eksterior maupun interior bangunan.",
  specs: {
    material: "Glass Fiber Reinforced Concrete",
    dimensions: `${60 + i * 5}cm x ${40 + i * 3}cm x ${8 + i}cm`,
    weight: `${12 + i * 2} kg`,
    finish: i % 2 === 0 ? "Natural Stone" : "Painted Finish",
  },
}));

/* ===========================
   Helper: clamp and ease
   =========================== */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ===========================
   Card component
   - Card positioned on circle and rotated to face outward.
   - Important: rotationY set so the card front faces outward (toward camera).
   =========================== */

interface CardProps {
  data: OrnamentData;
  angle: number; // base angle (radians)
  radius: number;
  isSelected: boolean;
  onClick: () => void;
  wheelRotation: number; // wheel rotation offset in radians
}

function Card({
  data,
  angle,
  radius,
  isSelected,
  onClick,
  wheelRotation,
}: CardProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  // useTexture from drei caches textures; flipY false may be needed for certain loaders
  const texture = useTexture(data.texture);

  // Ensure wrapping & orientation stable
  useEffect(() => {
    if (!texture) return;
    // make sure texture doesn't flip unexpectedly
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // optional: adjust repeat if needed
    texture.repeat.set(1, 1);
    // for GLTF normal usage, flipY default is fine but we ensure true orientation
    texture.needsUpdate = true;
  }, [texture]);

  // total angle = base + wheel rotation
  const totalAngle = angle + wheelRotation;

  // position on circle (X forward is right, Z forward is out of screen)
  const x = Math.sin(totalAngle) * radius;
  const z = Math.cos(totalAngle) * radius;

  // Compute rotation so the card faces outward (front faces away from center)
  // If card's local +Z is its front face, then rotateY so +Z aligns to vector from card to camera.
  // Vector from center to card is (x, 0, z) — pointing from origin to card
  // We want card's +Z to point outward (same as (x, 0, z)), so rotationY = atan2(x, z)
  const rotationY = Math.atan2(x, z) + Math.PI; // add PI to make front face outward

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* back panel */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.6, 2.6, 0.04]} />
        <meshStandardMaterial
          color={isSelected ? "#D4A574" : "#7b6350"}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* main card box */}
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[3.4, 2.4, 0.12]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.15}
          roughness={0.6}
          emissive={isSelected ? "#D4A574" : "#000000"}
          emissiveIntensity={isSelected ? 0.28 : 0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Html label below the card */}
      <Html position={[0, -1.6, 0.08]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md border border-white/30 whitespace-nowrap">
          <span style={{ fontWeight: 700, fontSize: 12, color: "#f7f5f2", letterSpacing: 1 }}>
            ORN. {data.id}
          </span>
        </div>
      </Html>
    </group>
  );
}

/* ===========================
   WheelWithGear component (forwardRef)
   - Accepts rotation for visual gear rotation.
   - Is shifted left by -radius so the pivot (parent) is at the wheel's RIGHT edge.
   =========================== */

type WheelWithGearProps = {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  rotation: number; // rotation radians used for visual gear spin and card positions
};

const WheelWithGear = forwardRef<THREE.Group, WheelWithGearProps>(function WheelWithGear(
  { selectedId, onSelect, rotation },
  ref
) {
  const radius = WHEEL_RADIUS;
  const cardCount = ornamentData.length;
  const angleStep = (Math.PI * 2) / cardCount;

  const gearTeeth = 28;
  const gearInnerRadius = 1.15;
  const gearOuterRadius = 1.6;

  // return wheel group shifted left, so parent pivot placed at the wheel's right edge
  return (
    <group ref={ref} position={[-radius, 0, 0]}>
      {/* central gear (rotating visually) */}
      <group rotation={[Math.PI / 2, 0, rotation]}>
        <mesh>
          <cylinderGeometry args={[gearInnerRadius, gearInnerRadius, 0.4, 32]} />
          <meshStandardMaterial color="#4A3F35" metalness={0.7} roughness={0.25} />
        </mesh>

        {Array.from({ length: gearTeeth }).map((_, i) => {
          const t = (i / gearTeeth) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(t) * gearInnerRadius, 0, Math.sin(t) * gearInnerRadius]}
              rotation={[0, -t, 0]}
            >
              <boxGeometry args={[0.38, 0.34, 0.22]} />
              <meshStandardMaterial color="#5C4A3D" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* outer rings */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 12, 160]} />
        <meshStandardMaterial color="#8B7355" metalness={0.45} roughness={0.33} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 12, 160]} />
        <meshStandardMaterial color="#8B7355" metalness={0.45} roughness={0.33} />
      </mesh>

      {/* rods connecting center to cards */}
      {Array.from({ length: cardCount }).map((_, i) => {
        const rodAngle = (i / cardCount) * Math.PI * 2 + rotation;
        const innerX = Math.sin(rodAngle) * gearOuterRadius;
        const innerZ = Math.cos(rodAngle) * gearOuterRadius;
        const outerX = Math.sin(rodAngle) * (radius - 0.6);
        const outerZ = Math.cos(rodAngle) * (radius - 0.6);
        const midX = (innerX + outerX) / 2;
        const midZ = (innerZ + outerZ) / 2;
        const rodLength = Math.hypot(outerX - innerX, outerZ - innerZ);

        return (
          <mesh key={i} position={[midX, 0, midZ]} rotation={[0, -rodAngle, 0]}>
            <boxGeometry args={[rodLength, 0.06, 0.06]} />
            <meshStandardMaterial color="#6B5B4F" metalness={0.45} roughness={0.4} />
          </mesh>
        );
      })}

      {/* cards themselves */}
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
});

/* ===========================
   Detail Panel component (HTML overlay)
   =========================== */

function DetailPanel({ data, onClose }: { data: OrnamentData | null; onClose: () => void }) {
  if (!data) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 96,
        bottom: 96,
        width: 320,
        background: "rgba(15,12,10,0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: 12,
        zIndex: 40,
        color: "#f7f5f2",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, background: "#D4A574", borderRadius: 999 }} />
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>{data.name}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "none",
            color: "#f7f5f2",
            cursor: "pointer",
          }}
          aria-label="close"
        >
          ×
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
          <img src={data.texture} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>

      <div style={{ marginTop: 12, color: "rgba(255,255,255,0.8)" }}>
        <p style={{ margin: 0, fontSize: 13 }}>{data.description}</p>
      </div>

      <div style={{ marginTop: 14, overflowY: "auto", maxHeight: 160 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f7f5f2", marginBottom: 8 }}>Spesifikasi</div>
        {Object.entries(data.specs).map(([key, value]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ textTransform: "uppercase", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              {key === "material" ? "Material" : key === "dimensions" ? "Dimensi" : key === "weight" ? "Berat" : "Finishing"}
            </div>
            <div style={{ fontSize: 13, color: "#f7f5f2", maxWidth: "58%", textAlign: "right" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Loading fallback UI
   =========================== */

function LoadingFallback() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0b09" }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.8)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, border: "4px solid rgba(255,255,255,0.08)", borderTopColor: "#D4A574", margin: "0 auto", animation: "spin 1s linear infinite" }} />
        <div style={{ marginTop: 12, fontSize: 13 }}>Loading 3D Scene...</div>
      </div>
    </div>
  );
}

/* small CSS keyframes for spin (we inject inline) */
const styleEl = document.createElement("style");
styleEl.innerHTML = `
@keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(styleEl);

/* ===========================
   Scene component
   - Pivot group placed at PIVOT_WORLD_X
   - WheelWithGear is child of pivot and shifted left by -radius => pivot is at right edge
   - Camera fixed in world space (no orbit controls to move camera)
   - Mouse drag rotates pivot around world Y axis
   =========================== */

function Scene({
  selectedId,
  onSelect,
  isAutoPlaying,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isAutoPlaying: boolean;
}) {
  // pivotRef controls the world transform of the wheel's pivot (vertical axis at world X = PIVOT_WORLD_X)
  const pivotRef = useRef<THREE.Group | null>(null);

  // wheelRef forwarded into WheelWithGear (the child) in case you want to access wheel local group
  const wheelRef = useRef<THREE.Group | null>(null);

  // rotation state used for visual gear spin and for card positions
  // pivotRef.rotation.y is final source-of-truth for wheel visual rotation (because mouse drags change pivot)
  // but we keep a small rotatingVisual to spin gears independently if needed
  const [gearSpin, setGearSpin] = useState(0);

  // drag handling (mouse)
  const isDragging = useRef(false);
  const prevClientX = useRef(0);
  const velocity = useRef(0); // inertia

  // damping/inertia params
  const DRAG_SPEED = 0.01; // multiplier for drag -> radians
  const INERTIA_FRICTION = 0.95; // friction applied per frame when not dragging
  const MAX_VELOCITY = 0.6; // clamp to avoid runaway

  // auto-rotation when playing (gentle rotation)
  const AUTO_ROTATION_SPEED = 0.15;

  // useFrame to update pivot rotation and inertia
  useFrame((_, delta) => {
    // if auto-playing and not dragging, slowly rotate pivot
    if (isAutoPlaying && !isDragging.current) {
      if (pivotRef.current) pivotRef.current.rotation.y += AUTO_ROTATION_SPEED * delta;
    }

    // apply inertia velocity if present
    if (!isDragging.current) {
      if (Math.abs(velocity.current) > 1e-4 && pivotRef.current) {
        pivotRef.current.rotation.y += velocity.current;
        velocity.current *= INERTIA_FRICTION;
        // clamp if extremely small
        if (Math.abs(velocity.current) < 1e-5) velocity.current = 0;
      }
    }

    // visual gear spin — independent small spin to show movement
    setGearSpin((s) => s + delta * 1.6);
  });

  // attach mouse handlers to window to ensure drag continues if pointer leaves canvas
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      // only left button
      if (e.button !== 0) return;
      isDragging.current = true;
      prevClientX.current = e.clientX;
      // stop inertia while dragging
      velocity.current = 0;
      // stop auto-play while dragging
    };

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevClientX.current;
      prevClientX.current = e.clientX;

      // rotate pivot around world Y by deltaX * DRAG_SPEED
      const deltaRad = dx * DRAG_SPEED * 0.8; // reduce sensitivity a bit
      if (pivotRef.current) {
        pivotRef.current.rotation.y -= deltaRad;
      }

      // set velocity for inertia
      velocity.current = clamp(deltaRad * 0.8, -MAX_VELOCITY, MAX_VELOCITY);
    };

    const onUp = (_e: MouseEvent) => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    // touch events for mobile
    let touchStartX = 0;
    const onTouchStart = (ev: TouchEvent) => {
      isDragging.current = true;
      touchStartX = ev.touches[0].clientX;
      prevClientX.current = touchStartX;
      velocity.current = 0;
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (!isDragging.current) return;
      const x = ev.touches[0].clientX;
      const dx = x - prevClientX.current;
      prevClientX.current = x;
      const deltaRad = dx * DRAG_SPEED * 0.9;
      if (pivotRef.current) pivotRef.current.rotation.y -= deltaRad;
      velocity.current = clamp(deltaRad * 0.8, -MAX_VELOCITY, MAX_VELOCITY);
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener("touchstart", onTouchStart);
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
  }, []);

  // When user clicks a card, this centers/opens detail panel; keep pivot static
  // We don't change pivot position on select; only stop autoplay (handled externally in caller)

  return (
    <>
      {/* background color */}
      <color attach="background" args={["#0f0c0a"]} />

      {/* fog for depth */}
      <fog attach="fog" args={["#0f0c0a", 18, 40]} />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[12, 14, 8]} intensity={1.0} color={"#fff9ee"} />
      <pointLight position={[0, 8, 0]} intensity={0.25} color={"#ffffff"} />

      {/* Pivot is the vertical axis line at x = PIVOT_WORLD_X */}
      <group ref={pivotRef} position={[PIVOT_WORLD_X, 0, 0]}>
        {/* Wheel visual is child; wheel is internally shifted left (-radius) so pivot sits at right edge */}
        <WheelWithGear ref={wheelRef} selectedId={selectedId} onSelect={onSelect} rotation={gearSpin} />
      </group>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.8, 0]}>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color={"#070502"} metalness={0.2} roughness={0.95} />
      </mesh>

      {/* Camera (fixed) — we position camera to the right so the pivot appears near screen right */}
      <PerspectiveCamera makeDefault fov={CAMERA_FOV} position={CAMERA_POSITION} />

      {/* Environment (lighting probe) */}
      <Environment preset="warehouse" background={false} />
    </>
  );
}

/* ===========================
   Main page component
   - Header, controls, canvas
   - Keeps `isAutoPlaying` state: when user selects a card autoplay stops
   =========================== */

export default function FilmRollWheel() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const selectedData = selectedId ? ornamentData.find((o) => o.id === selectedId) || null : null;

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id !== null) setIsAutoPlaying(false);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#0f0c0a", overflow: "hidden" }}>
      {/* subtle background gradient overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(12,10,9,0.15), rgba(0,0,0,0.0))", zIndex: 0 }} />

      {/* header */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 80, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "linear-gradient(180deg, rgba(15,12,10,0.92), rgba(15,12,10,0.0))" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, background: "#D4A574", borderRadius: 999 }} />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f7f5f2" }}>GRC Ornaments</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setIsAutoPlaying((s) => !s)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.04)",
              background: isAutoPlaying ? "rgba(212,165,116,0.12)" : "rgba(255,255,255,0.02)",
              color: isAutoPlaying ? "#D4A574" : "#f7f5f2",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* detail panel */}
      <DetailPanel data={selectedData} onClose={() => setSelectedId(null)} />

      {/* instruction bubble bottom center */}
      {!selectedId && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 24, zIndex: 30 }}>
          <div style={{ background: "rgba(15,12,10,0.8)", padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Klik ornamen untuk melihat detail</div>
          </div>
        </div>
      )}

      {/* 3D canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas dpr={[1, 2]} camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}>
            <Scene selectedId={selectedId} onSelect={handleSelect} isAutoPlaying={isAutoPlaying} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
