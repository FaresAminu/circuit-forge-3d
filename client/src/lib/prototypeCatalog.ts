/**
 * Circuit Forge 3D — local component catalogue and zoning engine.
 * Design reminder: component envelopes are nominal teaching references, never manufacturer CAD.
 */
export type ComponentKind =
  | "raspberry" | "jetson" | "arduino" | "esp32" | "breadboard"
  | "ultrasonic" | "dht22" | "soil" | "bme280" | "camera"
  | "lora" | "gps" | "servo" | "relay" | "driver" | "pump" | "valve"
  | "battery" | "solar" | "buck" | "oled" | "terminal" | "cables";

export type PlacementZone = "core" | "sensing" | "power" | "actuation" | "communications" | "interface" | "connections";

export type ComponentDefinition = {
  kind: ComponentKind;
  name: string;
  shortName: string;
  category: string;
  zone: PlacementZone;
  aliases: string[];
  dimensions: [number, number, number];
  color: string;
  description: string;
  defaultQuantity?: number;
};

export type AssemblyPart = ComponentDefinition & {
  id: string;
  quantity: number;
  position: [number, number, number];
};

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  { kind: "raspberry", name: "Raspberry Pi 4", shortName: "Raspberry Pi 4", category: "Controller", zone: "core", aliases: ["raspberry pi", "raspberry pi 4", "rpi", "pi 4", "راسبيري"], dimensions: [85, 56, 18], color: "#2f8b57", description: "Nominal board envelope with ports and GPIO ridge." },
  { kind: "jetson", name: "NVIDIA Jetson Nano module", shortName: "Jetson Nano", category: "Edge AI", zone: "core", aliases: ["jetson", "jetson nano", "nvidia jetson", "nvidia nano", "جيتسون"], dimensions: [70, 45, 18], color: "#20242b", description: "Simplified module envelope with cooling volume." },
  { kind: "arduino", name: "Arduino Uno", shortName: "Arduino Uno", category: "Controller", zone: "core", aliases: ["arduino", "arduino uno", "اردوينو"], dimensions: [69, 54, 16], color: "#1598a0", description: "Board envelope with USB block and headers." },
  { kind: "esp32", name: "ESP32 development board", shortName: "ESP32", category: "Wireless", zone: "core", aliases: ["esp32", "esp 32", "esp"], dimensions: [55, 28, 12], color: "#3b4353", description: "Wireless board envelope with antenna end." },
  { kind: "breadboard", name: "Breadboard", shortName: "Breadboard", category: "Prototype surface", zone: "core", aliases: ["breadboard", "bread board", "protoboard", "لوحة تجارب"], dimensions: [165, 55, 10], color: "#efeee6", description: "Half-size breadboard reference surface." },
  { kind: "ultrasonic", name: "HC-SR04 ultrasonic sensor", shortName: "Ultrasonic sensor", category: "Sensor", zone: "sensing", aliases: ["ultrasonic", "hc-sr04", "hc sr04", "distance sensor", "ultrasound", "حساس الموجات"], dimensions: [45, 20, 18], color: "#1e78c7", description: "Sensor board with two transducer volumes." },
  { kind: "dht22", name: "DHT22 sensor", shortName: "DHT22", category: "Sensor", zone: "sensing", aliases: ["dht22", "dht 22", "temperature humidity", "humidity sensor", "dht"], dimensions: [28, 15, 8], color: "#edf0f4", description: "Temperature and humidity sensor envelope." },
  { kind: "soil", name: "Soil moisture probe", shortName: "Soil probe", category: "Sensor", zone: "sensing", aliases: ["soil moisture", "soil sensor", "moisture probe", "capteur de sol", "رطوبة التربة"], dimensions: [60, 20, 7], color: "#6c4a2f", description: "Probe fork and small controller board." },
  { kind: "bme280", name: "BME280 environmental module", shortName: "BME280", category: "Sensor", zone: "sensing", aliases: ["bme280", "bme 280", "environmental sensor", "pressure sensor"], dimensions: [25, 22, 7], color: "#8657bf", description: "Breakout reference for temperature, humidity and pressure sensing." },
  { kind: "camera", name: "Raspberry Pi camera module", shortName: "Pi Camera", category: "Vision", zone: "sensing", aliases: ["raspberry pi camera", "pi camera", "camera module", "camera", "caméra"], dimensions: [25, 24, 12], color: "#20242b", description: "Camera board reference with lens and ribbon clearance." },
  { kind: "lora", name: "LoRa radio module", shortName: "LoRa radio", category: "Wireless", zone: "communications", aliases: ["lora", "lo ra", "sx1278", "long range radio"], dimensions: [36, 25, 8], color: "#7d4a25", description: "Long-range radio breakout with antenna clearance." },
  { kind: "gps", name: "GPS positioning module", shortName: "GPS module", category: "Wireless", zone: "communications", aliases: ["gps", "neo-6m", "neo 6m", "position module"], dimensions: [35, 25, 10], color: "#2c78b8", description: "Positioning board reference with ceramic antenna volume." },
  { kind: "servo", name: "Micro servo motor", shortName: "Servo motor", category: "Actuation", zone: "actuation", aliases: ["servo", "servo motor", "micro servo", "servomoteur", "محرك سيرفو"], dimensions: [41, 20, 38], color: "#2f75ba", description: "Body, shaft, and horn reference geometry." },
  { kind: "relay", name: "2-channel relay module", shortName: "Relay module", category: "Switching", zone: "actuation", aliases: ["relay", "relay module", "2 channel relay", "relais"], dimensions: [50, 40, 18], color: "#216c8e", description: "Low-voltage switching board reference, not a mains wiring plan." },
  { kind: "driver", name: "L298N motor driver", shortName: "Motor driver", category: "Actuation", zone: "actuation", aliases: ["l298n", "motor driver", "driver board", "h bridge"], dimensions: [44, 43, 20], color: "#c74337", description: "Motor-control board envelope with heat-sink volume." },
  { kind: "pump", name: "Mini DC water pump", shortName: "Water pump", category: "Actuation", zone: "actuation", aliases: ["water pump", "mini pump", "dc pump", "pump", "pompe"], dimensions: [50, 32, 34], color: "#567f9d", description: "Generic low-voltage pump body with hose outlet reference." },
  { kind: "valve", name: "Solenoid valve", shortName: "Solenoid valve", category: "Actuation", zone: "actuation", aliases: ["solenoid valve", "valve", "electrovalve", "électrovanne"], dimensions: [65, 38, 48], color: "#47525e", description: "Generic water-control valve envelope with port clearance." },
  { kind: "battery", name: "Battery pack", shortName: "Battery pack", category: "Power", zone: "power", aliases: ["battery", "battery pack", "power bank", "power supply", "batterie", "بطارية"], dimensions: [70, 35, 20], color: "#404850", description: "Generic low-voltage pack envelope." },
  { kind: "solar", name: "Solar panel", shortName: "Solar panel", category: "Power", zone: "power", aliases: ["solar", "solar panel", "pv panel", "panneau solaire"], dimensions: [110, 70, 8], color: "#173f72", description: "Small panel reference with active-cell grid." },
  { kind: "buck", name: "DC-DC buck converter", shortName: "Buck converter", category: "Power", zone: "power", aliases: ["buck converter", "dc dc", "step down", "lm2596", "converter"], dimensions: [44, 22, 11], color: "#206d5a", description: "Low-voltage regulator module envelope." },
  { kind: "oled", name: "OLED status display", shortName: "OLED display", category: "Interface", zone: "interface", aliases: ["oled", "oled display", "display", "screen", "écran"], dimensions: [28, 28, 8], color: "#17212b", description: "Small status display board and viewing window." },
  { kind: "terminal", name: "Terminal block", shortName: "Terminal block", category: "Connections", zone: "connections", aliases: ["terminal block", "terminal", "screw terminal", "bornier"], dimensions: [28, 16, 14], color: "#3c83b8", description: "Connection point reference for low-voltage assemblies." },
  { kind: "cables", name: "Jumper cables", shortName: "Jumper cables", category: "Connections", zone: "connections", aliases: ["cable", "cables", "wire", "wires", "jumper", "jumper cables", "fil", "fils", "câble", "كابل"], dimensions: [120, 4, 4], color: "#f0503f", description: "Illustrative connection paths; not an electrical schematic.", defaultQuantity: 6 },
];

const normalise = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function cableQuantity(text: string) {
  const match = normalise(text).match(/(\d{1,2})\s*(?:jumper|cable|wire|fil)/);
  return match ? Math.max(1, Math.min(24, Number(match[1]))) : 6;
}

export function parseMaterialsPrompt(prompt: string): ComponentDefinition[] {
  const source = normalise(prompt);
  const raspberryBoardRequested = /(?:raspberry\s*pi(?:\s*4)?(?!\s*camera)|\brpi\b|\bpi\s*4\b)/.test(source);
  return COMPONENT_CATALOG.filter((component) => {
    if (component.kind === "raspberry" && !raspberryBoardRequested) return false;
    return component.aliases.some((alias) => source.includes(normalise(alias)));
  });
}

const ZONE_POSITIONS: Record<Exclude<PlacementZone, "core" | "connections">, [number, number, number][]> = {
  sensing: [[-100, 48, 8], [-62, 70, 8], [-10, 78, 8], [48, 70, 8], [100, 48, 8]],
  power: [[-56, -92, 8], [20, -96, 8], [88, -88, 8]],
  actuation: [[106, -48, 10], [112, 2, 10], [105, 53, 12], [76, 82, 11]],
  communications: [[-106, -66, 8], [-106, -16, 8], [-100, 18, 8]],
  interface: [[55, 88, 8], [10, 92, 8]],
};

const CORE_POSITIONS: [number, number, number][] = [[-62, 28, 9], [60, 28, 9], [-60, -35, 9], [58, -35, 9]];

export function buildAssembly(components: ComponentDefinition[], prompt: string): AssemblyPart[] {
  const zoneCounts: Record<PlacementZone, number> = { core: 0, sensing: 0, power: 0, actuation: 0, communications: 0, interface: 0, connections: 0 };
  return components.map((component, index) => {
    const zoneIndex = zoneCounts[component.zone]++;
    let position: [number, number, number];
    if (component.kind === "cables") position = [0, -8, 16];
    else if (component.kind === "breadboard") position = [0, 0, 5];
    else if (component.zone === "core") position = CORE_POSITIONS[zoneIndex % CORE_POSITIONS.length];
    else if (component.zone === "connections") position = [-20 + zoneIndex * 38, -18, 10];
    else {
      const slots = ZONE_POSITIONS[component.zone];
      const base = slots[zoneIndex % slots.length];
      const overflow = Math.floor(zoneIndex / slots.length);
      position = [base[0] + overflow * 20, base[1] + overflow * 18, base[2]];
    }
    return { ...component, id: `${component.kind}-${index + 1}`, quantity: component.kind === "cables" ? cableQuantity(prompt) : 1, position };
  });
}

export function estimateEnvelope(parts: AssemblyPart[]) {
  const physicalParts = parts.filter((part) => part.kind !== "cables");
  const width = Math.max(180, ...physicalParts.map((part) => part.dimensions[0] + Math.abs(part.position[0]) * 2)) + 16;
  const depth = Math.max(130, ...physicalParts.map((part) => part.dimensions[1] + Math.abs(part.position[1]) * 1.5)) + 16;
  const height = Math.max(55, ...physicalParts.map((part) => part.dimensions[2])) + 12;
  return { width: Math.round(width), depth: Math.round(depth), height: Math.round(height) };
}

export function buildOpenScad(parts: AssemblyPart[], projectName: string) {
  const envelope = estimateEnvelope(parts);
  const safeName = projectName.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") || "prototype";
  const body = parts.map((part) => {
    const [width, depth, height] = part.dimensions;
    const [x, y, z] = part.position;
    if (part.kind === "cables") return `// ${part.quantity} illustrative jumper cable(s)\nfor (i = [0:${part.quantity - 1}]) translate([${x - 34} + i*10, ${y}, ${z + 10}]) rotate([0,90,0]) color("${part.color}") cylinder(h=44, r=1.2, $fn=16);`;
    return `// ${part.name} — nominal reference envelope\ntranslate([${x}, ${y}, ${z + height / 2}]) color("${part.color}") cube([${width}, ${depth}, ${height}], center=true);`;
  }).join("\n\n");
  return `// CIRCUIT FORGE 3D — ${safeName}\n// Reference geometry only. Verify datasheets, hole patterns, thermal clearances, voltage and wiring before fabrication.\n// Units: millimetres\n\n$fn = 32;\n\n// Transparent enclosure shell: ${envelope.width} × ${envelope.depth} × ${envelope.height} mm\ncolor([0.14, 0.34, 1.0, 0.12]) difference() {\n  translate([0, 0, ${envelope.height / 2}]) cube([${envelope.width}, ${envelope.depth}, ${envelope.height}], center=true);\n  translate([0, 0, ${envelope.height / 2 + 2}]) cube([${envelope.width - 6}, ${envelope.depth - 6}, ${envelope.height}], center=true);\n}\n\n${body}\n`;
}
