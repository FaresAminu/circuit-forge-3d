/**
 * Circuit Forge 3D — full-system scene with external devices and functional routes.
 * Design reminder: this is a visually complete reference model, never a certified wiring diagram.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import type { AssemblyPart } from "@/lib/prototypeCatalog";
import type { ConnectionRoute, ExternalMode } from "@/lib/connectionPlanner";
import { createComponentModel, MODEL_SCALE } from "@/lib/componentModels";

export type SystemSceneHandle = { exportGlb: () => void; exportPng: () => void; resetView: () => void };
type SystemSceneProps = { parts: AssemblyPart[]; routes: ConnectionRoute[]; mode: ExternalMode; showLabels: boolean };

const SCALE = MODEL_SCALE;
const COLORS: Record<ConnectionRoute["connectionClass"], string> = { power: "#ec6b37", data: "#2457ff", control: "#d6df35", wireless: "#a669f7", host: "#19a9bd" };
// Reference envelopes in millimetres, scaled against the Raspberry Pi 4 model (85.6 × 56 mm).
const PHONE_REFERENCE = { width: 72, height: 152, depth: 8 };
const LAPTOP_REFERENCE = { width: 305, depth: 215, height: 17 };

function download(blob: Blob, filename: string) { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href); }
function mat(color: string) { return new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.08 }); }
function box(group: THREE.Group, size: [number, number, number], color: string, position: THREE.Vector3) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color)); mesh.position.copy(position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }

function addTag(group: THREE.Group, text: string, position: THREE.Vector3, color = "#15212a") {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 88;
  const context = canvas.getContext("2d"); if (!context) return;
  context.fillStyle = "rgba(255,255,252,.96)"; context.strokeStyle = color; context.lineWidth = 4; context.fillRect(4, 4, 504, 80); context.strokeRect(4, 4, 504, 80);
  context.fillStyle = color; context.font = "600 28px monospace"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text, 256, 45);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })); sprite.position.copy(position); sprite.scale.set(1.18, 0.2, 1); group.add(sprite);
}

function addPart(root: THREE.Group, part: AssemblyPart, labels: boolean) {
  const [w, d, h] = part.dimensions; const position = new THREE.Vector3(part.position[0] * SCALE, part.position[2] * SCALE + h * SCALE * 0.45, part.position[1] * SCALE);
  const group = createComponentModel(part); root.add(group);
  group.position.copy(position);
  if (labels) addTag(root, part.shortName.toUpperCase(), position.clone().add(new THREE.Vector3(0, h * SCALE * 0.75 + 0.17, 0)), part.color);
  return group;
}

function addPhone(root: THREE.Group, point: THREE.Vector3) {
  const group = new THREE.Group(); root.add(group);
  const width = PHONE_REFERENCE.width * SCALE, height = PHONE_REFERENCE.height * SCALE, depth = PHONE_REFERENCE.depth * SCALE;
  box(group, [width, height, depth], "#202a33", new THREE.Vector3(0, height / 2, 0));
  box(group, [width * 0.84, height * 0.84, depth * 1.08], "#2457ff", new THREE.Vector3(0, height / 2, depth * 0.56));
  box(group, [width * 0.14, height * 0.012, depth * 1.15], "#d7e2e8", new THREE.Vector3(0, height * 0.89, depth * 0.59));
  group.position.copy(point);
  addTag(root, "PHONE REF · 152×72mm", point.clone().add(new THREE.Vector3(0, height + 0.3, 0)), "#2457ff");
}
function addPc(root: THREE.Group, point: THREE.Vector3) {
  const group = new THREE.Group(); root.add(group);
  const width = LAPTOP_REFERENCE.width * SCALE, depth = LAPTOP_REFERENCE.depth * SCALE, thickness = LAPTOP_REFERENCE.height * SCALE;
  box(group, [width, thickness, depth], "#d7dde0", new THREE.Vector3(0, thickness / 2, 0));
  box(group, [width * 0.9, thickness * 0.24, depth * 0.84], "#202a33", new THREE.Vector3(0, thickness * 1.16, depth * 0.03));
  box(group, [width * 0.92, width * 0.57, thickness * 0.68], "#202a33", new THREE.Vector3(0, width * 0.285 + thickness * 1.24, -depth * 0.42));
  box(group, [width * 0.82, width * 0.47, thickness * 0.78], "#19a9bd", new THREE.Vector3(0, width * 0.285 + thickness * 1.24, -depth * 0.42 - thickness * 0.04));
  group.position.copy(point);
  addTag(root, "LAPTOP REF · 305×215mm", point.clone().add(new THREE.Vector3(0, width * 0.68 + 0.35, -depth * 0.1)), "#19a9bd");
}
function addRouter(root: THREE.Group, point: THREE.Vector3) { const group = new THREE.Group(); root.add(group); box(group, [0.68, 0.17, 0.38], "#4b5560", new THREE.Vector3()); [-0.2, 0.2].forEach((x) => { const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.54, 10), mat("#202a33")); antenna.position.set(x, 0.29, 0); antenna.rotation.z = x < 0 ? -0.18 : 0.18; group.add(antenna); }); group.position.copy(point); addTag(root, "WI‑FI / NETWORK", point.clone().add(new THREE.Vector3(0, 0.63, 0)), "#a669f7"); }
function addAdc(root: THREE.Group, point: THREE.Vector3) { box(root, [0.42, 0.09, 0.28], "#8657bf", point); addTag(root, "ADC BRIDGE", point.clone().add(new THREE.Vector3(0, 0.25, 0)), "#8657bf"); }

export const SystemScene = forwardRef<SystemSceneHandle, SystemSceneProps>(function SystemScene({ parts, routes, mode, showLabels }, ref) {
  const mountRef = useRef<HTMLDivElement>(null); const modelRef = useRef(new THREE.Group()); const sceneRef = useRef<THREE.Scene | null>(null); const rendererRef = useRef<THREE.WebGLRenderer | null>(null); const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color("#f0f3f4"); scene.fog = new THREE.Fog("#f0f3f4", 7, 20); sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); camera.position.set(6.6, 4.35, 7.4); cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; rendererRef.current = renderer; mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 4.2; controls.maxDistance = 14; controls.target.set(0.35, 0.62, 0); controlsRef.current = controls;
    scene.add(new THREE.HemisphereLight("#ffffff", "#596875", 2.2)); const key = new THREE.DirectionalLight("#ffffff", 2.4); key.position.set(4, 6, 2); key.castShadow = true; scene.add(key); const fill = new THREE.PointLight("#2457ff", 2.6, 7); fill.position.set(-3, 1.5, 2); scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshStandardMaterial({ color: "#e1e7e9", roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.25; floor.receiveShadow = true; scene.add(floor); const grid = new THREE.GridHelper(16, 32, "#b7c3c9", "#d7dee1"); grid.position.y = -0.24; scene.add(grid); scene.add(modelRef.current);
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); }; const observer = new ResizeObserver(resize); observer.observe(mount); resize(); let frame = 0; const render = () => { controls.update(); renderer.render(scene, camera); frame = requestAnimationFrame(render); }; render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); renderer.dispose(); mount.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => {
    const root = modelRef.current; root.clear(); const points = new Map<string, THREE.Vector3>();
    parts.forEach((part) => { const object = addPart(root, part, showLabels); points.set(part.id, object.getWorldPosition(new THREE.Vector3())); });
    const needsPhone = mode === "wifi-phone" || mode === "wifi-phone-pc" || mode === "wifi-network"; const needsPc = mode === "usb-pc" || mode === "ethernet-pc" || mode === "wifi-phone-pc" || mode === "wifi-network"; const needsNetwork = mode === "wifi-network";
    const externalPoints: Record<string, THREE.Vector3> = { "external-phone": new THREE.Vector3(-2.4, 0, -1.52), "external-pc": new THREE.Vector3(2.55, 0, 1.42), "external-network": new THREE.Vector3(1.88, 0.12, -1.72), "adapter-adc": new THREE.Vector3(-1.08, 0.14, 1.1) };
    if (needsPhone) addPhone(root, externalPoints["external-phone"]); if (needsPc) addPc(root, externalPoints["external-pc"]); if (needsNetwork) addRouter(root, externalPoints["external-network"]); if (routes.some((item) => item.toId === "adapter-adc" || item.fromId === "adapter-adc")) addAdc(root, externalPoints["adapter-adc"]);
    Object.entries(externalPoints).forEach(([id, point]) => points.set(id, point));
    routes.forEach((item, index) => { const from = points.get(item.fromId); const to = points.get(item.toId); if (!from || !to) return; const mid = from.clone().lerp(to, 0.5); mid.y += 0.34 + (index % 3) * 0.05; const curve = new THREE.CatmullRomCurve3([from.clone().add(new THREE.Vector3(0, 0.12, 0)), mid, to.clone().add(new THREE.Vector3(0, 0.12, 0))]); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 26, 0.014, 8, false), new THREE.MeshStandardMaterial({ color: COLORS[item.connectionClass], emissive: COLORS[item.connectionClass], emissiveIntensity: 0.24, roughness: 0.28 })); root.add(tube); });
    if (needsNetwork) { ["external-phone", "external-pc"].forEach((id, index) => { const from = externalPoints["external-network"], to = externalPoints[id]; const curve = new THREE.CatmullRomCurve3([from.clone().add(new THREE.Vector3(0, 0.26, 0)), from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.58 + index * 0.08, 0)), to.clone().add(new THREE.Vector3(0, 0.26, 0))]); root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.009, 6, false), new THREE.MeshStandardMaterial({ color: "#a669f7", emissive: "#a669f7", emissiveIntensity: 0.22, transparent: true, opacity: 0.74 }))); }); }
  }, [parts, routes, mode, showLabels]);

  useImperativeHandle(ref, () => ({
    resetView: () => { const camera = cameraRef.current, controls = controlsRef.current; if (!camera || !controls) return; camera.position.set(6.6, 4.35, 7.4); controls.target.set(0.35, 0.62, 0); controls.update(); },
    exportGlb: () => { const exporter = new GLTFExporter(); exporter.parse(modelRef.current, (result) => { if (result instanceof ArrayBuffer) download(new Blob([result], { type: "model/gltf-binary" }), "circuit-forge-complete-system.glb"); }, (error) => console.error("System GLB export failed", error), { binary: true }); },
    exportPng: () => { const renderer = rendererRef.current, scene = sceneRef.current, camera = cameraRef.current; if (!renderer || !scene || !camera) return; const width = renderer.domElement.clientWidth, height = renderer.domElement.clientHeight, ratio = renderer.getPixelRatio(); renderer.setPixelRatio(3); renderer.setSize(width, height, false); renderer.render(scene, camera); renderer.domElement.toBlob((blob) => { if (blob) download(blob, "circuit-forge-complete-system-3x.png"); }, "image/png"); renderer.setPixelRatio(ratio); renderer.setSize(width, height, false); },
  }), []);
  return <div className="system-scene" ref={mountRef} aria-label="Interactive full-system 3D reference with prototype, routes, and selected external devices." />;
});
