/*
 * Fluid solver adapted for React from Pavel Dobryakov's WebGL Fluid Simulation.
 * https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 *
 * MIT License
 * Copyright (c) 2017 Pavel Dobryakov
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const splatShader = `
  precision highp float;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec2 point;
  uniform vec3 color;
  uniform float radius;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
  }
`;

const advectionShader = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  varying vec2 vUv;
  void main() {
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    vec2 coord = vUv - dt * velocity * texelSize;
    gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
  }
`;

const curlShader = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 texelSize;
  varying vec2 vUv;
  void main() {
    float left = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).y;
    float right = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).y;
    float bottom = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).x;
    float top = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).x;
    gl_FragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);
  }
`;

const vorticityShader = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform vec2 texelSize;
  uniform float curl;
  uniform float dt;
  varying vec2 vUv;
  void main() {
    float left = texture2D(uCurl, vUv - vec2(texelSize.x, 0.0)).x;
    float right = texture2D(uCurl, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uCurl, vUv - vec2(0.0, texelSize.y)).x;
    float top = texture2D(uCurl, vUv + vec2(0.0, texelSize.y)).x;
    float center = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));
    force /= length(force) + 0.0001;
    force *= curl * center;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const divergenceShader = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 texelSize;
  uniform float uOpenSideBoundaries;
  varying vec2 vUv;
  void main() {
    vec2 leftUv = vUv - vec2(texelSize.x, 0.0);
    vec2 rightUv = vUv + vec2(texelSize.x, 0.0);
    vec2 bottomUv = vUv - vec2(0.0, texelSize.y);
    vec2 topUv = vUv + vec2(0.0, texelSize.y);
    float left = texture2D(uVelocity, leftUv).x;
    float right = texture2D(uVelocity, rightUv).x;
    float bottom = texture2D(uVelocity, bottomUv).y;
    float top = texture2D(uVelocity, topUv).y;
    vec2 center = texture2D(uVelocity, vUv).xy;
    if (leftUv.x < 0.0) left = mix(-center.x, center.x, uOpenSideBoundaries);
    if (rightUv.x > 1.0) right = mix(-center.x, center.x, uOpenSideBoundaries);
    if (bottomUv.y < 0.0) bottom = -center.y;
    if (topUv.y > 1.0) top = -center.y;
    gl_FragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
  }
`;

const pressureShader = `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 texelSize;
  varying vec2 vUv;
  void main() {
    float left = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float right = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float top = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float divergence = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractShader = `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 texelSize;
  varying vec2 vUv;
  void main() {
    float left = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float right = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float top = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity -= vec2(right - left, top - bottom);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const clearShader = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform float value;
  varying vec2 vUv;
  void main() {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const displayShader = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 texelSize;
  uniform float time;
  uniform float uPureBlack;
  varying vec2 vUv;
  void main() {
    vec3 dye = texture2D(uTexture, vUv).rgb;
    vec3 glow = texture2D(uTexture, vUv + vec2(texelSize.x * 3.0, 0.0)).rgb;
    glow += texture2D(uTexture, vUv - vec2(texelSize.x * 3.0, 0.0)).rgb;
    glow += texture2D(uTexture, vUv + vec2(0.0, texelSize.y * 3.0)).rgb;
    glow += texture2D(uTexture, vUv - vec2(0.0, texelSize.y * 3.0)).rgb;
    glow *= 0.25;
    vec3 deepPurple = vec3(0.0588, 0.0392, 0.0863);
    vec3 abyss = vec3(0.010, 0.004, 0.022);
    float verticalDepth = smoothstep(0.0, 1.0, vUv.y);
    vec3 background = mix(mix(abyss, deepPurple, 0.42 + verticalDepth * 0.34), vec3(0.0), uPureBlack);
    float caustic = sin(vUv.x * 8.0 + time * 0.13) * sin(vUv.y * 7.0 - time * 0.1);
    background += vec3(0.045, 0.018, 0.08) * (caustic * 0.5 + 0.5) * 0.08 * (1.0 - uPureBlack);
    vec3 color = background + dye * 1.35 + glow * 0.72;
    color = vec3(1.0) - exp(-color * 1.18);
    color = pow(color, vec3(0.92));
    float vignette = smoothstep(0.9, 0.22, distance(vUv, vec2(0.5)));
    color *= mix(mix(0.46, 1.0, vignette), 1.0, uPureBlack);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface DoubleTarget {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap: () => void;
  dispose: () => void;
}

interface FluidTargets {
  velocity: DoubleTarget;
  dye: DoubleTarget;
  pressure: DoubleTarget;
  divergence: THREE.WebGLRenderTarget;
  curl: THREE.WebGLRenderTarget;
  simTexelSize: THREE.Vector2;
  dyeTexelSize: THREE.Vector2;
  dispose: () => void;
}

interface PendingSplat {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: THREE.Vector3;
  radius: number;
}

const makeMaterial = (
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
) => new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });

const getTargetSize = (baseResolution: number, width: number, height: number) => {
  const aspect = Math.max(width / Math.max(height, 1), height / Math.max(width, 1));
  const minimum = Math.round(baseResolution);
  const maximum = Math.round(baseResolution * aspect);
  return width > height
    ? { width: maximum, height: minimum }
    : { width: minimum, height: maximum };
};

const createRenderTarget = (
  width: number,
  height: number,
  filter: THREE.MagnificationTextureFilter,
) => new THREE.WebGLRenderTarget(width, height, {
  type: THREE.HalfFloatType,
  format: THREE.RGBAFormat,
  minFilter: filter,
  magFilter: filter,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
  depthBuffer: false,
  stencilBuffer: false,
});

const createDoubleTarget = (
  width: number,
  height: number,
  filter: THREE.MagnificationTextureFilter,
): DoubleTarget => {
  const target: DoubleTarget = {
    read: createRenderTarget(width, height, filter),
    write: createRenderTarget(width, height, filter),
    swap: () => {
      const current = target.read;
      target.read = target.write;
      target.write = current;
    },
    dispose: () => {
      target.read.dispose();
      target.write.dispose();
    },
  };
  return target;
};

const createTargets = (
  width: number,
  height: number,
  isTouchDevice: boolean,
): FluidTargets => {
  const simSize = getTargetSize(64, width, height);
  const dyeSize = getTargetSize(isTouchDevice ? 256 : 512, width, height);
  const velocity = createDoubleTarget(simSize.width, simSize.height, THREE.LinearFilter);
  const dye = createDoubleTarget(dyeSize.width, dyeSize.height, THREE.LinearFilter);
  const pressure = createDoubleTarget(simSize.width, simSize.height, THREE.NearestFilter);
  const divergence = createRenderTarget(simSize.width, simSize.height, THREE.NearestFilter);
  const curl = createRenderTarget(simSize.width, simSize.height, THREE.NearestFilter);
  return {
    velocity,
    dye,
    pressure,
    divergence,
    curl,
    simTexelSize: new THREE.Vector2(1 / simSize.width, 1 / simSize.height),
    dyeTexelSize: new THREE.Vector2(1 / dyeSize.width, 1 / dyeSize.height),
    dispose: () => {
      velocity.dispose();
      dye.dispose();
      pressure.dispose();
      divergence.dispose();
      curl.dispose();
    },
  };
};

const palette = [
  new THREE.Vector3(0.34, 0.055, 0.68),
  new THREE.Vector3(0.53, 0.12, 0.96),
  new THREE.Vector3(0.72, 0.28, 1.0),
  new THREE.Vector3(0.42, 0.16, 0.82),
];

const colorAt = (time: number) => {
  const scaled = time * 0.00024;
  const index = Math.floor(scaled) % palette.length;
  const nextIndex = (index + 1) % palette.length;
  const amount = scaled - Math.floor(scaled);
  return palette[index].clone().lerp(palette[nextIndex], amount).multiplyScalar(2.2);
};

interface FluidOceanBackgroundProps {
  pureBlack?: boolean;
  openSideBoundaries?: boolean;
  className?: string;
}

const FluidOceanBackground = ({
  pureBlack = false,
  openSideBoundaries = false,
  className = '',
}: FluidOceanBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isTouchDevice = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setClearColor(pureBlack ? 0x000000 : 0x0f0a16, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1 : 1.5));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry);
    const scene = new THREE.Scene();
    scene.add(mesh);

    const splatMaterial = makeMaterial(splatShader, {
      uTarget: { value: null }, aspectRatio: { value: 1 }, point: { value: new THREE.Vector2() },
      color: { value: new THREE.Vector3() }, radius: { value: 0.0027 },
    });
    const advectionMaterial = makeMaterial(advectionShader, {
      uVelocity: { value: null }, uSource: { value: null }, texelSize: { value: new THREE.Vector2() },
      dt: { value: 0.016 }, dissipation: { value: 0.32 },
    });
    const curlMaterial = makeMaterial(curlShader, {
      uVelocity: { value: null }, texelSize: { value: new THREE.Vector2() },
    });
    const vorticityMaterial = makeMaterial(vorticityShader, {
      uVelocity: { value: null }, uCurl: { value: null }, texelSize: { value: new THREE.Vector2() },
      curl: { value: 4 }, dt: { value: 0.016 },
    });
    const divergenceMaterial = makeMaterial(divergenceShader, {
      uVelocity: { value: null }, texelSize: { value: new THREE.Vector2() },
      uOpenSideBoundaries: { value: openSideBoundaries ? 1.0 : 0.0 },
    });
    const pressureMaterial = makeMaterial(pressureShader, {
      uPressure: { value: null }, uDivergence: { value: null }, texelSize: { value: new THREE.Vector2() },
    });
    const gradientMaterial = makeMaterial(gradientSubtractShader, {
      uPressure: { value: null }, uVelocity: { value: null }, texelSize: { value: new THREE.Vector2() },
    });
    const clearMaterial = makeMaterial(clearShader, {
      uTexture: { value: null }, value: { value: 0.82 },
    });
    const displayMaterial = makeMaterial(displayShader, {
      uTexture: { value: null }, texelSize: { value: new THREE.Vector2() }, time: { value: 0 },
      uPureBlack: { value: pureBlack ? 1.0 : 0.0 },
    });
    const materials = [splatMaterial, advectionMaterial, curlMaterial, vorticityMaterial,
      divergenceMaterial, pressureMaterial, gradientMaterial, clearMaterial, displayMaterial];

    let targets: FluidTargets | null = null;
    let animationFrame = 0;
    let isVisible = true;
    let lastFrame = performance.now();
    let lastPointerX = 0;
    let lastPointerY = 0;
    let hasPointer = false;
    let pendingSplat: PendingSplat | null = null;
    let needsSeed = true;

    const renderWith = (material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => {
      mesh.material = material;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      renderer.setSize(width, height, false);
      targets?.dispose();
      targets = createTargets(width, height, isTouchDevice);
      needsSeed = true;
    };

    const applySplat = ({ x, y, dx, dy, color, radius }: PendingSplat) => {
      if (!targets) return;
      splatMaterial.uniforms.aspectRatio.value = container.clientWidth / Math.max(container.clientHeight, 1);
      splatMaterial.uniforms.point.value.set(x, y);
      splatMaterial.uniforms.radius.value = radius;
      splatMaterial.uniforms.uTarget.value = targets.velocity.read.texture;
      splatMaterial.uniforms.color.value.set(dx, dy, 0);
      renderWith(splatMaterial, targets.velocity.write);
      targets.velocity.swap();
      splatMaterial.uniforms.uTarget.value = targets.dye.read.texture;
      splatMaterial.uniforms.color.value.copy(color);
      renderWith(splatMaterial, targets.dye.write);
      targets.dye.swap();
    };

    const seedFluid = () => {
      const seeds: PendingSplat[] = [
        { x: 0.18, y: 0.62, dx: 74, dy: 18, color: palette[0].clone().multiplyScalar(1.8), radius: 0.0032 },
        { x: 0.72, y: 0.7, dx: -68, dy: -12, color: palette[1].clone().multiplyScalar(1.9), radius: 0.003 },
        { x: 0.52, y: 0.28, dx: 22, dy: 58, color: palette[2].clone().multiplyScalar(1.45), radius: 0.0024 },
      ];
      seeds.forEach(applySplat);
    };

    const step = (dt: number) => {
      if (!targets) return;
      const { velocity, dye, pressure, divergence, curl, simTexelSize } = targets;
      curlMaterial.uniforms.uVelocity.value = velocity.read.texture;
      curlMaterial.uniforms.texelSize.value.copy(simTexelSize);
      renderWith(curlMaterial, curl);
      vorticityMaterial.uniforms.uVelocity.value = velocity.read.texture;
      vorticityMaterial.uniforms.uCurl.value = curl.texture;
      vorticityMaterial.uniforms.texelSize.value.copy(simTexelSize);
      vorticityMaterial.uniforms.dt.value = dt;
      renderWith(vorticityMaterial, velocity.write);
      velocity.swap();
      divergenceMaterial.uniforms.uVelocity.value = velocity.read.texture;
      divergenceMaterial.uniforms.texelSize.value.copy(simTexelSize);
      renderWith(divergenceMaterial, divergence);
      clearMaterial.uniforms.uTexture.value = pressure.read.texture;
      renderWith(clearMaterial, pressure.write);
      pressure.swap();
      pressureMaterial.uniforms.uDivergence.value = divergence.texture;
      pressureMaterial.uniforms.texelSize.value.copy(simTexelSize);
      const pressureIterations = isTouchDevice ? 5 : 10;
      for (let iteration = 0; iteration < pressureIterations; iteration += 1) {
        pressureMaterial.uniforms.uPressure.value = pressure.read.texture;
        renderWith(pressureMaterial, pressure.write);
        pressure.swap();
      }
      gradientMaterial.uniforms.uPressure.value = pressure.read.texture;
      gradientMaterial.uniforms.uVelocity.value = velocity.read.texture;
      gradientMaterial.uniforms.texelSize.value.copy(simTexelSize);
      renderWith(gradientMaterial, velocity.write);
      velocity.swap();
      advectionMaterial.uniforms.uVelocity.value = velocity.read.texture;
      advectionMaterial.uniforms.uSource.value = velocity.read.texture;
      advectionMaterial.uniforms.texelSize.value.copy(simTexelSize);
      advectionMaterial.uniforms.dt.value = dt;
      advectionMaterial.uniforms.dissipation.value = 0.32;
      renderWith(advectionMaterial, velocity.write);
      velocity.swap();
      advectionMaterial.uniforms.uVelocity.value = velocity.read.texture;
      advectionMaterial.uniforms.uSource.value = dye.read.texture;
      advectionMaterial.uniforms.dissipation.value = 0.9;
      renderWith(advectionMaterial, dye.write);
      dye.swap();
    };

    const renderFrame = (now: number) => {
      animationFrame = requestAnimationFrame(renderFrame);
      if (!isVisible || document.hidden || !targets) {
        lastFrame = now;
        return;
      }

      const elapsed = now - lastFrame;
      const frameInterval = isTouchDevice ? 1000 / 30 : 0;
      if (frameInterval && elapsed < frameInterval) return;

      const dt = Math.min(elapsed / 1000, 1 / 30);
      lastFrame = frameInterval ? now - (elapsed % frameInterval) : now;
      if (needsSeed) {
        seedFluid();
        needsSeed = false;
      }
      if (pendingSplat) {
        applySplat(pendingSplat);
        pendingSplat = null;
      }
      step(dt);
      displayMaterial.uniforms.uTexture.value = targets.dye.read.texture;
      displayMaterial.uniforms.texelSize.value.copy(targets.dyeTexelSize);
      displayMaterial.uniforms.time.value = now / 1000;
      renderWith(displayMaterial, null);
    };

    const getLocalPoint = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) return null;
      return {
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: 1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
        width: rect.width,
        height: rect.height,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const point = getLocalPoint(event);
      if (!point) {
        hasPointer = false;
        return;
      }
      if (!hasPointer) {
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        hasPointer = true;
        return;
      }
      const pixelDx = event.clientX - lastPointerX;
      const pixelDy = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      if (Math.abs(pixelDx) + Math.abs(pixelDy) < 1.5) return;
      pendingSplat = {
        x: point.x, y: point.y,
        dx: (pixelDx / Math.max(point.width, 1)) * 6400,
        dy: (-pixelDy / Math.max(point.height, 1)) * 6400,
        color: colorAt(event.timeStamp), radius: 0.0027,
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (finePointer.matches && event.pointerType === 'mouse') return;
      const point = getLocalPoint(event);
      if (!point) return;
      const angle = Math.random() * Math.PI * 2;
      pendingSplat = {
        x: point.x, y: point.y,
        dx: Math.cos(angle) * 92, dy: Math.sin(angle) * 92,
        color: colorAt(event.timeStamp).multiplyScalar(1.18), radius: 0.0046,
      };
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.01 });
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    resize();
    animationFrame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      targets?.dispose();
      materials.forEach((material) => material.dispose());
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [pureBlack, openSideBoundaries]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${pureBlack ? 'bg-black' : 'bg-[#0f0a16]'} ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: pureBlack
          ? 'none'
          : 'radial-gradient(circle at 50% 38%, rgba(107, 33, 168, 0.3), transparent 48%), linear-gradient(180deg, #0f0a16 0%, #05020c 100%)',
      }}
    />
  );
};

export default FluidOceanBackground;
