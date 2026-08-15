/**
 * Circuit Forge 3D — product-style procedural component library.
 * Design reminder: credible electronics materials, connectors and manufacturing details;
 * models are visual learning references, not manufacturer-certified CAD or pinout evidence.
 */
import * as THREE from "three";
import type { AssemblyPart } from "@/lib/prototypeCatalog";

export const MODEL_SCALE = 0.012;

type ModelOptions = { selected?: boolean };

function finish(mesh: THREE.Mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function surface(color: THREE.ColorRepresentation, selected = false, roughness = 0.48, metalness = 0.08) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    envMapIntensity: 0.7,
    emissive: selected ? new THREE.Color("#2457ff") : new THREE.Color("#000000"),
    emissiveIntensity: selected ? 0.22 : 0,
  });
}

function box(group: THREE.Group, size: [number, number, number], color: THREE.ColorRepresentation, position: [number, number, number], selected = false, roughness = 0.48, metalness = 0.08) {
  const mesh = finish(new THREE.Mesh(new THREE.BoxGeometry(...size), surface(color, selected, roughness, metalness)));
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function cylinder(group: THREE.Group, radiusTop: number, radiusBottom: number, height: number, color: THREE.ColorRepresentation, position: [number, number, number], selected = false, radialSegments = 20, roughness = 0.42, metalness = 0.12) {
  const mesh = finish(new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), surface(color, selected, roughness, metalness)));
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function board(group: THREE.Group, w: number, d: number, color: string, selected: boolean, thickness = 0.028) {
  box(group, [w, thickness, d], color, [0, 0, 0], selected, 0.42, 0.05);
  const holeRadius = Math.min(w, d) * 0.035;
  [[-w * 0.42, -d * 0.42], [w * 0.42, -d * 0.42], [-w * 0.42, d * 0.42], [w * 0.42, d * 0.42]].forEach(([x, z]) => {
    cylinder(group, holeRadius, holeRadius, thickness * 1.22, "#16212a", [x, thickness * 0.04, z], false, 14, 0.3, 0.35);
  });
  const copper = "#d6a341";
  box(group, [w * 0.76, thickness * 0.12, d * 0.018], copper, [0, thickness * 0.57, -d * 0.16], false, 0.35, 0.62);
  box(group, [w * 0.018, thickness * 0.12, d * 0.54], copper, [w * 0.1, thickness * 0.58, 0], false, 0.35, 0.62);
  return thickness;
}

function header(group: THREE.Group, x: number, z: number, pins: number, vertical: boolean, selected: boolean, pitch = 0.034) {
  const span = Math.max(pitch, (pins - 1) * pitch + 0.026);
  box(group, vertical ? [0.035, 0.042, span] : [span, 0.042, 0.035], "#15191e", [x, 0.035, z], selected, 0.38, 0.04);
  for (let i = 0; i < pins; i += 1) {
    const offset = (i - (pins - 1) / 2) * pitch;
    box(group, [0.012, 0.038, 0.012], "#d4ad55", vertical ? [x, 0.07, z + offset] : [x + offset, 0.07, z], selected, 0.26, 0.76);
  }
}

function chip(group: THREE.Group, w: number, d: number, position: [number, number, number], selected: boolean, legs = 6) {
  const [x, y, z] = position;
  box(group, [w, 0.034, d], "#11161c", [x, y, z], selected, 0.34, 0.05);
  for (let i = 0; i < legs; i += 1) {
    const offset = (i - (legs - 1) / 2) * (d * 0.72 / Math.max(1, legs - 1));
    box(group, [w * 0.08, 0.012, 0.014], "#c5c9cd", [x - w * 0.56, y - 0.012, z + offset], false, 0.3, 0.72);
    box(group, [w * 0.08, 0.012, 0.014], "#c5c9cd", [x + w * 0.56, y - 0.012, z + offset], false, 0.3, 0.72);
  }
}

function capacitor(group: THREE.Group, x: number, z: number, selected: boolean, radius = 0.034, height = 0.075, color = "#202832") {
  cylinder(group, radius, radius, height, color, [x, height * 0.5 + 0.021, z], selected, 18, 0.3, 0.14);
  cylinder(group, radius * 0.84, radius * 0.84, 0.006, "#d0d3d6", [x, height + 0.024, z], false, 18, 0.22, 0.72);
}

function usbPort(group: THREE.Group, x: number, z: number, selected: boolean, wide = false) {
  const w = wide ? 0.16 : 0.105;
  box(group, [w, 0.075, 0.075], "#b8bdc3", [x, 0.042, z], selected, 0.26, 0.82);
  box(group, [w * 0.75, 0.012, 0.055], "#111820", [x, 0.045, z + 0.04], false, 0.35, 0.1);
}

function led(group: THREE.Group, x: number, z: number, color: string, selected: boolean) {
  cylinder(group, 0.014, 0.014, 0.012, color, [x, 0.03, z], selected, 14, 0.24, 0.16);
}

function heatsink(group: THREE.Group, w: number, d: number, selected: boolean, color = "#20262d") {
  for (let i = 0; i < 9; i += 1) {
    const x = (i - 4) * (w / 9.4);
    box(group, [w / 15, d * 0.9, 0.105], color, [x, 0.075, 0], selected, 0.28, 0.78);
  }
  box(group, [w, 0.034, d], "#2e3740", [0, 0.021, 0], selected, 0.28, 0.76);
}

function antenna(group: THREE.Group, x: number, z: number, selected: boolean, height = 0.36) {
  cylinder(group, 0.018, 0.022, 0.044, "#d2ab59", [x, 0.045, z], selected, 18, 0.25, 0.75);
  const rod = cylinder(group, 0.009, 0.012, height, "#20242a", [x, height * 0.5 + 0.06, z], selected, 14, 0.32, 0.48);
  rod.rotation.z = -0.08;
}

function addCables(group: THREE.Group, part: AssemblyPart, selected: boolean) {
  const colors = ["#f0523e", "#2457ff", "#d6df35", "#20242b", "#f4f1e6", "#42a76d"];
  const count = Math.min(part.quantity, 16);
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * 0.06;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.98, 0.055, offset),
      new THREE.Vector3(-0.36, 0.34 + (i % 3) * 0.035, offset * 0.38),
      new THREE.Vector3(0.31, 0.24, -offset * 0.4),
      new THREE.Vector3(0.96, 0.075, offset),
    ]);
    const tube = finish(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.011, 8, false), surface(colors[i % colors.length], selected, 0.32, 0.03)));
    group.add(tube);
    box(group, [0.06, 0.035, 0.045], "#181d24", [-1.01, 0.055, offset], selected, 0.36, 0.05);
    box(group, [0.06, 0.035, 0.045], "#181d24", [0.99, 0.075, offset], selected, 0.36, 0.05);
  }
}

function addBoardStyle(group: THREE.Group, part: AssemblyPart, selected: boolean) {
  const [rawW, rawD] = part.dimensions;
  const w = rawW * MODEL_SCALE;
  const d = rawD * MODEL_SCALE;
  const t = board(group, w, d, part.color, selected);
  const top = t * 0.8;

  if (part.kind === "raspberry") {
    heatsink(group, w * 0.36, d * 0.42, selected, "#d0d5d6");
    chip(group, w * 0.22, d * 0.18, [w * 0.19, top + 0.04, -d * 0.07], selected, 7);
    header(group, -w * 0.44, 0, 20, true, selected, 0.028);
    usbPort(group, w * 0.4, -d * 0.25, selected, true);
    usbPort(group, w * 0.4, -d * 0.06, selected, true);
    box(group, [w * 0.17, 0.08, d * 0.17], "#c9ccd0", [w * 0.39, 0.04, d * 0.26], selected, 0.25, 0.78);
    capacitor(group, -w * 0.12, d * 0.25, selected, 0.027, 0.06);
    led(group, w * 0.13, d * 0.34, "#48d277", selected);
    led(group, w * 0.2, d * 0.34, "#f0b84b", selected);
  } else if (part.kind === "jetson") {
    heatsink(group, w * 0.66, d * 0.62, selected, "#1a1e23");
    box(group, [w * 0.52, 0.022, d * 0.48], "#384a42", [0, 0.14, 0], selected, 0.36, 0.08);
    header(group, -w * 0.44, 0, 18, true, selected, 0.027);
    header(group, w * 0.43, -d * 0.13, 8, false, selected, 0.03);
    usbPort(group, w * 0.35, d * 0.3, selected, true);
    capacitor(group, -w * 0.22, d * 0.28, selected, 0.028, 0.06);
  } else if (part.kind === "arduino") {
    chip(group, w * 0.26, d * 0.2, [0.02, top + 0.04, 0], selected, 8);
    header(group, -w * 0.43, 0, 14, true, selected, 0.03);
    header(group, w * 0.43, 0, 14, true, selected, 0.03);
    usbPort(group, -w * 0.35, d * 0.32, selected, true);
    box(group, [w * 0.16, 0.052, d * 0.16], "#121a21", [w * 0.33, 0.04, d * 0.3], selected, 0.35, 0.06);
    capacitor(group, -w * 0.15, -d * 0.28, selected, 0.024, 0.055);
    led(group, w * 0.17, -d * 0.3, "#f3cf4b", selected);
  } else if (part.kind === "esp32") {
    box(group, [w * 0.44, 0.032, d * 0.72], "#b8c0c4", [0, top + 0.026, 0], selected, 0.28, 0.72);
    box(group, [w * 0.36, 0.008, d * 0.13], "#d6d8d9", [0, top + 0.045, d * 0.35], false, 0.22, 0.68);
    header(group, -w * 0.44, 0, 15, true, selected, 0.027);
    header(group, w * 0.44, 0, 15, true, selected, 0.027);
    usbPort(group, 0, -d * 0.42, selected, false);
    led(group, w * 0.24, -d * 0.27, "#4ee070", selected);
  } else if (part.kind === "ultrasonic") {
    [-w * 0.23, w * 0.23].forEach((x) => {
      const transducer = cylinder(group, d * 0.23, d * 0.23, 0.052, "#aeb9bf", [x, 0.045, d * 0.12], selected, 28, 0.28, 0.76);
      transducer.rotation.x = Math.PI / 2;
      const core = cylinder(group, d * 0.17, d * 0.17, 0.056, "#4e5b63", [x, 0.045, d * 0.145], false, 28, 0.32, 0.42);
      core.rotation.x = Math.PI / 2;
    });
    header(group, 0, -d * 0.4, 4, false, selected, 0.044);
  } else if (part.kind === "soil") {
    box(group, [w * 0.56, 0.025, d * 0.38], "#233b36", [0, 0.02, d * 0.28], selected, 0.4, 0.08);
    [-w * 0.17, w * 0.17].forEach((x) => {
      box(group, [w * 0.12, 0.015, d * 1.85], "#cfac58", [x, 0.01, -d * 0.7], selected, 0.28, 0.55);
      box(group, [w * 0.035, 0.02, d * 1.78], "#f0cf7e", [x, 0.02, -d * 0.7], false, 0.25, 0.7);
    });
    header(group, 0, d * 0.37, 3, false, selected, 0.044);
  } else if (part.kind === "bme280") {
    chip(group, w * 0.34, d * 0.34, [0, top + 0.035, 0], selected, 5);
    box(group, [w * 0.18, 0.014, d * 0.18], "#c5bbc8", [w * 0.24, top + 0.025, -d * 0.22], false, 0.28, 0.42);
    header(group, 0, -d * 0.4, 4, false, selected, 0.042);
  } else if (part.kind === "camera") {
    box(group, [w * 0.62, 0.023, d * 0.2], "#aeb7bd", [0, 0.03, -d * 0.32], selected, 0.26, 0.76);
    cylinder(group, w * 0.24, w * 0.24, 0.12, "#151d25", [0, 0.075, 0.02], selected, 28, 0.28, 0.25);
    cylinder(group, w * 0.15, w * 0.15, 0.124, "#275b7e", [0, 0.08, 0.025], false, 28, 0.16, 0.5);
    box(group, [w * 0.72, 0.014, d * 0.1], "#d6d1bb", [0, 0.03, d * 0.38], false, 0.3, 0.55);
  } else if (part.kind === "lora") {
    box(group, [w * 0.46, 0.035, d * 0.48], "#b7bac0", [0, top + 0.03, 0], selected, 0.25, 0.72);
    header(group, -w * 0.39, 0, 8, true, selected, 0.032);
    antenna(group, w * 0.35, d * 0.34, selected, 0.38);
    chip(group, w * 0.18, d * 0.15, [w * 0.13, top + 0.03, -d * 0.23], selected, 4);
  } else if (part.kind === "gps") {
    box(group, [w * 0.62, 0.04, d * 0.62], "#ece9dc", [0, top + 0.034, 0], selected, 0.52, 0.02);
    chip(group, w * 0.18, d * 0.14, [w * 0.23, top + 0.03, -d * 0.26], selected, 4);
    header(group, -w * 0.39, 0, 4, true, selected, 0.044);
    antenna(group, w * 0.33, d * 0.25, selected, 0.26);
  } else if (part.kind === "relay") {
    [-w * 0.2, w * 0.2].forEach((x) => {
      box(group, [w * 0.28, 0.12, d * 0.36], "#1e5490", [x, 0.075, 0], selected, 0.32, 0.05);
      box(group, [w * 0.22, 0.012, d * 0.1], "#5579a1", [x, 0.14, -d * 0.06], false, 0.38, 0.08);
    });
    for (let i = 0; i < 3; i += 1) {
      box(group, [w * 0.12, 0.08, d * 0.16], "#63a979", [-w * 0.34 + i * w * 0.34, 0.05, d * 0.33], selected, 0.4, 0.05);
      cylinder(group, 0.017, 0.017, 0.009, "#d5d9db", [-w * 0.34 + i * w * 0.34, 0.096, d * 0.33], false, 16, 0.22, 0.75);
    }
    header(group, 0, -d * 0.4, 6, false, selected, 0.036);
  } else if (part.kind === "driver") {
    heatsink(group, w * 0.38, d * 0.62, selected, "#23282e");
    for (let i = 0; i < 2; i += 1) {
      box(group, [w * 0.18, 0.09, d * 0.16], "#45945d", [w * (i ? 0.32 : -0.32), 0.05, d * 0.33], selected, 0.4, 0.06);
      cylinder(group, 0.019, 0.019, 0.01, "#d5d9da", [w * (i ? 0.32 : -0.32), 0.103, d * 0.33], false, 16, 0.24, 0.75);
    }
    capacitor(group, -w * 0.25, -d * 0.28, selected, 0.03, 0.08);
    capacitor(group, w * 0.26, -d * 0.28, selected, 0.03, 0.08);
    header(group, 0, -d * 0.41, 6, false, selected, 0.034);
  } else if (part.kind === "buck") {
    cylinder(group, w * 0.15, w * 0.15, 0.06, "#252a31", [0, 0.05, 0], selected, 22, 0.3, 0.46);
    cylinder(group, w * 0.1, w * 0.1, 0.064, "#496e50", [0, 0.055, 0], false, 22, 0.3, 0.5);
    capacitor(group, -w * 0.27, d * 0.1, selected, 0.027, 0.075);
    capacitor(group, w * 0.27, d * 0.1, selected, 0.027, 0.075);
    for (let i = 0; i < 2; i += 1) box(group, [w * 0.15, 0.08, d * 0.2], "#3e985d", [w * (i ? 0.35 : -0.35), 0.047, -d * 0.28], selected, 0.4, 0.05);
  } else if (part.kind === "oled") {
    box(group, [w * 0.84, 0.018, d * 0.62], "#0e161f", [0, 0.025, 0], selected, 0.28, 0.08);
    box(group, [w * 0.68, 0.008, d * 0.44], "#347bce", [0, 0.04, 0], false, 0.18, 0.1);
    box(group, [w * 0.56, 0.006, d * 0.32], "#67d1f0", [0, 0.048, 0], false, 0.2, 0.14);
    header(group, 0, -d * 0.4, 4, false, selected, 0.042);
  } else if (part.kind === "terminal") {
    for (let i = 0; i < 3; i += 1) {
      const x = (i - 1) * w * 0.28;
      box(group, [w * 0.26, 0.1, d * 0.72], "#2e81bb", [x, 0.054, 0], selected, 0.36, 0.05);
      cylinder(group, d * 0.12, d * 0.12, 0.008, "#d5d9db", [x, 0.108, 0], false, 20, 0.18, 0.78);
    }
  }
}

function addStandaloneStyle(group: THREE.Group, part: AssemblyPart, selected: boolean) {
  const [rawW, rawD, rawH] = part.dimensions;
  const w = rawW * MODEL_SCALE;
  const d = rawD * MODEL_SCALE;
  const h = rawH * MODEL_SCALE;
  if (part.kind === "breadboard") {
    box(group, [w, h * 0.72, d], "#f0eee5", [0, 0, 0], selected, 0.62, 0.02);
    box(group, [w * 0.96, 0.008, d * 0.035], "#e95b54", [0, h * 0.42, -d * 0.37], false, 0.32, 0.06);
    box(group, [w * 0.96, 0.008, d * 0.035], "#397ccc", [0, h * 0.42, d * 0.37], false, 0.32, 0.06);
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 26; col += 1) {
        const x = -w * 0.45 + col * (w * 0.9 / 25);
        const z = -d * 0.22 + row * (d * 0.44 / 9);
        cylinder(group, 0.008, 0.008, 0.006, "#6c7073", [x, h * 0.39, z], false, 10, 0.26, 0.38);
      }
    }
    box(group, [w * 0.9, 0.006, d * 0.018], "#d6d5cf", [0, h * 0.405, 0], false, 0.45, 0.04);
  } else if (part.kind === "dht22") {
    box(group, [w, h, d], "#edf1f4", [0, 0, 0], selected, 0.48, 0.02);
    for (let line = 0; line < 5; line += 1) box(group, [w * 0.72, 0.008, d * 0.05], "#bcc4ca", [0, h * 0.53, -d * 0.23 + line * d * 0.12], false, 0.28, 0.48);
    for (let i = 0; i < 4; i += 1) box(group, [0.012, 0.06, 0.012], "#d1ad57", [-w * 0.28 + i * w * 0.19, -h * 0.7, 0], selected, 0.3, 0.7);
  } else if (part.kind === "servo") {
    box(group, [w * 0.78, h * 0.82, d], "#2c73b8", [0, 0, 0], selected, 0.36, 0.06);
    box(group, [w * 1.08, h * 0.12, d * 0.92], "#347fc3", [0, -h * 0.28, 0], selected, 0.38, 0.06);
    cylinder(group, w * 0.19, w * 0.19, h * 0.22, "#edf0ed", [0, h * 0.52, 0], selected, 22, 0.24, 0.28);
    cylinder(group, w * 0.06, w * 0.06, h * 0.27, "#d6dce0", [0, h * 0.67, 0], false, 16, 0.22, 0.72);
    box(group, [w * 0.72, h * 0.05, d * 0.13], "#eef0ed", [0, h * 0.79, 0], selected, 0.28, 0.22);
    const lead = new THREE.CatmullRomCurve3([new THREE.Vector3(-w * 0.35, -h * 0.25, 0), new THREE.Vector3(-w * 0.62, -h * 0.12, d * 0.3), new THREE.Vector3(-w * 0.78, -h * 0.32, d * 0.5)]);
    group.add(finish(new THREE.Mesh(new THREE.TubeGeometry(lead, 16, 0.009, 6, false), surface("#5a352c", selected, 0.35, 0.04))));
  } else if (part.kind === "pump") {
    const body = cylinder(group, d * 0.42, d * 0.42, w * 0.64, "#597f9d", [0, 0, 0], selected, 28, 0.34, 0.14); body.rotation.z = Math.PI / 2;
    const cap = cylinder(group, d * 0.26, d * 0.26, w * 0.14, "#314658", [w * 0.39, 0, 0], selected, 24, 0.3, 0.52); cap.rotation.z = Math.PI / 2;
    const outlet = cylinder(group, d * 0.13, d * 0.13, d * 0.44, "#d7dadd", [0, d * 0.43, 0], selected, 20, 0.28, 0.72); outlet.rotation.x = Math.PI / 2;
    box(group, [w * 0.08, h * 0.7, d * 0.18], "#1d2228", [-w * 0.35, 0, 0], selected, 0.36, 0.08);
  } else if (part.kind === "valve") {
    const pipe = cylinder(group, d * 0.24, d * 0.24, w * 0.92, "#a6b3ba", [0, 0, 0], selected, 28, 0.28, 0.7); pipe.rotation.z = Math.PI / 2;
    box(group, [w * 0.34, h * 0.55, d * 0.62], "#47525e", [0, h * 0.22, 0], selected, 0.34, 0.3);
    cylinder(group, d * 0.23, d * 0.23, h * 0.5, "#29343d", [0, h * 0.67, 0], selected, 22, 0.3, 0.34);
    [-w * 0.5, w * 0.5].forEach((x) => { const collar = cylinder(group, d * 0.34, d * 0.34, w * 0.1, "#7e8c94", [x, 0, 0], false, 24, 0.3, 0.66); collar.rotation.z = Math.PI / 2; });
  } else if (part.kind === "battery") {
    box(group, [w, h, d], "#3f4851", [0, 0, 0], selected, 0.38, 0.14);
    box(group, [w * 0.82, 0.008, d * 0.66], "#202830", [0, h * 0.53, 0], false, 0.32, 0.06);
    box(group, [w * 0.32, 0.012, d * 0.1], "#f1f3f2", [0, h * 0.55, 0], false, 0.26, 0.2);
    cylinder(group, w * 0.075, w * 0.075, h * 0.22, "#d54e42", [w * 0.26, h * 0.58, -d * 0.26], selected, 18, 0.24, 0.72);
    cylinder(group, w * 0.075, w * 0.075, h * 0.22, "#1f2429", [-w * 0.26, h * 0.58, -d * 0.26], selected, 18, 0.24, 0.72);
  } else if (part.kind === "solar") {
    box(group, [w, h * 0.55, d], "#1a2026", [0, 0, 0], selected, 0.34, 0.26);
    box(group, [w * 0.91, 0.012, d * 0.91], "#17477f", [0, h * 0.34, 0], false, 0.18, 0.18);
    for (let i = 1; i < 6; i += 1) box(group, [0.008, 0.016, d * 0.86], "#78a3c5", [-w * 0.37 + i * w * 0.148, h * 0.355, 0], false, 0.3, 0.5);
    for (let i = 1; i < 4; i += 1) box(group, [w * 0.86, 0.016, 0.008], "#78a3c5", [0, h * 0.355, -d * 0.28 + i * d * 0.18], false, 0.3, 0.5);
  }
}

/** Creates an exportable product-style group, centred on the caller’s placement origin. */
export function createComponentModel(part: AssemblyPart, options: ModelOptions = {}) {
  const group = new THREE.Group();
  const selected = Boolean(options.selected);
  if (part.kind === "cables") addCables(group, part, selected);
  else if (["breadboard", "dht22", "servo", "pump", "valve", "battery", "solar"].includes(part.kind)) addStandaloneStyle(group, part, selected);
  else addBoardStyle(group, part, selected);
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) object.userData.partId = part.id;
  });
  group.userData.partId = part.id;
  group.name = part.name;
  return group;
}
