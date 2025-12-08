import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
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
 * FilmRollWheel.tsx
 *
 * Purpose:
 *  - Place a circular wheel whose pivot (axis) sits at a fixed WORLD X (right side of viewport).
 *  - Wheel visuals are shifted left so pivot is on the right "edge" of the wheel.
 *  - OrbitControls remain active (zoom allowed), but camera rotation is disabled.
 *  - Mouse drag rotates the wheel only (with inertia/damping).
 *
 * How it works (short):
 *  - Scene creates a pivot group placed at PIVOT_WORLD_X in world coords.
 *  - WheelWithGear is a child of pivot and is shifted left by radius.
 *  - Canvas pointer events compute horizontal movement and update `wheelVelocity`.
 *  - useFrame applies wheelVelocity to pivot.rotation.y with damping.
 *
 * Notes:
 *  - All important values are exported as constants at top.
 *  - No outside global state; everything kept local to the component.
 */

/* ----------------------------- CONFIG / CONSTANTS --------------------------- */

/** world X coordinate that will act as the vertical "screen-right line" */
const PIVOT_WORLD_X = 14;

/** camera position (a point to the right of pivot so pivot projects near screen-right) */
const CAMERA_POS: [number, number, number] = [22, 6, 14];

/** visual radius of the wheel (affects how far wheel is shifted left relative to pivot) */
const WHEEL_RADIUS = 6;

/** number of cards/items around the wheel */
const CARD_COUNT = 12;

/* ----------------------------- DATA (sample) -------------------------------- */

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

const ornamentData: OrnamentData[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
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

/* ----------------------------- SMALL HELPERS -------------------------------- */

/** clamp utility */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ----------------------------- CARD COMPONENT -------------------------------- */

interface CardProps {
  data: OrnamentData;
  angle: number; // base angle (radians)
  radius: number;
  isSelected: boolean;
  onClick: () => void;
  wheelRotation: number; // current wheel rotation added to base angle
}

/**
 * Card - single ornament item, placed around wheel.
 * The card faces outward by rotating on Y using total angle.
 */
function Card({ data, angle, radius, isSelected, onClick, wheelRotation }: CardProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const texture = useTexture(data.texture);

  // make wrapping safe (if using repeat)
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const totalAngle = angle + wheelRotation;
  const x = Math.sin(totalAngle) * radius;
  const z = Math.cos(totalAngle) * radius;
  const rotationY = totalAngle + Math.PI; // face outward (rotate 180deg so front faces camera-side)

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Back plate */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.6, 2.6, 0.04]} />
        <meshStandardMaterial
          color={isSelected ? "#D4A574" : "#8B7355"}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Main card */}
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

      {/* HTML label */}
      <Html position={[0, -1.6, 0.12]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md border border-primary/30 whitespace-nowrap">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">ORN. {data.id}</span>
        </div>
      </Html>
    </group>
  );
}

/* ----------------------------- WHEEL COMPONENT -------------------------------- */

/**
 * WheelWithGear renders the wheel visuals.
 * Important: this component assumes it's a child of the pivotGroup that sits AT the pivot.
 * We shift the wheel left by -radius so pivot sits at the rightmost edge of the wheel.
 */
function WheelWithGear({
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

  const gearTeeth = 24;
  const gearInnerRadius = 1.2;
  const gearOuterRadius = 1.6;

  return (
    <group position={[-radius, 0, 0]}>
      {/* central rotating gear hub (visual) */}
      <group rotation={[Math.PI / 2, 0, rotation]}>
        <mesh>
          <cylinderGeometry args={[gearInnerRadius, gearInnerRadius, 0.4, 32]} />
          <meshStandardMaterial color="#4A3F35" metalness={0.7} roughness={0.3} />
        </mesh>

        {Array.from({ length: gearTeeth }).map((_, i) => {
          const t = (i / gearTeeth) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(t) * gearInnerRadius, 0, Math.sin(t) * gearInnerRadius]} rotation={[0, -t, 0]}>
              <boxGeometry args={[0.36, 0.35, 0.22]} />
              <meshStandardMaterial color="#5C4A3D" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* outer rings */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.08, 8, 64]} />
        <meshStandardMaterial color="#8B7355" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* rods that visually connect hub to cards */}
      {Array.from({ length: cardCount }).map((_, i) => {
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

      {/* cards placed around wheel */}
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

/* ----------------------------- DETAIL PANEL ---------------------------------- */

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
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
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

/* ----------------------------- LOADING FALLBACK ------------------------------ */

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

/* ----------------------------- SCENE COMPONENT --------------------------------
   Responsibilities:
   - Create pivotGroup at PIVOT_WORLD_X
   - Place WheelWithGear as child (wheel is shifted left inside)
   - Provide camera and orbit controls (camera orbit disabled)
   - Provide wheelRotation value (derived from pivotRef.rotation.y)
------------------------------------------------------------------------------ */

function Scene({
  selectedId,
  onSelect,
  isAutoPlaying,
  pointerHandlers,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isAutoPlaying: boolean;
  pointerHandlers: {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
  };
}) {
  const pivotRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<any>(null);

  // wheel rotation is derived from pivotRef.rotation.y (we'll expose it to WheelWithGear)
  // but we'll also keep a separate numeric to pass as prop (stable).
  const [wheelRotation, setWheelRotation] = useState(0);

  // syncing wheelRotation from pivot in render loop
  useFrame(() => {
    if (pivotRef.current) {
      // pivotRef.rotation.y is the world rotation applied by input/damping
      setWheelRotation(pivotRef.current.rotation.y);
    }
  });

  // on mount set orbit controls target to the pivot world coords
  useEffect(() => {
    if (controlsRef.current) {
      // target must be set in world coordinates
      controlsRef.current.target.set(PIVOT_WORLD_X, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <>
      <color attach="background" args={["#1a1510"]} />
      <fog attach="fog" args={["#1a1510", 12, 30]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#fff8e7" />

      {/* pivot group placed in world at X = PIVOT_WORLD_X */}
      <group ref={pivotRef} position={[PIVOT_WORLD_X, 0, 0]}>
        <WheelWithGear selectedId={selectedId} onSelect={onSelect} rotation={wheelRotation} />
      </group>

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0d0a08" metalness={0.2} roughness={0.9} />
      </mesh>

      {/* camera placed to the right — pivot will project near right edge */}
      <PerspectiveCamera makeDefault position={CAMERA_POS} fov={40} />

      {/* OrbitControls active but rotation disabled - still allow zoom */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableRotate={false} // IMPORTANT: camera rotation is locked
        enableZoom={true}
        minDistance={8}
        maxDistance={35}
      />

      <Environment preset="warehouse" background={false} />
    </>
  );
}

/* ----------------------------- MAIN PAGE / COMPONENT ------------------------- */

/**
 * FilmRollWheel main component:
 * - Handles pointer events on the Canvas to rotate the wheel pivot
 * - Applies inertia/damping so wheel movement feels natural
 */
export default function FilmRollWheel(): JSX.Element {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // pivotRef is inside Scene; we rotate it via a ref accessible here by storing the desired velocity
  // We'll NOT try to reach into Scene's refs. Instead, we'll keep a "rotationDelta" ref and
  // a "rotation accumulator" exposed to Scene through a shared object is more complex.
  //
  // Simpler: keep velocity & damping in this root and apply an invisible "controller" component that
  // sits inside Canvas and mutates pivotRef directly. But to keep file simple we will attach
  // pointer handling here and use a small inner component to mutate pivotRef.
  //
  // We'll implement PivotController component (below) to be rendered inside Canvas so it has access to
  // the Three scene and can find the pivot group by name.

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    if (id) setIsAutoPlaying(false);
  };

  // pointer state for dragging
  const isPointerDown = useRef(false);
  const lastClientX = useRef<number | null>(null);
  const wheelVelocity = useRef(0); // radians/frame (or small delta)
  const userControlActive = useRef(false); // if user interacted, pause auto-play

  // pointer handlers attached to Canvas element
  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    // prevent OrbitControls from capturing drag when we start dragging for wheel
    // stopPropagation might be needed on the event target inside the canvas
    isPointerDown.current = true;
    lastClientX.current = e.clientX;
    userControlActive.current = true;
  }, []);

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    isPointerDown.current = false;
    lastClientX.current = null;
  }, []);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isPointerDown.current || lastClientX.current == null) return;
    const dx = e.clientX - lastClientX.current;
    lastClientX.current = e.clientX;

    // horizontal movement -> wheel velocity (tweak sensitivity)
    const sensitivity = 0.0028;
    wheelVelocity.current += dx * sensitivity;
  }, []);

  // If auto-playing, we apply a slow automatic rotation when user not interacting.
  // PivotController will read these refs (wheelVelocity & isAutoPlaying) to rotate pivot.
  // PivotController is defined below and inserted into Canvas.

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none z-0" />

      {/* header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm z-20">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
            <h1 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">GRC Ornaments</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying((s) => !s)}
              className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all ${isAutoPlaying ? "bg-accent/20 border-accent text-accent" : "bg-primary/10 border-primary/30 text-foreground"}`}
            >
              <span className="text-xs md:text-sm font-medium uppercase tracking-wide">
                {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* detail panel */}
      <DetailPanel data={selectedId ? ornamentData.find((o) => o.id === selectedId) || null : null} onClose={() => setSelectedId(null)} />

      {/* small instruction */}
      {!selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="bg-background/80 backdrop-blur-md px-4 md:px-6 py-3 rounded-full border border-primary/30 shadow-lg">
            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Seret mouse horizontal untuk memutar roda — kamera tidak berputar.
            </p>
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            onPointerDown={(e) => {
              // mark pointer event as handled so OrbitControls won't pick up rotate if it was enabled
              e.stopPropagation();
              onPointerDown(e);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onPointerUp(e);
            }}
            onPointerMove={(e) => {
              // let this handler run first to update wheelVelocity
              onPointerMove(e);
              e.stopPropagation();
            }}
            // pixelRatio={Math.min(window.devicePixelRatio, 2)}
            camera={{ position: CAMERA_POS, fov: 40 }}
          >
            {/* PivotController will apply rotation to the pivot group */}
            <PivotController
              pivotName="RIGHT_PIVOT"
              wheelVelocityRef={wheelVelocity}
              isAutoPlayingRef={{ get: () => isAutoPlaying }}
              userControlActiveRef={userControlActive}
            />

            {/* Scene renders pivot group named RIGHT_PIVOT so PivotController can find it */}
            <Scene
              selectedId={selectedId}
              onSelect={handleSelect}
              isAutoPlaying={isAutoPlaying}
              pointerHandlers={{ onPointerDown: () => {}, onPointerMove: () => {}, onPointerUp: () => {} }}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   PivotController
   - A small in-scene component that finds the pivot group by name and applies
     rotation each frame using wheelVelocity and damping.
   - This sits inside the Canvas (so it runs in the same render loop).
------------------------------------------------------------------------------- */

function PivotController({
  pivotName,
  wheelVelocityRef,
  isAutoPlayingRef,
  userControlActiveRef,
}: {
  pivotName: string;
  wheelVelocityRef: React.MutableRefObject<number>;
  isAutoPlayingRef: { get: () => boolean };
  userControlActiveRef: React.MutableRefObject<boolean>;
}) {
  const pivotRef = useRef<THREE.Group | null>(null);

  // find pivot group by traversing scene once mounted
  useEffect(() => {
    // We will search for the group named pivotName in the scene root.
    // Note: In our Scene component above we DID NOT explicitly set name; let's set it here by searching
    // for the first group at the root whose position.x === PIVOT_WORLD_X (best-effort).
    // Simpler approach: we'll rely on a global query: scene.children find group with matching position.x
    // This is a best-effort because react-three-fiber doesn't expose a simple "getObjectByName" here without ref.
    // But we can access global `document`'s three scene via useFrame? We'll do a safe approach inside useFrame.

    // Nothing to do on mount — pivotRef will be assigned in useFrame on first run if null.
  }, [pivotName]);

  // apply rotation each frame
  useFrame((_state, delta) => {
    // ensure pivotRef points to the pivot group (one-time lookup)
    if (!pivotRef.current) {
      // try to find pivot group: root scene is available as _state.scene
      const scene = (_state as any).scene as THREE.Scene | undefined;
      if (scene) {
        // find group with x position approximately PIVOT_WORLD_X
        const found = scene.children.find((c) => {
          if (!("position" in c)) return false;
          // check for group & approximate match
          return Math.abs((c as any).position?.x - PIVOT_WORLD_X) < 0.001;
        }) as THREE.Group | undefined;

        if (found) {
          pivotRef.current = found;
          // set a name for easier future debugging
          pivotRef.current.name = pivotName;
        }
      }
    }

    if (!pivotRef.current) return;

    // read velocity
    let v = wheelVelocityRef.current;

    // if autoplay and user hasn't touched recently, apply small auto rotation
    if (isAutoPlayingRef.get() && !userControlActiveRef.current) {
      // small gentle rotation when autoplay is on
      v += 0.02 * delta;
    }

    // Apply rotation: subtract because screen X -> wheel rotation sign might need inversion
    pivotRef.current.rotation.y -= v;

    // damping
    wheelVelocityRef.current *= 0.92;

    // prevent runaway rotation growth by clamping velocity
    wheelVelocityRef.current = clamp(wheelVelocityRef.current, -2, 2);
  });

  return null;
}
