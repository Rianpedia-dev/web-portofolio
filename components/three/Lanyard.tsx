/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

const cardGLB = '/assets/lanyard/card.glb';
const lanyardPng = '/assets/lanyard/lanyard.png';
const profileAvif = '/profile.avif';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: Omit<ThreeElement<typeof MeshLineMaterial>, 'args'> & { args?: [any] };
  }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  className?: string;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = profileAvif,
  backImage = profileAvif,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1.5,
  className = "w-full h-screen"
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative z-0 flex justify-center items-center transform scale-100 origin-center ${className}`}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.25 : 1.5]}
        gl={{
          alpha: transparent,
          antialias: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          // Handle WebGL context loss gracefully
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault(); // allow context to be restored
          });
        }}
      >
        <ambientLight intensity={isMobile ? Math.PI * 0.8 : Math.PI} />
        {isMobile && <directionalLight position={[5, 5, 5]} intensity={Math.PI * 0.5} />}
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
            />
          </Physics>
          {!isMobile && (
            <Environment blur={0.75}>
              <Lightformer
                intensity={2}
                color="white"
                position={[0, -1, 5]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={3}
                color="white"
                position={[-1, -1, 1]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={3}
                color="white"
                position={[1, 1, 1]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={10}
                color="white"
                position={[-10, 0, 14]}
                rotation={[0, Math.PI / 2, Math.PI / 3]}
                scale={[100, 10, 1]}
              />
            </Environment>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = profileAvif,
  backImage = profileAvif,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: BandProps) {
  const { viewport } = useThree();
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    const t = body.translation();
    if (!body.lerped) {
      if (t && !isNaN(t.x) && !isNaN(t.y) && !isNaN(t.z)) {
        body.lerped = new THREE.Vector3(t.x, t.y, t.z);
      } else {
        body.lerped = new THREE.Vector3(0, 0, 0);
      }
    } else if (t && !isNaN(t.x) && !isNaN(t.y) && !isNaN(t.z) && (isNaN(body.lerped.x) || isNaN(body.lerped.y) || isNaN(body.lerped.z))) {
      body.lerped.set(t.x, t.y, t.z);
    }
    return body.lerped;
  };

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const defaultTexture = useTexture(lanyardImage || lanyardPng);

  const [customTexture, setCustomTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Red background (modern sleek crimson/rose)
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Black text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 78px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const text = 'Jemi Arian — Rianpedia';
    // Draw exactly once in the center of the 1024px canvas
    ctx.fillText(text, 512, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;

    setCustomTexture(tex);

    return () => {
      tex.dispose();
    };
  }, []);

  const texture = lanyardImage ? defaultTexture : (customTexture || defaultTexture);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image as any;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: any, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.2]);
  const anchorY = isMobile ? 3.05 : 2.37;
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, anchorY, -0.05]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      const t = -state.camera.position.z / dir.z;
      vec.copy(state.camera.position).addScaledVector(dir, t);
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }

    if (
      fixed.current &&
      j1.current &&
      j2.current &&
      j3.current &&
      card.current &&
      band.current?.geometry
    ) {
      try {
        const tFixed = fixed.current.translation();
        const tJ1 = j1.current.translation();
        const tJ2 = j2.current.translation();
        const tJ3 = j3.current.translation();
        const tCard = card.current.translation();

        // Prevent NaN calculations
        if (
          !tFixed || isNaN(tFixed.x) || isNaN(tFixed.y) || isNaN(tFixed.z) ||
          !tJ1 || isNaN(tJ1.x) || isNaN(tJ1.y) || isNaN(tJ1.z) ||
          !tJ2 || isNaN(tJ2.x) || isNaN(tJ2.y) || isNaN(tJ2.z) ||
          !tJ3 || isNaN(tJ3.x) || isNaN(tJ3.y) || isNaN(tJ3.z) ||
          !tCard || isNaN(tCard.x) || isNaN(tCard.y) || isNaN(tCard.z)
        ) {
          return;
        }

        [j1, j2].forEach(ref => {
          const lerped = getLerped(ref.current);
          const currentTranslation = ref.current.translation();
          const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(currentTranslation)));
          lerped.lerp(currentTranslation, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
        });

        curve.points[0].copy(tJ3);
        curve.points[1].copy(getLerped(j2.current));
        curve.points[2].copy(getLerped(j1.current));
        curve.points[3].copy(tFixed);

        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
      } catch (e) {
        console.warn("Skipped physics update due to initialization delay:", e);
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // Hitung posisi gantung secara dinamis dari atas layar dan di kiri untuk desktop
  const groupX = isMobile ? 0 : -viewport.width / 3.2;
  const groupY = isMobile ? (viewport.height / 2 + 1.2) : (viewport.height / 2 - 0.2);

  return (
    <>
      <group>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[groupX, groupY, 0]} />
        <RigidBody position={[groupX + 0.02, groupY - 0.1, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[groupX + 0.04, groupY - 0.2, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[groupX + 0.06, groupY - 0.3, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[groupX + 0.06, groupY - 2.35, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={isMobile ? [1.7, 2.4, 0.01] : [1.32, 1.87, 0.01]} />
          <group
            scale={isMobile ? 4.85 : 3.75}
            position={[0, isMobile ? -2.62 : -2.02, -0.05]}
            onPointerOver={(e) => {
              e.stopPropagation();
              hover(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              hover(false);
            }}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#ffffff"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={texture}
          repeat={lanyardImage ? [-3, 1] : [-1.5, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
