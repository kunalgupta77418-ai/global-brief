import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LABELS = ["Court order", "Minister", "Policy", "Protest", "City", "Earlier ruling"];
const NODE_COUNT = 64;

function seeded(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One WebGL scene: a drifting constellation that the scroll position flies through, or a quiet drifting background. */
export default function Constellation3D({ onFallback, quiet = false }: { onFallback: () => void; quiet?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef(onFallback);
  fallbackRef.current = onFallback;

  useEffect(() => {
    const stage = stageRef.current;
    const labelHost = labelsRef.current;
    if (!stage || !labelHost) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      fallbackRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "c3d-canvas";
    stage.insertBefore(renderer.domElement, stage.firstChild);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111214, 9, 25);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    const group = new THREE.Group();
    scene.add(group);

    // ---- build the node cloud (deterministic, so the demo always looks the same)
    const rand = seeded(20261107);
    const positions: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    const sizes: number[] = [0.3];
    const labelSpots = [
      [-3.9, 1.5, 0.8], [3.6, 2.0, -0.6], [0.4, 3.0, 2.4], [-3.2, -2.1, -1.2], [3.8, -1.7, 1.1], [0.9, -3.1, -2.2],
    ];
    labelSpots.forEach(([x, y, z]) => { positions.push(new THREE.Vector3(x, y, z)); sizes.push(0.14); });
    while (positions.length < NODE_COUNT) {
      const p = new THREE.Vector3((rand() * 2 - 1) * 5.6, (rand() * 2 - 1) * 4, (rand() * 2 - 1) * 4.6);
      if (p.x * p.x / 31 + p.y * p.y / 16 + p.z * p.z / 21 > 1) continue;
      if (positions.some(q => q.distanceTo(p) < 0.9)) continue;
      positions.push(p); sizes.push(0.06 + rand() * 0.05);
    }

    const sphere = new THREE.SphereGeometry(1, 16, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nodes = new THREE.InstancedMesh(sphere, nodeMaterial, NODE_COUNT);
    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const hit = new THREE.InstancedMesh(sphere, hitMaterial, NODE_COUNT);
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(sizes[i]);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(Math.max(0.3, sizes[i] * 2.6));
      dummy.updateMatrix();
      hit.setMatrixAt(i, dummy.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
    hit.instanceMatrix.needsUpdate = true;
    const baseColor = (i: number) => (i === 0 ? 0xd9a441 : i <= LABELS.length ? 0xe3dfd5 : 0xa8a49c);
    const paintColors = (hovered: number | null, neighbours: Set<number>) => {
      const color = new THREE.Color();
      for (let i = 0; i < NODE_COUNT; i++) {
        if (hovered === i) color.set(0xd9a441);
        else if (neighbours.has(i)) color.set(0xf4f0e6);
        else color.set(baseColor(i)).multiplyScalar(hovered === null ? 1 : 0.5);
        nodes.setColorAt(i, color);
      }
      if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
    };
    paintColors(null, new Set());
    group.add(nodes, hit);

    // ---- edges: each node links to its two nearest neighbours; the core links to every labelled node
    const edgeKeys = new Set<string>();
    const edges: [number, number][] = [];
    const addEdge = (a: number, b: number) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a === b || edgeKeys.has(key)) return;
      edgeKeys.add(key); edges.push([a, b]);
    };
    for (let i = 1; i <= LABELS.length; i++) addEdge(0, i);
    for (let i = 1; i < NODE_COUNT; i++) {
      const nearest = positions
        .map((p, j) => ({ j, d: j === i ? Infinity : p.distanceTo(positions[i]) }))
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      nearest.forEach(({ j }) => addEdge(i, j));
    }
    const basePositions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
      positions[a].toArray(basePositions, k * 6);
      positions[b].toArray(basePositions, k * 6 + 3);
    });
    const baseGeometry = new THREE.BufferGeometry();
    baseGeometry.setAttribute("position", new THREE.BufferAttribute(basePositions, 3));
    const baseMaterial = new THREE.LineBasicMaterial({ color: 0x80848a, transparent: true, opacity: 0.5 });
    const baseLines = new THREE.LineSegments(baseGeometry, baseMaterial);
    const hotArray = new Float32Array(edges.length * 6);
    const hotGeometry = new THREE.BufferGeometry();
    hotGeometry.setAttribute("position", new THREE.BufferAttribute(hotArray, 3));
    hotGeometry.setDrawRange(0, 0);
    const hotMaterial = new THREE.LineBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 1 });
    const hotLines = new THREE.LineSegments(hotGeometry, hotMaterial);
    hotLines.frustumCulled = false;
    group.add(baseLines, hotLines);

    // ---- HTML labels for the six named nodes
    const labelEls = LABELS.map(text => {
      const el = document.createElement("span");
      el.className = "c3d-label";
      el.textContent = text;
      labelHost.appendChild(el);
      return el;
    });

    // ---- hover: highlight a node's links and dim the rest
    let hovered: number | null = null;
    let baseOpacityTarget = 0.5;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const setHovered = (next: number | null) => {
      if (next === hovered) return;
      hovered = next;
      const neighbours = new Set<number>();
      let count = 0;
      if (next !== null) {
        edges.forEach(([a, b]) => {
          if (a === next || b === next) {
            positions[a].toArray(hotArray, count * 6);
            positions[b].toArray(hotArray, count * 6 + 3);
            neighbours.add(a === next ? b : a);
            count++;
          }
        });
      }
      (hotGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      hotGeometry.setDrawRange(0, count * 2);
      baseOpacityTarget = next === null ? 0.5 : 0.1;
      paintColors(next, neighbours);
      renderer.domElement.style.cursor = next === null ? "" : "crosshair";
      labelEls.forEach((el, k) => el.classList.toggle("is-hot", next === k + 1));
    };
    const onPointerMove = (event: PointerEvent) => {
      if (quiet) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const found = raycaster.intersectObject(hit)[0];
      setHovered(found && typeof found.instanceId === "number" ? found.instanceId : null);
    };
    const onPointerLeave = () => {
      if (!quiet) setHovered(null);
    };
    if (!quiet) {
      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerleave", onPointerLeave);
    }

    // ---- size
    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    // ---- scroll drives the camera in interactive mode; slow idle drift keeps it alive
    let targetProgress = quiet ? 0.35 : 0;
    let progress = quiet ? 0.35 : 0;
    let trigger: ScrollTrigger | null = null;
    if (!quiet) {
      trigger = ScrollTrigger.create({
        trigger: stage, start: "top bottom", end: "bottom top",
        onUpdate: self => { targetProgress = self.progress; },
      });
      targetProgress = trigger.progress;
      progress = targetProgress;
    }

    const tmp = new THREE.Vector3();
    const placeLabels = () => {
      if (quiet) {
        labelEls.forEach(el => { el.style.opacity = "0"; });
        return;
      }
      LABELS.forEach((_, k) => {
        const el = labelEls[k];
        tmp.copy(positions[k + 1]);
        group.localToWorld(tmp);
        const distance = camera.position.distanceTo(tmp);
        tmp.project(camera);
        const visible = tmp.z < 1 ? Math.min(1, Math.max(0, (13 - distance) / 4)) : 0;
        const x = (tmp.x * 0.5 + 0.5) * width;
        const y = (-tmp.y * 0.5 + 0.5) * height;
        el.style.transform = `translate3d(${x + 12}px, ${y - 9}px, 0)`;
        el.style.opacity = String(visible);
      });
    };

    let idle = 0;
    const renderFrame = (dt: number) => {
      const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!isReduced) {
        idle += dt * (quiet ? 0.02 : 0.05);
      }
      if (quiet) {
        camera.position.set(0.8, 0.4, 14.5);
        camera.lookAt(0, 0, 0);
        group.rotation.y = -0.5 + idle;
        group.rotation.x = 0.09;
        baseMaterial.opacity = 0.4;
      } else {
        progress += (targetProgress - progress) * Math.min(1, dt * 4.5);
        const eased = progress * progress * (3 - 2 * progress);
        camera.position.set(Math.sin(eased * 1.4) * 1.2, 0.9 - eased * 1.1, 16 - eased * 8.8);
        camera.lookAt(0, 0, 0);
        group.rotation.y = -0.8 + eased * 2.1 + idle;
        group.rotation.x = 0.16 - eased * 0.26;
        baseMaterial.opacity += (baseOpacityTarget - baseMaterial.opacity) * Math.min(1, dt * 8);
      }
      placeLabels();
      renderer.render(scene, camera);
    };
    renderFrame(0.016);

    // ---- run only while on screen; fall back to the SVG if the frame rate stays low
    let running = false;
    let frame = 0;
    let last = 0;
    let slow = 0;
    let warmup = 0;
    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      const raw = (now - last) / 1000;
      last = now;
      warmup += dt;
      if (warmup > 1.2 && raw < 0.5) {
        if (raw > 1 / 40) slow += raw; else slow = 0;
        if (slow > 2) { fallbackRef.current(); return; }
      }
      renderFrame(dt);
      frame = requestAnimationFrame(loop);
    };
    const start = () => { if (running) return; running = true; last = performance.now(); frame = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(frame); };
    const visibility = new IntersectionObserver(entries => { entries[0].isIntersecting ? start() : stop(); }, { threshold: 0.01 });
    visibility.observe(stage);
    const onContextLost = (event: Event) => { event.preventDefault(); fallbackRef.current(); };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      trigger?.kill();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      labelEls.forEach(el => el.remove());
      sphere.dispose(); nodeMaterial.dispose(); hitMaterial.dispose();
      baseGeometry.dispose(); baseMaterial.dispose(); hotGeometry.dispose(); hotMaterial.dispose();
      nodes.dispose(); hit.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={stageRef} className="c3d-stage" role="img" aria-label="An interactive 3D constellation of demo story connections that the page scroll flies through">
    <div ref={labelsRef} className="c3d-labels" aria-hidden="true" />
  </div>;
}
