import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Custom Shader for the Octopus
const OctopusShaderMaterial = {
    vertexShader: `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Gentle floating animation
      float floatWave = sin(uTime * 1.2 + pos.y * 1.5) * 0.08;
      pos.z += floatWave * 0.3;
      
      // Subtle tentacle movement at the bottom
      float tentacleMask = smoothstep(0.6, 0.0, vUv.y);
      float tentacleWave = sin(uTime * 2.0 + pos.x * 4.0) * 0.15;
      pos.x += tentacleWave * tentacleMask;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      if (color.a < 0.1) discard;
      gl_FragColor = color;
    }
  `
};

// Global mouse position store
const mouseStore = { x: 0, y: 0 };

const OctopusMesh = ({ imagePath }: { imagePath: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useTexture(imagePath);

    // Store smooth position
    const smoothPos = useRef({ x: 0, y: 0 });

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uTexture: { value: texture },
        },
        vertexShader: OctopusShaderMaterial.vertexShader,
        fragmentShader: OctopusShaderMaterial.fragmentShader,
        transparent: true,
    }), [texture]);

    useFrame(() => {
        if (!meshRef.current) return;

        const material = meshRef.current.material as THREE.ShaderMaterial;
        const time = performance.now() / 1000;
        material.uniforms.uTime.value = time;

        // Use global mouse position
        const mouseX = mouseStore.x;
        const mouseY = mouseStore.y;

        // Target position (full screen range)
        const targetX = mouseX * 4.0;
        const targetY = mouseY * 3.0;

        // Smooth interpolation (slower for smoother movement)
        smoothPos.current.x += (targetX - smoothPos.current.x) * 0.025;
        smoothPos.current.y += (targetY - smoothPos.current.y) * 0.025;

        // Apply position directly
        meshRef.current.position.x = smoothPos.current.x;
        meshRef.current.position.y = smoothPos.current.y;

        // Add gentle floating
        meshRef.current.position.y += Math.sin(time * 1.0) * 0.02;

        // Very subtle rotation (minimal)
        meshRef.current.rotation.y = smoothPos.current.x * 0.05;
        meshRef.current.rotation.z = -smoothPos.current.x * 0.02;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
            <planeGeometry args={[3.5, 3.5, 24, 24]} />
            <shaderMaterial args={[shaderArgs]} />
        </mesh>
    );
};

interface InteractiveOctopusProps {
    imagePath: string;
    isInteractive?: boolean;
    className?: string;
}

export default function InteractiveOctopus({
    imagePath,
    isInteractive = true,
    className = ""
}: InteractiveOctopusProps) {
    // Track global mouse and touch position
    useEffect(() => {
        if (!isInteractive) {
            mouseStore.x = 0;
            mouseStore.y = 0;
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            // Convert to normalized coordinates (-1 to 1)
            mouseStore.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseStore.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                mouseStore.x = (touch.clientX / window.innerWidth) * 2 - 1;
                mouseStore.y = -((touch.clientY / window.innerHeight) * 2 - 1);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
            // Reset position on cleanup
            mouseStore.x = 0;
            mouseStore.y = 0;
        };
    }, [isInteractive]);

    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
            >
                <ambientLight intensity={1} />
                <Suspense fallback={null}>
                    <OctopusMesh imagePath={imagePath} />
                </Suspense>
            </Canvas>
        </div>
    );
}
