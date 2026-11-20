"use client";

/**
 * Original isometric miniature "relocation city" — built from primitives, no external models or HDR downloads.
 * Stations: workplace tower, stay (PG/apartment), food hub, commute (bus + metro), Wi-Fi, moving truck & boxes,
 * linked by white service pipes whose light pulses grow with scroll progress.
 */
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const C = {
  white: "#ffffff",
  pad: "#f3f7fb",
  padSide: "#e3ecf4",
  navy: "#17283a",
  navy2: "#2a3d52",
  blue: "#6879de",
  glass: "#b9c4f3",
  coral: "#f36a5b",
  sun: "#f6c653",
  mint: "#7cc9ad",
  mintDark: "#3fae8c",
  road: "#d5dfe9",
  box: "#e2b47a",
};

/** Screen-space (u right, v down) → isometric world (x, z) for a camera on the +x+z diagonal. */
const iso = (u: number, v: number, y = 0): [number, number, number] => [(u + v) / Math.SQRT2, y, (v - u) / Math.SQRT2];

type Station = "work" | "stay" | "food" | "commute" | "wifi" | "move";
const LABELS: Record<Station, [string, string]> = {
  work: ["Your workplace", "Everything is planned around this point"],
  stay: ["Find your stay", "PGs, flats & hostels near work"],
  food: ["Plan your meals", "Tiffins, messes & meal plans"],
  commute: ["Explore your commute", "Bus, metro, bike or cab — estimated"],
  wifi: ["Get connected", "Wi-Fi and daily essentials"],
  move: ["Move in", "Movers, checklist & first week"],
};

function Hoverable({ id, hovered, setHovered, children, position, labelY = 3 }: { id: Station; hovered: Station | null; setHovered: (s: Station | null) => void; children: ReactNode; position: [number, number, number]; labelY?: number }) {
  const g = useRef<THREE.Group>(null);
  const on = hovered === id;
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, position[1] + (on ? 0.25 : 0), 8, dt);
  });
  return (
    <group
      ref={g}
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = "";
      }}
    >
      {children}
      {on && (
        <Html position={[0, labelY, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-xl bg-white/95 px-3 py-2 text-left shadow-lift ring-1 ring-line">
            <p className="text-[13px] font-bold text-navy">{LABELS[id][0]}</p>
            <p className="text-[11px] text-muted">{LABELS[id][1]}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Pad({ size, color = C.pad, y = 0 }: { size: [number, number]; color?: string; y?: number }) {
  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[size[0], 0.5, size[1]]} radius={0.22} smoothness={3} position={[0, -0.25, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={C.padSide} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[size[0] - 0.12, 0.08, size[1] - 0.12]} radius={0.04} smoothness={2} position={[0, 0.01, 0]} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

function Office() {
  const floors = 8;
  return (
    <group>
      <Pad size={[3.6, 3.6]} />
      <RoundedBox args={[2, 0.3, 2]} radius={0.06} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.navy2} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[1.7, 5, 1.7]} radius={0.12} smoothness={3} position={[0, 2.85, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.white} roughness={0.45} />
      </RoundedBox>
      {Array.from({ length: floors }, (_, i) => (
        <group key={i} position={[0, 0.9 + i * 0.55, 0]}>
          <mesh position={[0.86, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.3, 1.4]} />
            <meshStandardMaterial color={C.glass} metalness={0.3} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.86]}>
            <boxGeometry args={[1.4, 0.3, 0.04]} />
            <meshStandardMaterial color={C.glass} metalness={0.3} roughness={0.15} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[1.2, 0.25, 1.2]} radius={0.05} position={[0, 5.45, 0]} castShadow>
        <meshStandardMaterial color={C.navy} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0.3, 5.9, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7]} />
        <meshStandardMaterial color={C.navy} />
      </mesh>
      <mesh position={[0.3, 6.28, -0.2]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={C.coral} emissive={C.coral} emissiveIntensity={0.6} />
      </mesh>
      {/* entrance canopy */}
      <RoundedBox args={[0.9, 0.08, 0.5]} radius={0.03} position={[0, 0.95, 1.05]} castShadow>
        <meshStandardMaterial color={C.blue} />
      </RoundedBox>
    </group>
  );
}

function Stay() {
  return (
    <group>
      <Pad size={[4.2, 3.6]} />
      {/* two blocks */}
      {[
        { x: -0.75, h: 2.6, w: 1.5 },
        { x: 0.85, h: 1.9, w: 1.4 },
      ].map((b, i) => (
        <group key={i} position={[b.x, 0, -0.2]}>
          <RoundedBox args={[b.w, b.h, 1.8]} radius={0.1} smoothness={3} position={[0, b.h / 2 + 0.05, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={C.white} roughness={0.55} />
          </RoundedBox>
          <RoundedBox args={[b.w + 0.16, 0.14, 1.96]} radius={0.05} position={[0, b.h + 0.12, 0]} castShadow>
            <meshStandardMaterial color={C.coral} roughness={0.5} />
          </RoundedBox>
          {/* windows on +z face */}
          {Array.from({ length: Math.floor(b.h / 0.6) }, (_, r) =>
            [-0.35, 0.35].map((wx) => (
              <mesh key={`${r}${wx}`} position={[wx * (b.w / 1.5), 0.55 + r * 0.6, 0.91]}>
                <boxGeometry args={[0.3, 0.3, 0.03]} />
                <meshStandardMaterial color={r % 2 ? C.glass : C.sun} emissive={r % 2 ? "#000" : C.sun} emissiveIntensity={r % 2 ? 0 : 0.25} />
              </mesh>
            )),
          )}
          {/* balconies on +x face */}
          {Array.from({ length: Math.floor(b.h / 0.6) }, (_, r) => (
            <mesh key={r} position={[b.w / 2 + 0.1, 0.42 + r * 0.6, 0.2]} castShadow>
              <boxGeometry args={[0.2, 0.06, 0.8]} />
              <meshStandardMaterial color={C.navy2} />
            </mesh>
          ))}
        </group>
      ))}
      {/* door */}
      <mesh position={[0.85, 0.35, 0.72]}>
        <boxGeometry args={[0.4, 0.6, 0.04]} />
        <meshStandardMaterial color={C.navy} />
      </mesh>
    </group>
  );
}

function Food() {
  return (
    <group>
      <Pad size={[3.4, 3]} />
      <RoundedBox args={[2, 1.4, 1.5]} radius={0.1} position={[-0.2, 0.75, -0.4]} castShadow receiveShadow>
        <meshStandardMaterial color={C.sun} roughness={0.6} />
      </RoundedBox>
      {/* striped awning */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.95 + i * 0.3, 1.38, 0.5]} rotation={[0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.06, 0.55]} />
          <meshStandardMaterial color={i % 2 ? C.white : C.coral} />
        </mesh>
      ))}
      {/* sign: bowl */}
      <mesh position={[-0.2, 1.62, -0.4]} rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[0.36, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.white} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, 1.62, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 24]} />
        <meshStandardMaterial color={C.coral} />
      </mesh>
      {/* table + stools */}
      <group position={[0.9, 0, 0.7]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 24]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44]} />
          <meshStandardMaterial color={C.navy2} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
            <meshStandardMaterial color={C.blue} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Bus() {
  return (
    <group>
      <RoundedBox args={[2.2, 0.8, 0.9]} radius={0.16} smoothness={3} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color={C.blue} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0.1, 0.72, 0.452]}>
        <boxGeometry args={[1.8, 0.26, 0.02]} />
        <meshStandardMaterial color={C.navy} roughness={0.2} />
      </mesh>
      <mesh position={[1.1, 0.72, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.7]} />
        <meshStandardMaterial color={C.navy} roughness={0.2} />
      </mesh>
      {[-0.65, 0.65].map((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.1, 16]} />
            <meshStandardMaterial color={C.navy} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Commute() {
  return (
    <group>
      <Pad size={[5.2, 3]} />
      {/* road */}
      <mesh position={[0, 0.07, 0.55]} receiveShadow>
        <boxGeometry args={[5, 0.02, 1.3]} />
        <meshStandardMaterial color={C.road} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-2.1 + i * 0.85, 0.085, 0.55]}>
          <boxGeometry args={[0.4, 0.01, 0.07]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
      ))}
      <group position={[0.9, 0.05, 0.3]} scale={0.75}>
        <Bus />
      </group>
      {/* bus stop shelter */}
      <group position={[1.5, 0, -0.35]}>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, 0.45, 0]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color={C.navy2} />
          </mesh>
        ))}
        <RoundedBox args={[1.2, 0.08, 0.6]} radius={0.03} position={[0, 0.94, 0]} castShadow>
          <meshStandardMaterial color={C.coral} />
        </RoundedBox>
        <mesh position={[0, 0.5, -0.25]}>
          <boxGeometry args={[0.9, 0.6, 0.03]} />
          <meshStandardMaterial color={C.glass} transparent opacity={0.6} />
        </mesh>
      </group>
      {/* elevated metro */}
      <group position={[0, 0, -1.1]}>
        {[-2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]} castShadow>
            <boxGeometry args={[0.18, 1.4, 0.18]} />
            <meshStandardMaterial color={C.white} />
          </mesh>
        ))}
        <RoundedBox args={[5, 0.16, 0.5]} radius={0.05} position={[0, 1.45, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={C.padSide} />
        </RoundedBox>
        <RoundedBox args={[1.9, 0.5, 0.42]} radius={0.14} smoothness={3} position={[-1, 1.8, 0]} castShadow>
          <meshStandardMaterial color={C.white} />
        </RoundedBox>
        <mesh position={[-1, 1.84, 0.215]}>
          <boxGeometry args={[1.6, 0.14, 0.01]} />
          <meshStandardMaterial color={C.coral} />
        </mesh>
      </group>
    </group>
  );
}

function Wifi({ tRef }: { tRef: React.RefObject<number> }) {
  const arcs = useRef<THREE.Group>(null);
  useFrame(() => {
    arcs.current?.children.forEach((m, i) => {
      const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.25 + 0.5 * Math.max(0, Math.sin(tRef.current * 2.4 - i * 0.9));
    });
  });
  return (
    <group>
      <Pad size={[2.2, 2.2]} />
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2]} />
        <meshStandardMaterial color={C.navy2} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={0.6} />
      </mesh>
      <group ref={arcs} position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        {[0.32, 0.55, 0.78].map((r) => (
          <mesh key={r} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[r, 0.045, 10, 32, Math.PI / 2]} />
            <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Boxes() {
  return (
    <group>
      {[
        [0, 0.22, 0, 0.45],
        [0.5, 0.17, 0.1, 0.34],
        [0.15, 0.6, 0.05, 0.32],
      ].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]}>
          <RoundedBox args={[s, s, s]} radius={0.03} castShadow>
            <meshStandardMaterial color={C.box} roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, s / 2 + 0.002, 0]}>
            <boxGeometry args={[s * 0.18, 0.004, s + 0.004]} />
            <meshStandardMaterial color="#c9955a" />
          </mesh>
        </group>
      ))}
      {/* suitcase */}
      <group position={[-0.55, 0, 0.15]}>
        <RoundedBox args={[0.42, 0.62, 0.22]} radius={0.06} position={[0, 0.33, 0]} castShadow>
          <meshStandardMaterial color={C.navy} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.72, 0]}>
          <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color={C.navy2} />
        </mesh>
        <mesh position={[0, 0.33, 0.115]}>
          <boxGeometry args={[0.42, 0.06, 0.01]} />
          <meshStandardMaterial color={C.sun} />
        </mesh>
      </group>
    </group>
  );
}

function Truck() {
  return (
    <group>
      <RoundedBox args={[1.25, 0.8, 0.72]} radius={0.06} position={[-0.25, 0.58, 0]} castShadow>
        <meshStandardMaterial color={C.white} roughness={0.5} />
      </RoundedBox>
      <mesh position={[-0.25, 0.62, 0.365]}>
        <boxGeometry args={[0.9, 0.18, 0.01]} />
        <meshStandardMaterial color={C.blue} />
      </mesh>
      <RoundedBox args={[0.5, 0.55, 0.7]} radius={0.08} position={[0.66, 0.45, 0]} castShadow>
        <meshStandardMaterial color={C.coral} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0.92, 0.55, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.55]} />
        <meshStandardMaterial color={C.navy} />
      </mesh>
      {[-0.6, 0.1, 0.65].map((x) =>
        [-0.36, 0.36].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.15, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 14]} />
            <meshStandardMaterial color={C.navy} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Tree({ round = false, s = 1 }: { round?: boolean; s?: number }) {
  return (
    <group scale={s}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.5]} />
        <meshStandardMaterial color="#b98a5e" />
      </mesh>
      <mesh position={[0, round ? 0.75 : 0.85, 0]} castShadow>
        {round ? <sphereGeometry args={[0.38, 16, 12]} /> : <coneGeometry args={[0.36, 1, 12]} />}
        <meshStandardMaterial color={round ? C.mint : C.mintDark} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pin({ color = C.coral, tRef, phase = 0, reduced }: { color?: string; tRef: React.RefObject<number>; phase?: number; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current && !reduced) g.current.position.y = Math.sin(tRef.current * 1.6 + phase) * 0.12;
  });
  return (
    <group>
      <group ref={g}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 16]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.24, 0.5, 24]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
      </group>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/** Service pipes between stations, with light pulses that brighten as the user scrolls. */
function Pipes({ paths, progressRef, tRef, reduced }: { paths: [number, number, number][][]; progressRef: React.RefObject<number>; tRef: React.RefObject<number>; reduced: boolean }) {
  const curves = useMemo(() => paths.map((p) => new THREE.CatmullRomCurve3(p.map((v) => new THREE.Vector3(...v)), false, "catmullrom", 0.08)), [paths]);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const PER = 3;
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const m = pulses.current;
    if (!m) return;
    curves.forEach((c, ci) => {
      for (let k = 0; k < PER; k++) {
        const u = reduced ? (k + 0.5) / PER : (tRef.current * 0.12 + k / PER + ci * 0.17) % 1;
        tmp.position.copy(c.getPointAt(u));
        tmp.scale.setScalar(0.6 + progressRef.current * 0.6);
        tmp.updateMatrix();
        m.setMatrixAt(ci * PER + k, tmp.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
    if (mat.current) mat.current.emissiveIntensity = 0.4 + progressRef.current * 1.6;
  });
  return (
    <group>
      {curves.map((c, i) => (
        <group key={i}>
          <mesh castShadow receiveShadow>
            <tubeGeometry args={[c, 48, 0.11, 10, false]} />
            <meshStandardMaterial color={C.white} roughness={0.35} />
          </mesh>
          {[0, 1].map((e) => (
            <mesh key={e} position={c.getPoint(e)} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.18, 16]} />
              <meshStandardMaterial color={C.padSide} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={pulses} args={[undefined, undefined, curves.length * PER]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial ref={mat} color={C.blue} emissive={C.blue} emissiveIntensity={0.6} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

const P = {
  work: iso(-4.6, -2.6),
  stay: iso(0.6, -0.4),
  food: iso(5, 1.2),
  commute: iso(-2.2, 3.4),
  wifi: iso(3.8, -4),
  move: iso(-6.2, 1.4),
};
const at = (k: keyof typeof P, du = 0, dv = 0, y = 0.12): [number, number, number] => {
  const [x, , z] = P[k];
  const [ox, , oz] = iso(du, dv);
  return [x + ox, y, z + oz];
};
const PIPES: [number, number, number][][] = [
  [at("work", 1.6, 0.6), [P.work[0] + 2.3, 0.12, P.work[2] + 0.4], at("stay", -2, -0.2)],
  [at("stay", 2, 0.4), at("food", -1.6, -0.4)],
  [at("stay", 0.8, -1.6), [P.wifi[0] - 0.6, 0.12, P.wifi[2] + 1.6], at("wifi", -0.4, 1)],
  [at("stay", -0.8, 1.7), at("commute", 1.4, -1.4)],
  [at("commute", -2.4, -0.4), at("move", 1, 0.2)],
];

function Rig({ progressRef, pointerRef, tRef, reduced }: { progressRef: React.RefObject<number>; pointerRef: React.RefObject<{ x: number; y: number }>; tRef: React.RefObject<number>; reduced: boolean }) {
  const look = useMemo(() => new THREE.Vector3(0.4, 0.8, 0), []);
  const s = useRef({ az: 0, el: 0, z: 1 });
  useFrame(({ camera, size, invalidate }, dt) => {
    tRef.current += reduced ? 0 : dt;
    const p = progressRef.current;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    s.current.az += (Math.PI / 4 + pointerRef.current.x * 0.08 + p * 0.32 - s.current.az) * k;
    s.current.el += (0.62 - pointerRef.current.y * 0.04 - p * 0.12 - s.current.el) * k;
    s.current.z += (1 + p * 0.28 - s.current.z) * k;
    const r = 40;
    camera.position.set(look.x + r * Math.cos(s.current.el) * Math.sin(s.current.az), look.y + r * Math.sin(s.current.el), look.z + r * Math.cos(s.current.el) * Math.cos(s.current.az));
    camera.lookAt(look);
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = (Math.min(size.width / 18, size.height / 14.5)) * s.current.z;
    ortho.updateProjectionMatrix();
    if (reduced) invalidate();
  });
  return null;
}

export default function CityScene({ active, reduced, onReady }: { active: boolean; reduced: boolean; onReady?: () => void }) {
  const [hovered, setHovered] = useState<Station | null>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const tRef = useRef(0);
  const truckRef = useRef<THREE.Group>(null);
  const road = useMemo(() => {
    const [x, , z] = P.commute;
    return [new THREE.Vector3(x - 2.1, 0.06, z + 0.92), new THREE.Vector3(x + 2.1, 0.06, z + 0.92)] as const;
  }, []);

  return (
    <Canvas
      orthographic
      shadows="soft"
      dpr={[1, 1.75]}
      frameloop={active ? (reduced ? "demand" : "always") : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [20, 16, 20], zoom: 40, near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        requestAnimationFrame(() => onReady?.());
      }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        pointerRef.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
      }}
      onPointerLeave={() => (pointerRef.current = { x: 0, y: 0 })}
      aria-hidden
    >
      <ScrollProgress progressRef={progressRef} />
      <Rig progressRef={progressRef} pointerRef={pointerRef} tRef={tRef} reduced={reduced} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#cfdcea", 0.6]} />
      <directionalLight
        position={[-8, 18, 10]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <Environment resolution={64}>
        <Lightformer intensity={1.6} position={[0, 6, 8]} scale={[12, 6, 1]} />
        <Lightformer intensity={0.8} position={[-8, 4, -4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
      </Environment>

      <group position={[0, 0, 0]}>
        <Hoverable id="work" hovered={hovered} setHovered={setHovered} position={P.work} labelY={6.6}>
          <Office />
          <group position={[1.1, 6.3, 1.1]} scale={0.9}>
            <Pin color={C.blue} tRef={tRef} reduced={reduced} />
          </group>
          <group position={[-1.2, 0.05, 1.2]}>
            <Tree round />
          </group>
        </Hoverable>
        <Hoverable id="stay" hovered={hovered} setHovered={setHovered} position={P.stay} labelY={4.4}>
          <Stay />
          <group position={[-0.75, 3.1, -0.2]}>
            <Pin tRef={tRef} phase={1.3} reduced={reduced} />
          </group>
          {[[-1.7, 1.3], [1.75, -1.4]].map(([x, z], i) => (
            <group key={i} position={[x, 0.05, z]}>
              <Tree round={i === 0} s={0.85} />
            </group>
          ))}
        </Hoverable>
        <Hoverable id="food" hovered={hovered} setHovered={setHovered} position={P.food} labelY={2.8}>
          <Food />
        </Hoverable>
        <Hoverable id="commute" hovered={hovered} setHovered={setHovered} position={P.commute} labelY={3}>
          <Commute />
        </Hoverable>
        <Hoverable id="wifi" hovered={hovered} setHovered={setHovered} position={P.wifi} labelY={3.2}>
          <Wifi tRef={tRef} />
        </Hoverable>
        <Hoverable id="move" hovered={hovered} setHovered={setHovered} position={P.move} labelY={2.4}>
          <Pad size={[3, 2.6]} />
          <group position={[0.2, 0.05, 0.1]}>
            <Boxes />
          </group>
          <group position={[-0.9, 0.05, -0.8]}>
            <Tree s={0.9} />
          </group>
        </Hoverable>
        <TruckOnRoad truckRef={truckRef} road={road} tRef={tRef} reduced={reduced} />
        <Pipes paths={PIPES} progressRef={progressRef} tRef={tRef} reduced={reduced} />
        {/* scattered trees on the ground plane */}
        {[iso(-1.8, -4.4), iso(7.2, -1.6), iso(2.6, 4.6), iso(-7.4, -1.4), iso(6.4, 3.8)].map((p, i) => (
          <group key={i} position={p}>
            <Tree round={i % 2 === 0} s={0.8} />
          </group>
        ))}
        {/* floating accent cubes, echoing the reference's playful props */}
        <Floaty position={[...iso(7.4, -4.6, 2.6)] as [number, number, number]} color={C.sun} tRef={tRef} reduced={reduced} />
        <Floaty position={[...iso(-7.6, 3.8, 1.6)] as [number, number, number]} color={C.coral} tRef={tRef} reduced={reduced} phase={2} cone />
      </group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.1} />
      </mesh>
    </Canvas>
  );
}

function ScrollProgress({ progressRef }: { progressRef: React.RefObject<number> }) {
  useFrame(() => {
    progressRef.current = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
  });
  return null;
}

function TruckOnRoad({ truckRef, road, tRef, reduced }: { truckRef: React.RefObject<THREE.Group | null>; road: readonly [THREE.Vector3, THREE.Vector3]; tRef: React.RefObject<number>; reduced: boolean }) {
  useFrame(() => {
    const g = truckRef.current;
    if (!g) return;
    // One-way loop along the lane; the truck scales in/out at the road ends instead of popping.
    const u = reduced ? 0.35 : (tRef.current * 0.09) % 1;
    g.position.lerpVectors(road[0], road[1], u);
    g.scale.setScalar(0.6 * Math.min(1, u * 10, (1 - u) * 10));
  });
  return (
    <group ref={truckRef}>
      <Truck />
    </group>
  );
}

function Floaty({ position, color, tRef, reduced, phase = 0, cone = false }: { position: [number, number, number]; color: string; tRef: React.RefObject<number>; reduced: boolean; phase?: number; cone?: boolean }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!m.current || reduced) return;
    m.current.position.y = position[1] + Math.sin(tRef.current * 1.1 + phase) * 0.2;
    m.current.rotation.y = tRef.current * 0.3 + phase;
  });
  return (
    <mesh ref={m} position={position} castShadow>
      {cone ? <coneGeometry args={[0.45, 0.6, 3]} /> : <boxGeometry args={[0.6, 0.6, 0.6]} />}
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}
