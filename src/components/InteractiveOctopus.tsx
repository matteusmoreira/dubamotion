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

// Realistic Underwater Sea Shader (Purple)
const SeaShaderMaterial = {
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Simplex-style noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // FBM for layered detail
    float fbm(vec2 p) {
      float f = 0.0;
      float w = 0.5;
      for(int i = 0; i < 5; i++) {
        f += w * snoise(p);
        p *= 2.0;
        w *= 0.5;
      }
      return f;
    }

    // Caustics pattern (light filtering through water surface)
    float caustics(vec2 uv, float time) {
      float c = 0.0;
      vec2 p = uv;
      p += vec2(snoise(p * 2.0 + time * 0.15), snoise(p * 2.0 + time * 0.12 + 100.0)) * 0.08;
      float v1 = 1.0 - abs(snoise(p * 3.0 + time * 0.2));
      float v2 = 1.0 - abs(snoise(p * 4.0 - time * 0.15 + 50.0));
      float v3 = 1.0 - abs(snoise(p * 5.5 + time * 0.1 + 200.0));
      c = (v1 * v2 * v3);
      c = pow(c, 0.8);
      return c;
    }

    void main() {
      vec2 uv = vUv;

      // Slow drift from mouse for immersive feel
      uv += uMouse * 0.03;

      float t = uTime;

      // --- Deep purple ocean base ---
      // Vertical depth gradient: lighter near top, darker at bottom
      float depthGrad = smoothstep(1.0, 0.2, uv.y);

      // Deep ocean purple tones
      vec3 deepPurple   = vec3(0.02, 0.005, 0.06);
      vec3 midPurple    = vec3(0.08, 0.02, 0.18);
      vec3 lightPurple  = vec3(0.14, 0.04, 0.30);
      vec3 violet       = vec3(0.22, 0.06, 0.40);
      vec3 highlightV   = vec3(0.40, 0.15, 0.65);

      vec3 color = mix(deepPurple, midPurple, depthGrad * 0.5);

      // --- Water surface waves (seen from below) ---
      float wave1 = snoise(vec2(uv.x * 3.0 + t * 0.08, uv.y * 2.0 + t * 0.05)) * 0.5 + 0.5;
      float wave2 = snoise(vec2(uv.x * 5.0 - t * 0.06, uv.y * 3.0 + t * 0.04 + 30.0)) * 0.5 + 0.5;
      float wave3 = snoise(vec2(uv.x * 2.0 + t * 0.03, uv.y * 1.5 - t * 0.02 + 60.0)) * 0.5 + 0.5;
      float waves = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
      waves = smoothstep(0.3, 0.8, waves);

      color = mix(color, lightPurple, waves * 0.35 * depthGrad);

      // --- Caustics (light dancing through water) ---
      float c = caustics(uv * 1.5, t);
      float c2 = caustics(uv * 2.0 + 20.0, t * 0.7);

      // Caustics brighter near the top (closer to surface)
      float causticsIntensity = c * 0.25 + c2 * 0.15;
      color = mix(color, violet, causticsIntensity * depthGrad);

      // Bright caustic highlights
      float brightCaustics = smoothstep(0.6, 0.9, c) * depthGrad;
      color = mix(color, highlightV, brightCaustics * 0.4);

      // --- God rays from above (subtle) ---
      float ray1 = smoothstep(0.48, 0.5, abs(uv.x - 0.3 - snoise(vec2(uv.y * 0.5, t * 0.05)) * 0.1));
      float ray2 = smoothstep(0.48, 0.5, abs(uv.x - 0.6 - snoise(vec2(uv.y * 0.5 + 50.0, t * 0.04)) * 0.12));
      float ray3 = smoothstep(0.48, 0.5, abs(uv.x - 0.8 - snoise(vec2(uv.y * 0.3 + 100.0, t * 0.03)) * 0.08));
      float rays = (ray1 + ray2 * 0.7 + ray3 * 0.5) * depthGrad;
      rays *= (1.0 - smoothstep(0.0, 0.7, uv.y)) * 0.6;

      color += vec3(0.18, 0.06, 0.35) * rays;

      // --- Particulate in water (floating dust/plankton) ---
      float particles = 0.0;
      for(int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 pPos = vec2(
          snoise(vec2(fi * 10.0, t * 0.02 + fi)) * 0.8,
          fract(fi * 0.37 + t * 0.008 + snoise(vec2(fi * 5.0, t * 0.015)))
        );
        float dist = length(uv - pPos);
        particles += smoothstep(0.015, 0.003, dist) * 0.3;
      }
      color += vec3(0.25, 0.12, 0.45) * particles * depthGrad;

      // --- Slow organic color shift (like water current) ---
      float drift = fbm(uv * 1.5 + t * 0.05) * 0.5 + 0.5;
      color = mix(color, mix(midPurple, violet, drift), 0.12);

      // --- Vignette: darker at edges, brighter in center ---
      float vignette = 1.0 - smoothstep(0.4, 0.95, length(uv - 0.5) * 1.4);
      color *= mix(0.4, 1.0, vignette);

      // Slight brightness/contrast boost
      color = pow(color, vec3(0.95));

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
