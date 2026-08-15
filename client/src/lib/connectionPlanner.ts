/**
 * Circuit Forge 3D — deterministic connection-choice planner.
 * Design reminder: routes are functional reference paths, never certified pinouts or wiring instructions.
 */
import type { AssemblyPart, ComponentKind } from "@/lib/prototypeCatalog";

export type ConnectionClass = "power" | "data" | "control" | "wireless" | "host";
export type ExternalMode = "usb-pc" | "ethernet-pc" | "wifi-phone" | "wifi-phone-pc" | "wifi-network" | "none";
export type SoilRouteMode = "digital-gpio" | "analog-adc";
export type LoraRouteMode = "spi" | "uart";

export type ConnectionPreferences = { soilMode: SoilRouteMode; loraMode: LoraRouteMode };

export type ConnectionRoute = {
  id: string;
  fromId: string;
  toId: string;
  connectionClass: ConnectionClass;
  label: string;
  medium: string;
  verification: string;
};

export type ConnectionAlert = { severity: "warning" | "blocker"; title: string; detail: string };

export type ConnectionOption = {
  mode: ExternalMode;
  title: string;
  shortTitle: string;
  detail: string;
  requirement: string;
  available: boolean;
};

export type ConnectionPlan = {
  routes: ConnectionRoute[];
  alerts: ConnectionAlert[];
  mode: ExternalMode;
  modeTitle: string;
};

const sensorKinds: ComponentKind[] = ["ultrasonic", "dht22", "soil", "bme280"];
const actuatorKinds: ComponentKind[] = ["servo", "relay", "driver", "pump", "valve"];
const controllerKinds: ComponentKind[] = ["raspberry", "jetson", "arduino", "esp32"];

const route = (id: string, fromId: string, toId: string, connectionClass: ConnectionClass, label: string, medium: string, verification: string): ConnectionRoute => ({ id, fromId, toId, connectionClass, label, medium, verification });
const findFirst = (parts: AssemblyPart[], kinds: ComponentKind[]) => parts.find((part) => kinds.includes(part.kind));
const findAll = (parts: AssemblyPart[], kinds: ComponentKind[]) => parts.filter((part) => kinds.includes(part.kind));

function sensorRouteLabel(kind: ComponentKind, soilMode: SoilRouteMode) {
  if (kind === "bme280") return ["ENVIRONMENT DATA", "I²C reference bus"] as const;
  if (kind === "soil") return soilMode === "analog-adc" ? ["SOIL READING", "Analog signal → verified ADC stage"] as const : ["SOIL READING", "Digital threshold output → GPIO"] as const;
  if (kind === "ultrasonic") return ["RANGE SIGNAL", "GPIO trigger / echo reference"] as const;
  return ["SENSOR SIGNAL", "Digital data reference"] as const;
}

function controllerForCamera(parts: AssemblyPart[]) { return findFirst(parts, ["raspberry", "jetson"]); }

export function getConnectionOptions(parts: AssemblyPart[]): ConnectionOption[] {
  const hasEsp = Boolean(findFirst(parts, ["esp32"]));
  const hasUsb = Boolean(findFirst(parts, ["arduino", "esp32", "jetson"]));
  const hasEthernet = Boolean(findFirst(parts, ["raspberry", "jetson"]));
  const hasWifiNode = Boolean(findFirst(parts, ["esp32", "raspberry", "jetson"]));
  return [
    { mode: "wifi-phone", title: "Phone on local Wi‑Fi", shortTitle: "PHONE / LOCAL WI‑FI", detail: "A phone or tablet joins a local ESP32 access point.", requirement: "Requires ESP32", available: hasEsp },
    { mode: "wifi-phone-pc", title: "Phone + PC on local Wi‑Fi", shortTitle: "PHONE + PC / LOCAL WI‑FI", detail: "Phone and computer use the same local ESP32 access point.", requirement: "Requires ESP32", available: hasEsp },
    { mode: "wifi-network", title: "Phone + PC through Wi‑Fi", shortTitle: "SHARED WI‑FI NETWORK", detail: "Prototype joins an existing network for phone and PC access.", requirement: "Requires ESP32, Raspberry Pi, or Jetson", available: hasWifiNode },
    { mode: "usb-pc", title: "PC through USB / serial", shortTitle: "PC / USB OR SERIAL", detail: "A computer programs, logs, or exchanges data through a USB-capable board.", requirement: "Requires Arduino, ESP32, or Jetson", available: hasUsb },
    { mode: "ethernet-pc", title: "PC through Ethernet", shortTitle: "PC / ETHERNET", detail: "A computer reaches the prototype over a wired lab network.", requirement: "Requires Raspberry Pi or Jetson", available: hasEthernet },
    { mode: "none", title: "No external device", shortTitle: "OFFLINE ONLY", detail: "The prototype runs locally with no phone or computer route in this version.", requirement: "Always available", available: true },
  ];
}

export function buildConnectionPlan(
  parts: AssemblyPart[],
  mode: ExternalMode,
  preferredControllerId?: string,
  preferences: ConnectionPreferences = { soilMode: "digital-gpio", loraMode: "spi" },
): ConnectionPlan {
  const routes: ConnectionRoute[] = [];
  const alerts: ConnectionAlert[] = [];
  const preferredController = preferredControllerId ? parts.find((part) => part.id === preferredControllerId && controllerKinds.includes(part.kind)) : undefined;
  const controller = preferredController ?? findFirst(parts, controllerKinds);
  const powerSource = findFirst(parts, ["buck", "battery"]);
  const battery = findFirst(parts, ["battery"]);
  const solar = findFirst(parts, ["solar"]);
  const buck = findFirst(parts, ["buck"]);
  const relayOrDriver = findFirst(parts, ["relay", "driver"]);
  const terminal = findFirst(parts, ["terminal"]);

  if (!controller && parts.some((part) => sensorKinds.includes(part.kind) || actuatorKinds.includes(part.kind))) alerts.push({ severity: "blocker", title: "Choose a control brain", detail: "Add or select an ESP32, Arduino, Raspberry Pi, or Jetson before mapping the rest of the system." });
  if (solar && !battery) alerts.push({ severity: "blocker", title: "Add a solar power stage", detail: "Choose a battery and verified charge-control path before treating a solar panel as a system supply." });

  if (battery && buck) routes.push(route("battery-to-buck", battery.id, buck.id, "power", "POWER CONDITIONING", "Battery → DC-DC converter", "Verify input range, polarity, fuse, and output voltage."));
  if (controller && powerSource) {
    const source = buck ?? powerSource;
    routes.push(route(`power-${source.id}-${controller.id}`, source.id, controller.id, "power", "CONTROLLER POWER", "Regulated low-voltage supply", "Use the board’s approved power input and verify the supply rating."));
  }
  if (terminal && powerSource) routes.push(route(`power-${powerSource.id}-${terminal.id}`, powerSource.id, terminal.id, "power", "POWER DISTRIBUTION", "Low-voltage terminal point", "Verify conductor gauge, polarity marking, and enclosure clearance."));

  findAll(parts, sensorKinds).forEach((sensor) => {
    if (!controller) return;
    const [label, medium] = sensorRouteLabel(sensor.kind, preferences.soilMode);
    if (sensor.kind === "soil" && preferences.soilMode === "analog-adc" && ["raspberry", "jetson"].includes(controller.kind)) {
      routes.push(route(`soil-${sensor.id}-adc`, sensor.id, "adapter-adc", "data", label, medium, "Select a compatible external ADC, then verify its bus, voltage range, and input protection."));
      routes.push(route(`adc-${controller.id}`, "adapter-adc", controller.id, "data", "ADC TO CONTROLLER", "I²C/SPI reference bridge", "Verify converter type, logic level, address, and board documentation."));
      return;
    }
    routes.push(route(`sensor-${sensor.id}-${controller.id}`, sensor.id, controller.id, "data", label, medium, "Confirm the exact pin, signal level, pull-up needs, and datasheet wiring."));
  });

  const camera = findFirst(parts, ["camera"]);
  if (camera) {
    const cameraHost = controllerForCamera(parts);
    if (cameraHost) routes.push(route(`camera-${camera.id}-${cameraHost.id}`, camera.id, cameraHost.id, "data", "CAMERA DATA", "CSI / ribbon reference link", "Verify camera compatibility, connector orientation, and ribbon clearance."));
    else alerts.push({ severity: "blocker", title: "Choose a camera host", detail: "Add a Raspberry Pi or Jetson and verify the exact camera model before treating this vision link as resolved." });
  }

  ["lora", "gps", "oled"].forEach((kind) => {
    const peripheral = findFirst(parts, [kind as ComponentKind]);
    if (!peripheral || !controller) return;
    const labels: Record<string, readonly [string, string]> = {
      lora: ["RADIO DATA", preferences.loraMode === "spi" ? "SPI reference link" : "UART reference link"],
      gps: ["POSITION DATA", "UART reference link"],
      oled: ["STATUS DISPLAY", "I²C reference link"],
    };
    const [label, medium] = labels[kind];
    routes.push(route(`${kind}-${peripheral.id}-${controller.id}`, peripheral.id, controller.id, "data", label, medium, "Verify the exact bus, address, antenna clearance, and logic level."));
  });

  if (controller) {
    const esp = findFirst(parts, ["esp32"]);
    if (esp && esp.id !== controller.id) routes.push(route(`controller-${controller.id}-${esp.id}`, controller.id, esp.id, "data", "EDGE LINK", "UART or local-network bridge", "Choose one transport deliberately; verify framing, ground reference, and software protocol."));
  }

  findAll(parts, ["servo", "relay", "driver"]).forEach((actuator) => {
    if (!controller) return;
    const medium = actuator.kind === "servo" ? "PWM control reference" : "GPIO control reference";
    routes.push(route(`control-${controller.id}-${actuator.id}`, controller.id, actuator.id, "control", "ACTUATOR CONTROL", medium, "Never power motors, pumps, or valves from an unverified controller pin."));
  });
  findAll(parts, ["pump", "valve"]).forEach((load) => {
    if (relayOrDriver) routes.push(route(`load-${relayOrDriver.id}-${load.id}`, relayOrDriver.id, load.id, "control", "SWITCHED LOAD", "Relay / driver output → load", "Verify load voltage, current, flyback protection, and water-safe routing."));
    else alerts.push({ severity: "blocker", title: `Choose a switching stage for ${load.shortName}`, detail: "Add a suitable relay or driver before treating this load as connected." });
    if (powerSource) routes.push(route(`load-power-${powerSource.id}-${load.id}`, powerSource.id, load.id, "power", "LOAD POWER", "Separate low-voltage load rail", "Verify source capacity, fuse protection, connector rating, and isolation from control logic."));
  });
  const servo = findFirst(parts, ["servo"]);
  if (servo && powerSource) routes.push(route(`servo-power-${powerSource.id}-${servo.id}`, powerSource.id, servo.id, "power", "SERVO POWER", "Separate regulated actuator rail", "Verify stall-current capacity and a common ground strategy before powering."));

  let modeTitle = "OFFLINE SYSTEM";
  const esp = findFirst(parts, ["esp32"]);
  const wifiNode = findFirst(parts, ["esp32", "raspberry", "jetson"]);
  const usbHost = findFirst(parts, ["arduino", "esp32", "jetson"]);
  const ethernetHost = findFirst(parts, ["raspberry", "jetson"]);
  if (mode === "wifi-phone") {
    modeTitle = "PHONE / LOCAL WI‑FI";
    if (esp) routes.push(route(`phone-${esp.id}`, esp.id, "external-phone", "wireless", "PHONE LINK", "ESP32 local access point", "Set credentials, access control, and a deliberate phone interface before demo use."));
    else alerts.push({ severity: "blocker", title: "Add ESP32 for local phone Wi‑Fi", detail: "Choose another external-link method or add ESP32 to create the local access-point scenario." });
  }
  if (mode === "wifi-phone-pc") {
    modeTitle = "PHONE + PC / LOCAL WI‑FI";
    if (esp) {
      routes.push(route(`phone-${esp.id}`, esp.id, "external-phone", "wireless", "PHONE LINK", "ESP32 local access point", "Set credentials, access control, and a deliberate phone interface before demo use."));
      routes.push(route(`pc-local-${esp.id}`, esp.id, "external-pc", "wireless", "PC LINK", "ESP32 local access point", "Confirm the computer uses the same local network and test the chosen service."));
    } else alerts.push({ severity: "blocker", title: "Add ESP32 for local device Wi‑Fi", detail: "This mode needs an ESP32 reference node to create the local phone and computer network." });
  }
  if (mode === "wifi-network") {
    modeTitle = "PHONE + PC / SHARED WI‑FI";
    if (wifiNode) routes.push(route(`network-${wifiNode.id}`, wifiNode.id, "external-network", "wireless", "NETWORK LINK", "Wi‑Fi station → existing access point", "Configure network credentials, service access, and offline behaviour deliberately."));
    else alerts.push({ severity: "blocker", title: "Choose a Wi‑Fi node", detail: "Add ESP32, Raspberry Pi, or Jetson before selecting a shared-network link." });
  }
  if (mode === "usb-pc") {
    modeTitle = "PC / USB OR SERIAL";
    if (usbHost) routes.push(route(`pc-${usbHost.id}`, usbHost.id, "external-pc", "host", "PC LINK", "USB data / programming reference", "Verify connector, cable specification, board power role, drivers, and serial settings."));
    else alerts.push({ severity: "blocker", title: "Choose a USB-capable board", detail: "Add Arduino, ESP32, or Jetson for the PC USB / serial scenario." });
  }
  if (mode === "ethernet-pc") {
    modeTitle = "PC / ETHERNET";
    if (ethernetHost) routes.push(route(`ethernet-${ethernetHost.id}`, ethernetHost.id, "external-pc", "host", "PC LINK", "Ethernet / lab-network reference", "Verify network policy, IP allocation, cable path, service configuration, and access control."));
    else alerts.push({ severity: "blocker", title: "Choose an Ethernet-capable board", detail: "Add Raspberry Pi or Jetson for the wired PC/network scenario." });
  }

  return { routes, alerts, mode, modeTitle };
}
