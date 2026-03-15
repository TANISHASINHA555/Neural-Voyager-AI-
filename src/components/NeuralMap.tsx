import React, { useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, PerspectiveCamera, OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationParams } from '../types';

function NeuralParticles({ params }: { params?: SimulationParams }) {
  const ref = useRef<THREE.Points>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  
  const intensity = params?.intensity || 0.5;
  const color = params?.primaryColor || "#00f2ff";
  const activityType = params?.activityType || "static";

  const { particles, connections } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const connectionIndices: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const lobe = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      const r = 2 + Math.random() * 0.5;
      const x = lobe * (r * Math.sin(phi) * Math.cos(theta) * 0.8 + lobe * 1.2);
      const y = r * Math.sin(phi) * Math.sin(theta) * 1.2;
      const z = r * Math.cos(phi) * 0.8;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Create connections for some particles
      if (i > 0 && Math.random() > 0.95) {
        connectionIndices.push(i - 1, i);
      }
      if (i > 10 && Math.random() > 0.98) {
        connectionIndices.push(i - 10, i);
      }
    }
    
    const connectionPositions = new Float32Array(connectionIndices.length * 3);
    for (let i = 0; i < connectionIndices.length; i++) {
      const idx = connectionIndices[i];
      connectionPositions[i * 3] = positions[idx * 3];
      connectionPositions[i * 3 + 1] = positions[idx * 3 + 1];
      connectionPositions[i * 3 + 2] = positions[idx * 3 + 2];
    }

    return { particles: positions, connections: connectionPositions };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const rotationSpeed = t * (0.05 + intensity * 0.1);
    ref.current.rotation.y = rotationSpeed;
    lineRef.current.rotation.y = rotationSpeed;
    
    if (activityType === "burst") {
      const s = 1 + Math.sin(t * 10) * 0.05 * intensity;
      ref.current.scale.setScalar(s);
      lineRef.current.scale.setScalar(s);
    } else if (activityType === "pulse") {
      const s = 1 + Math.sin(t * 2) * 0.1 * intensity;
      ref.current.scale.setScalar(s);
      lineRef.current.scale.setScalar(s);
    } else if (activityType === "flow") {
      ref.current.rotation.z = t * 0.1 * intensity;
      lineRef.current.rotation.z = t * 0.1 * intensity;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.04 * intensity}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.2 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function RegionLabel({ position, text, isPrimary, visible }: { position: THREE.Vector3, text: string, isPrimary?: boolean, visible: boolean }) {
  if (!visible) return null;
  return (
    <Html position={position} center distanceFactor={10}>
      <div className={`px-2 py-1 rounded border whitespace-nowrap pointer-events-none transition-all duration-500 animate-in fade-in zoom-in ${
        isPrimary 
          ? 'bg-neon-teal/20 border-neon-teal text-neon-teal text-[10px] font-bold shadow-[0_0_10px_rgba(0,242,255,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 text-[8px]'
      }`}>
        <div className="flex items-center gap-1">
          {isPrimary && <div className="w-1 h-1 bg-neon-teal rounded-full animate-pulse" />}
          {text}
        </div>
      </div>
    </Html>
  );
}

function NeuralArrow({ targetPosition, color }: { targetPosition: THREE.Vector3, color: string }) {
  const ref = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.position.y = targetPosition.y + 1.5 + Math.sin(t * 4) * 0.2;
  });

  return (
    <group ref={ref} position={[targetPosition.x, targetPosition.y + 1.5, targetPosition.z]}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function NeuralNode({ position, text, isPrimary, color }: { position: THREE.Vector3, text: string, isPrimary?: boolean, color: string }) {
  const [showLabel, setShowLabel] = React.useState(false);
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const scale = isPrimary ? 1.2 : 0.8;
      ref.current.scale.setScalar(scale + Math.sin(t * 4) * 0.1);
      // @ts-ignore
      ref.current.material.opacity = (showLabel ? 0.8 : 0.4) + Math.sin(t * 4) * 0.1;
    }
  });

  return (
    <group>
      <Sphere 
        ref={ref} 
        args={[isPrimary ? 0.3 : 0.2, 32, 32]} 
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          setShowLabel(!showLabel);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </Sphere>
      
      <RegionLabel 
        position={new THREE.Vector3(position.x, position.y + (isPrimary ? 0.6 : 0.4), position.z)} 
        text={text} 
        isPrimary={isPrimary} 
        visible={showLabel}
      />
    </group>
  );
}

function FocusHighlight({ params }: { params?: SimulationParams }) {
  const { position, nearby } = useMemo(() => {
    if (!params?.focusRegion) return { position: new THREE.Vector3(0, 0, 0), nearby: [] };
    const region = params.focusRegion.toLowerCase();
    const pos = new THREE.Vector3(0, 0, 0);
    
    if (region.includes('left')) pos.x = -1.5;
    if (region.includes('right')) pos.x = 1.5;
    if (region.includes('front') || region.includes('prefrontal')) pos.z = 1.5;
    if (region.includes('back') || region.includes('occipital')) pos.z = -1.5;
    if (region.includes('top') || region.includes('parietal')) pos.y = 1.5;
    if (region.includes('bottom') || region.includes('temporal')) pos.y = -1.5;
    
    const nearbyLabels = (params.nearbyRegions || []).map((name, i) => {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ).add(pos);
      return { name, pos: offset };
    });

    return { position: pos, nearby: nearbyLabels };
  }, [params?.focusRegion, params?.nearbyRegions]);

  if (!params) return null;

  return (
    <group>
      <NeuralArrow targetPosition={position} color={params.primaryColor} />
      
      <NeuralNode 
        position={position} 
        text={params.focusRegion} 
        isPrimary 
        color={params.primaryColor} 
      />
      
      {nearby.map((n, i) => (
        <NeuralNode 
          key={i} 
          position={n.pos} 
          text={n.name} 
          color="#888888" 
        />
      ))}
    </group>
  );
}

function CameraController({ params }: { params?: SimulationParams }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (params?.cameraPosition) {
      const [x, y, z] = params.cameraPosition;
      camera.position.lerp(new THREE.Vector3(x, y, z), 0.1);
    }
  }, [params, camera]);

  return null;
}

export default function NeuralMap({ params, className = "h-full", hideUI = false }: { params?: SimulationParams, className?: string, hideUI?: boolean }) {
  return (
    <div className={`w-full bg-black/20 rounded-2xl overflow-hidden border border-white/5 relative group ${className}`}>
      {!hideUI && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-neon-teal/10 border border-neon-teal/30 px-2 py-1 rounded backdrop-blur-sm">
            <span className="text-[10px] font-bold text-neon-teal tracking-[0.2em] uppercase block">
              {params?.focusRegion || "Tactical_Neural_Map"}
            </span>
            <span className="text-[7px] text-neon-teal/60 font-mono uppercase">
              {params?.activityType ? `Activity_Mode: ${params.activityType}` : "Interactive_3D_Simulation"}
            </span>
          </div>
        </div>
      )}
      
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <NeuralParticles params={params} />
        <FocusHighlight params={params} />
        <CameraController params={params} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={!params}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {!hideUI && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1 h-3 bg-neon-teal/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="w-full bg-neon-teal"
                    animate={{ height: params ? [`${20 * (params.intensity)}%`, '100%', '40%'] : ['20%', '100%', '40%'] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                </div>
              ))}
            </div>
            <span className="text-[6px] text-neon-teal font-mono uppercase">
              {params ? "SIMULATION_ACTIVE" : "Scanning..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
