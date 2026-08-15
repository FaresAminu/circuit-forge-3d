/**
 * Circuit Forge 3D visual workspace.
 * Design reminder: a daylight maker-lab scene; labels clarify nominal reference geometry without imitating certified CAD.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { AssemblyPart } from "@/lib/prototypeCatalog";
import type { ConnectionRoute } from "@/lib/connectionPlanner";
import { createComponentModel, MODEL_SCALE } from "@/lib/componentModels";

export type PrototypeSceneHandle = {
  exportGlb: () => void;
  exportStl: () => void;
  exportPng: (includeLabels: boolean) => void;
  resetView: () => void;
  focusSelected: () => void;
  setView: (view: "iso" | "top" | "front") => void;
};

type PrototypeSceneProps = {
  parts: AssemblyPart[];
  routes: ConnectionRoute[];
  selectedId: string | null;
  showLabels: boolean;
  showConnections: boolean;
  onSelect: (id: string) => void;
};

const SCALE = MODEL_SCALE;

function download(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function addLabel(group: THREE.Group, part: AssemblyPart) {
  const element = document.createElement("div");
  element.className = "scene-part-label";
  element.textContent = part.shortName;
  const label = new CSS2DObject(element);
  label.position.set(0, part.dimensions[2] * SCALE * 0.5 + 0.2, 0);
  group.add(label);
}

function buildPart(part: AssemblyPart, selected: boolean, showLabels: boolean) {
  const group = createComponentModel(part, { selected });
  const [x, y, z] = part.position.map((value) => value * SCALE);
  group.position.set(x, z, y);
  if (showLabels) addLabel(group, part);
  return group;
}

function drawExportLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = "600 24px IBM Plex Mono, monospace";
  const width = ctx.measureText(text).width + 28;
  ctx.fillStyle = "rgba(255,255,252,.94)";
  ctx.strokeStyle = "rgba(36,87,255,.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - 18, width, 36, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#15212a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 1);
}

export const PrototypeScene = forwardRef<PrototypeSceneHandle, PrototypeSceneProps>(function PrototypeScene({ parts, routes, selectedId, showLabels, showConnections, onSelect }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef(new THREE.Group());
  const overlayRef = useRef(new THREE.Group());
  const connectionRef = useRef(new THREE.Group());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const partObjectsRef = useRef(new Map<string, THREE.Group>());
  const partsRef = useRef(parts);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eef1f4");
    scene.fog = new THREE.Fog("#eef1f4", 4, 10);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(3.5, 2.8, 4.3);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = "scene-label-layer";
    labelRenderer.domElement.style.pointerEvents = "none";
    labelRendererRef.current = labelRenderer;
    mount.appendChild(labelRenderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.2;
    controls.maxDistance = 9;
    controls.target.set(0, 0.25, 0);
    controlsRef.current = controls;
    scene.add(new THREE.HemisphereLight("#ffffff", "#556170", 2.2));
    const key = new THREE.DirectionalLight("#ffffff", 2.2); key.position.set(4, 6, 2); key.castShadow = true; scene.add(key);
    const blueFill = new THREE.PointLight("#2457ff", 2.2, 6); blueFill.position.set(-3, 1.4, 2); scene.add(blueFill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: "#e0e5e8", roughness: 0.88 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.23; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(7, 18, "#b8c2c8", "#d7dde0"); grid.position.y = -0.22; scene.add(grid);
    scene.add(modelRef.current);
    scene.add(overlayRef.current);
    scene.add(connectionRef.current);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectPart = (event: PointerEvent) => { const bounds = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1; pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(modelRef.current.children, true)[0]; let current = hit?.object as THREE.Object3D | undefined; while (current) { if (typeof current.userData.partId === "string") { onSelect(current.userData.partId); break; } current = current.parent ?? undefined; } };
    renderer.domElement.addEventListener("pointerdown", selectPart);
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); labelRenderer.setSize(width, height); };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    let frame = 0;
    const render = () => { controls.update(); renderer.render(scene, camera); labelRenderer.render(scene, camera); frame = requestAnimationFrame(render); };
    render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); renderer.domElement.removeEventListener("pointerdown", selectPart); controls.dispose(); renderer.dispose(); labelRenderer.domElement.remove(); mount.removeChild(renderer.domElement); };
  }, [onSelect]);

  useEffect(() => {
    const model = modelRef.current;
    const overlay = overlayRef.current;
    partsRef.current = parts;
    model.clear();
    overlay.clear();
    partObjectsRef.current.clear();
    parts.forEach((part) => { const object = buildPart(part, part.id === selectedId, showLabels); model.add(object); partObjectsRef.current.set(part.id, object); });
    const box = new THREE.Box3().setFromObject(model);
    if (!box.isEmpty()) { const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); const cage = new THREE.Mesh(new THREE.BoxGeometry(size.x + 0.32, size.y + 0.3, size.z + 0.32), new THREE.MeshBasicMaterial({ color: "#2457ff", transparent: true, opacity: 0.055, side: THREE.DoubleSide })); cage.position.copy(center); overlay.add(cage); }
  }, [parts, selectedId, showLabels]);

  useEffect(() => {
    const connectionLayer = connectionRef.current;
    connectionLayer.clear();
    if (!showConnections) return;
    const colors: Record<ConnectionRoute["connectionClass"], string> = { power: "#ec6b37", data: "#2457ff", control: "#d6df35", wireless: "#a669f7", host: "#19a9bd" };
    const externalPoints: Record<string, THREE.Vector3> = {
      "external-phone": new THREE.Vector3(-1.55, 0.88, -0.92),
      "external-network": new THREE.Vector3(1.58, 1.02, -0.9),
      "external-pc": new THREE.Vector3(1.56, 0.72, 0.94),
    };
    const pointFor = (id: string) => {
      if (externalPoints[id]) return externalPoints[id].clone();
      const object = partObjectsRef.current.get(id);
      if (!object) return null;
      const point = object.getWorldPosition(new THREE.Vector3());
      point.y += 0.09;
      return point;
    };
    routes.forEach((connection, index) => {
      const from = pointFor(connection.fromId);
      const to = pointFor(connection.toId);
      if (!from || !to) return;
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 0.28 + (index % 3) * 0.05;
      const curve = new THREE.CatmullRomCurve3([from, mid, to]);
      const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.012, 7, false), new THREE.MeshStandardMaterial({ color: colors[connection.connectionClass], emissive: colors[connection.connectionClass], emissiveIntensity: 0.2, roughness: 0.35, transparent: true, opacity: 0.84 }));
      line.userData.routeId = connection.id;
      connectionLayer.add(line);
      const direction = to.clone().sub(mid).normalize();
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.11, 10), new THREE.MeshStandardMaterial({ color: colors[connection.connectionClass], emissive: colors[connection.connectionClass], emissiveIntensity: 0.25 }));
      arrow.position.copy(to.clone().lerp(mid, 0.12));
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      connectionLayer.add(arrow);
    });
  }, [routes, showConnections, parts]);

  useImperativeHandle(ref, () => ({
    resetView: () => { const camera = cameraRef.current; const controls = controlsRef.current; if (!camera || !controls) return; camera.up.set(0, 1, 0); camera.position.set(3.5, 2.8, 4.3); controls.target.set(0, 0.25, 0); controls.update(); },
    setView: (view) => { const camera = cameraRef.current; const controls = controlsRef.current; if (!camera || !controls) return; controls.target.set(0, 0.2, 0); if (view === "top") { camera.up.set(0, 0, -1); camera.position.set(0, 6.8, 0.01); } else if (view === "front") { camera.up.set(0, 1, 0); camera.position.set(0, 1.2, 5.8); } else { camera.up.set(0, 1, 0); camera.position.set(3.5, 2.8, 4.3); } controls.update(); },
    focusSelected: () => { const camera = cameraRef.current; const controls = controlsRef.current; const selected = selectedId ? partObjectsRef.current.get(selectedId) : null; if (!camera || !controls || !selected) return; const box = new THREE.Box3().setFromObject(selected); const center = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3()); const distance = Math.max(1.2, size.length() * 2.8); camera.up.set(0, 1, 0); camera.position.copy(center).add(new THREE.Vector3(distance, distance * 0.65, distance)); controls.target.copy(center); controls.update(); },
    exportGlb: () => { const exporter = new GLTFExporter(); exporter.parse(modelRef.current, (result) => { if (result instanceof ArrayBuffer) download(new Blob([result], { type: "model/gltf-binary" }), "circuit-forge-assembly.glb"); else download(new Blob([JSON.stringify(result, null, 2)], { type: "model/gltf+json" }), "circuit-forge-assembly.gltf"); }, (error) => console.error("GLB export failed", error), { binary: true }); },
    exportStl: () => { const exporter = new STLExporter(); const result = exporter.parse(modelRef.current, { binary: true }); download(new Blob([result as BlobPart], { type: "model/stl" }), "circuit-forge-reference-assembly.stl"); },
    exportPng: (includeLabels) => { const renderer = rendererRef.current; const scene = sceneRef.current; const camera = cameraRef.current; if (!renderer || !scene || !camera) return; const cssWidth = renderer.domElement.clientWidth; const cssHeight = renderer.domElement.clientHeight; const previousRatio = renderer.getPixelRatio(); renderer.setPixelRatio(3); renderer.setSize(cssWidth, cssHeight, false); renderer.render(scene, camera); const canvas = document.createElement("canvas"); canvas.width = renderer.domElement.width; canvas.height = renderer.domElement.height; const context = canvas.getContext("2d"); if (context) { context.drawImage(renderer.domElement, 0, 0); if (includeLabels) { partObjectsRef.current.forEach((object, id) => { const part = partsRef.current.find((item) => item.id === id); if (!part) return; const position = object.getWorldPosition(new THREE.Vector3()); position.y += part.dimensions[2] * SCALE * 0.5 + 0.2; position.project(camera); const x = (position.x * 0.5 + 0.5) * canvas.width; const y = (-position.y * 0.5 + 0.5) * canvas.height; if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) drawExportLabel(context, part.shortName, x, y); }); } canvas.toBlob((blob) => { if (blob) download(blob, includeLabels ? "circuit-forge-labeled-3x.png" : "circuit-forge-clean-3x.png"); }, "image/png"); } renderer.setPixelRatio(previousRatio); renderer.setSize(cssWidth, cssHeight, false); },
  }), [selectedId]);

  return <div className="prototype-scene" ref={mountRef} aria-label="Interactive 3D reference assembly. Drag to rotate, scroll to zoom, and use labels to inspect component placement." />;
});
