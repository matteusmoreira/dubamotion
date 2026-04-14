import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
      if (color.a < 0.02) discard;
      gl_FragColor = color;
    }
  `
};

// WebGL Background Sea Shader
const SeaShaderMaterial = {
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
      vec2 uv = vUv * 3.0; // scale
      uv += uMouse * 0.5; // react to mouse
      
      vec2 q = vec2(0.);
      q.x = fbm(uv + 0.00 * uTime);
      q.y = fbm(uv + vec2(1.0));

      vec2 r = vec2(0.);
      r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
      r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

      float f = fbm(uv + r);

      // Colors matching the dark portal/sea reference but deep and fluid
      vec3 color = mix(vec3(0.04, 0.01, 0.08), vec3(0.18, 0.05, 0.35), clamp((f*f)*4.0, 0.0, 1.0));
      color = mix(color, vec3(0.05, 0.02, 0.20), clamp(length(q), 0.0, 1.0));
      color = mix(color, vec3(0.02, 0.0, 0.05), clamp(length(r.x), 0.0, 1.0) * 0.6);

      // Vignette effect to focus on center
      float d = distance(vUv, vec2(0.5));
      color *= smoothstep(0.85, 0.15, d);

      gl_FragColor = vec4(color, 1.0);
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
        meshRef.current.position.y = smoothPos.current.y * 0.5;

        // Add gentle floating
        meshRef.current.position.y += Math.sin(time * 0.8) * 0.3;

        // Very subtle rotation (minimal)
        meshRef.current.rotation.y = smoothPos.current.x * 0.05;
        meshRef.current.rotation.z = -smoothPos.current.x * 0.02;
    });

    return (
        <mesh ref={meshRef} position={[0, -0.1, -0.5]} scale={[1, 1, 1]}>
            <planeGeometry args={[3.2, 3.2, 48, 48]} />
            <shaderMaterial args={[shaderArgs]} />
        </mesh>
    );
};

const SeaMesh = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uMouse: { value: new THREE.Vector2(0, 0) }
        },
        vertexShader: SeaShaderMaterial.vertexShader,
        fragmentShader: SeaShaderMaterial.fragmentShader
    }), [size]);

    useFrame(() => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = performance.now() / 1000;
        
        // Smoothly interpolate mouse movement into the sea shader
        material.uniforms.uMouse.value.x -= (mouseStore.x * 2.0 + material.uniforms.uMouse.value.x) * 0.05;
        material.uniforms.uMouse.value.y -= (mouseStore.y * 2.0 + material.uniforms.uMouse.value.y) * 0.05;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[20, 20]} />
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
                    <SeaMesh />
                    <OctopusMesh imagePath={imagePath} />
                </Suspense>
            </Canvas>
        </div>
    );
}
