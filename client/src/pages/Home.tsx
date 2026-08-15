/**
 * Circuit Forge 3D — industrial maker-lab interface.
 * Design reminder: the 3D workbench is primary; all geometry is transparent reference geometry.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Cable,
  ChevronDown,
  CircleHelp,
  Cpu,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  Focus,
  ImageDown,
  LayoutGrid,
  Laptop,
  Layers3,
  Maximize2,
  Orbit,
  PackageCheck,
  Plus,
  Rotate3D,
  Ruler,
  ScanSearch,
  Sparkles,
  Smartphone,
  Usb,
  Wifi,
  Zap,
} from "lucide-react";
import { PrototypeScene, type PrototypeSceneHandle } from "@/components/PrototypeScene";
import { SystemScene, type SystemSceneHandle } from "@/components/SystemScene";
import { buildConnectionPlan, getConnectionOptions, type ConnectionClass, type ExternalMode, type LoraRouteMode, type SoilRouteMode } from "@/lib/connectionPlanner";
import {
  buildAssembly,
  buildOpenScad,
  estimateEnvelope,
  parseMaterialsPrompt,
  type AssemblyPart,
} from "@/lib/prototypeCatalog";

const DEFAULT_PROMPT = "Raspberry Pi 4, breadboard, Raspberry Pi camera, BME280, DHT22, soil moisture probe, LoRa radio, relay, water pump, solar panel, battery pack and 12 jumper cables.";

const QUICK_ADD_GROUPS = [
  { label: "CORE / BUILD", parts: ["Raspberry Pi 4", "Jetson Nano", "Arduino Uno", "ESP32", "breadboard"] },
  { label: "SENSE / SEE", parts: ["ultrasonic sensor", "DHT22", "soil sensor", "BME280", "Raspberry Pi camera", "LoRa radio", "GPS module"] },
  { label: "POWER / ACT", parts: ["battery pack", "solar panel", "buck converter", "relay", "motor driver", "water pump", "servo", "solenoid valve", "12 jumper cables"] },
];

function downloadText(text: string, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const initialParts = useMemo(() => buildAssembly(parseMaterialsPrompt(DEFAULT_PROMPT), DEFAULT_PROMPT), []);
  const [parts, setParts] = useState<AssemblyPart[]>(initialParts);
  const [selectedId, setSelectedId] = useState<string | null>(initialParts[0]?.id ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [connectionMode, setConnectionMode] = useState<ExternalMode>("wifi-network");
  const [soilMode, setSoilMode] = useState<SoilRouteMode>("digital-gpio");
  const [loraMode, setLoraMode] = useState<LoraRouteMode>("spi");
  const [preferredControllerId, setPreferredControllerId] = useState<string | undefined>(initialParts.find((part) => ["raspberry", "jetson", "arduino", "esp32"].includes(part.kind))?.id);
  const sceneRef = useRef<PrototypeSceneHandle>(null);
  const systemSceneRef = useRef<SystemSceneHandle>(null);
  const envelope = useMemo(() => estimateEnvelope(parts), [parts]);
  const selectedPart = parts.find((part) => part.id === selectedId) ?? null;
  const controllerCandidates = useMemo(() => parts.filter((part) => ["raspberry", "jetson", "arduino", "esp32"].includes(part.kind)), [parts]);
  const activeControllerId = controllerCandidates.some((part) => part.id === preferredControllerId) ? preferredControllerId : controllerCandidates[0]?.id;
  const connectionPlan = useMemo(() => buildConnectionPlan(parts, connectionMode, activeControllerId, { soilMode, loraMode }), [parts, connectionMode, activeControllerId, soilMode, loraMode]);
  const connectionOptions = useMemo(() => getConnectionOptions(parts), [parts]);
  const connectionClassLabel: Record<ConnectionClass, string> = { power: "POWER", data: "DATA", control: "CONTROL", wireless: "WIRELESS", host: "HOST" };

  useEffect(() => {
    const current = connectionOptions.find((option) => option.mode === connectionMode);
    if (!current?.available) setConnectionMode(connectionOptions.find((option) => option.available)?.mode ?? "none");
  }, [connectionMode, connectionOptions]);

  const generateAssembly = useCallback(() => {
    const matched = parseMaterialsPrompt(prompt);
    if (!matched.length) {
      toast.error("No supported components found yet.", { description: "Try Raspberry Pi, Jetson, Arduino, ESP32, sensor, pump, solar, breadboard, battery, or cables." });
      return;
    }
    setIsGenerating(true);
    window.setTimeout(() => {
      const nextParts = buildAssembly(matched, prompt);
      setParts(nextParts);
      setSelectedId(nextParts[0]?.id ?? null);
      setPreferredControllerId(nextParts.find((part) => ["raspberry", "jetson", "arduino", "esp32"].includes(part.kind))?.id);
      setIsGenerating(false);
      toast.success(`${nextParts.length} component types organised into functional zones.`);
    }, 420);
  }, [prompt]);

  const addSuggestion = (suggestion: string) => {
    setPrompt((current) => (current.trim() ? `${current.replace(/[.\s]*$/, "")}, ${suggestion}.` : suggestion));
  };

  const organiseAssembly = () => {
    const matched = parseMaterialsPrompt(prompt);
    if (!matched.length) {
      toast.error("Add at least one supported part before arranging.");
      return;
    }
    const arranged = buildAssembly(matched, prompt);
    setParts(arranged);
    setSelectedId(arranged[0]?.id ?? null);
    toast.success("Assembly organised by function.", { description: "Core, sensing, power, actuation and communication zones are separated." });
  };

  const exportScad = () => {
    downloadText(buildOpenScad(parts, "student-prototype"), "circuit-forge-prototype.scad");
    toast.success("OpenSCAD source downloaded.", { description: "Adjust clearances and verify dimensions before fabrication." });
  };

  return (
    <div className="forge-shell">
      <header className="forge-topbar">
        <a className="forge-brand" href="#top" aria-label="Circuit Forge 3D prototype studio">
          <img src="/manus-storage/circuit-forge-logo_3f996f6b.png" alt="Circuit Forge 3D calibration cube mark" />
          <span><strong>CIRCUIT<br />FORGE</strong><em>3D // PROTOTYPE LAB</em></span>
        </a>
        <div className="institution-provenance"><img src="/manus-storage/esas-eloued-official-logo_33492011.webp" alt="" /><span>INCUBATEUR DE L’ÉCOLE SUPÉRIEURE<br />D’AGRICULTURE SAHARIENNE — EL OUED</span></div>
        <div className="topbar-status"><span className="status-dot" /> LOCAL GEOMETRY · NO PROMPT LEAVES YOUR BROWSER</div>
        <div className="topbar-tools">
          <button className="topbar-link" onClick={() => document.getElementById("formats")?.scrollIntoView({ behavior: "smooth" })}><CircleHelp size={16} /> Export guide</button>
          <button className="primary-inline" onClick={generateAssembly}><Sparkles size={16} /> Build model</button>
        </div>
      </header>

      <div className="forge-layout" id="top">
        <aside className="prompt-bench">
          <div className="rail-index">01 / MATERIAL INPUT</div>
          <div className="bench-title-row"><Box size={20} /><span>New assembly</span></div>
          <h1>Describe the parts.<br /><i>Place the first model.</i></h1>
          <p className="bench-intro">Write the cards, sensors, cables, power and actuators you want to prototype. Circuit Forge matches the supported parts locally, then builds a reference assembly you can inspect.</p>

          <label className="prompt-label" htmlFor="material-prompt">MATERIAL PROMPT</label>
          <textarea id="material-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="e.g. Raspberry Pi, soil sensor, battery and cables" />
          <div className="prompt-meta"><span><ScanSearch size={14} /> {parseMaterialsPrompt(prompt).length} types recognised</span><span><Ruler size={14} /> mm units</span></div>
          <button className="build-button" onClick={generateAssembly} disabled={isGenerating}>
            {isGenerating ? <><span className="building-spinner" /> Placing components…</> : <><Sparkles size={17} /> Generate 3D assembly <ArrowRight size={17} /></>}
          </button>

          <section className="suggestion-section">
            <div className="section-label">QUICK-ADD PARTS · FULL BENCH</div>
            {QUICK_ADD_GROUPS.map((group) => (
              <div className="quick-add-group" key={group.label}>
                <div className="quick-add-group-label">{group.label}</div>
                <div className="suggestion-grid">{group.parts.map((suggestion) => <button key={suggestion} onClick={() => addSuggestion(suggestion)}><Plus size={13} /> {suggestion}</button>)}</div>
              </div>
            ))}
          </section>

          <div className="bench-visual" style={{ backgroundImage: "url('/manus-storage/circuit-forge-assembly_0ca50900.jpg')" }}><span>REFERENCE / NOT DATASHEET CAD</span></div>
        </aside>

        <main className="modeling-space">
          <div className="workspace-head">
            <div><div className="rail-index">02 / MODELING SPACE</div><h2>AgriSense <span>v0.2 / zone-aware</span></h2></div>
            <div className="canvas-readout"><span>ORTHOGRAPHIC REFERENCE</span><b>{envelope.width} × {envelope.depth} × {envelope.height} mm</b></div>
          </div>

          <div className="viewport-frame">
            <div className="viewport-rulers horizontal"><span>0</span><span>50</span><span>100</span><span>150</span><span>200</span></div>
            <div className="viewport-rulers vertical"><span>0</span><span>50</span><span>100</span></div>
            <div className="viewport-badge"><span className="status-dot" /> LIVE REFERENCE SCENE</div>
            <div className="scene-poster" style={{ backgroundImage: "url('/manus-storage/circuit-forge-workbench_8e10f2d0.jpg')" }} />
            <PrototypeScene ref={sceneRef} parts={parts} routes={connectionPlan.routes} selectedId={selectedId} showLabels={showLabels} showConnections={showConnections} onSelect={setSelectedId} />
            <div className="viewport-controls">
              <button className={showLabels ? "active" : ""} aria-label="Toggle component labels" title={showLabels ? "Hide 3D labels" : "Show 3D labels"} onClick={() => setShowLabels((value) => !value)}>{showLabels ? <Eye size={18} /> : <EyeOff size={18} />}</button>
              <button className={showConnections ? "active" : ""} aria-label="Toggle functional connection routes" title={showConnections ? "Hide functional routes" : "Show functional routes"} onClick={() => setShowConnections((value) => !value)}><Cable size={18} /></button>
              <button aria-label="Organise assembly" title="Organise by functional zones" onClick={organiseAssembly}><LayoutGrid size={17} /></button>
              <button title="Reset viewpoint" onClick={() => sceneRef.current?.resetView()}><Rotate3D size={18} /></button>
              <button title="Focus selected part" onClick={() => sceneRef.current?.focusSelected()}><Focus size={17} /></button>
              <button title="Fullscreen reference" onClick={() => toast.info("Use your browser fullscreen command for a distraction-free inspection.")}><Maximize2 size={17} /></button>
            </div>
            <div className="viewport-viewbar"><span>CAMERA</span><button onClick={() => sceneRef.current?.setView("iso")}>ISO</button><button onClick={() => sceneRef.current?.setView("top")}>TOP</button><button onClick={() => sceneRef.current?.setView("front")}>FRONT</button><b>{showLabels ? "LABELS ON" : "LABELS OFF"}</b><b>{showConnections ? "ROUTES ON" : "ROUTES OFF"}</b></div>
            <div className="viewport-instruction"><Orbit size={16} /> DRAG TO ROTATE · SCROLL TO ZOOM · CLICK A PART TO INSPECT</div>
          </div>

          <div className="modeling-footer">
            <div><strong>{parts.length}</strong> PART TYPES PLACED</div>
            <div><strong>{parts.reduce((sum, part) => sum + part.quantity, 0)}</strong> PHYSICAL / CONNECTION ITEMS</div>
            <div><strong>{new Set(parts.map((part) => part.zone)).size}</strong> FUNCTION ZONES</div>
            <div><strong>{connectionPlan.routes.length}</strong> FUNCTION ROUTES</div>
          </div>

          <section className="system-plan" aria-label="Prototype system plan">
            <div className="system-plan-head">
              <div><div className="rail-index">03 / SYSTEM ASSEMBLY PLAN</div><h3>Trace the <span>whole system.</span></h3></div>
              <div className="route-count"><span className="status-dot" /> {connectionPlan.routes.length} ROUTES / {connectionPlan.alerts.length} CHECKS</div>
            </div>
            <p className="system-plan-intro">First choose how people or computers will reach this prototype. Then choose the data method where a component offers more than one safe planning path. The platform draws only the choices you make.</p>
            <div className="connection-option-grid" aria-label="Choose an external connection method">
              {connectionOptions.map((option) => <button key={option.mode} disabled={!option.available} className={connectionMode === option.mode ? "active" : ""} onClick={() => setConnectionMode(option.mode)}>
                <span>{option.mode.includes("phone") ? <Smartphone size={16} /> : option.mode.includes("pc") ? <Laptop size={16} /> : option.mode.includes("wifi") ? <Wifi size={16} /> : <Cable size={16} />}</span>
                <b>{option.shortTitle}</b><em>{option.detail}</em><i>{option.available ? "SELECT THIS PATH" : option.requirement}</i>
              </button>)}
            </div>
            <div className="data-choice-bar">
              <div><span>DATA METHOD / SOIL SENSOR</span><b>Choose the output your real sensor board provides.</b></div>
              <div><button className={soilMode === "digital-gpio" ? "active" : ""} onClick={() => setSoilMode("digital-gpio")}>DIGITAL → GPIO</button><button className={soilMode === "analog-adc" ? "active" : ""} onClick={() => setSoilMode("analog-adc")}>ANALOG → ADC</button></div>
              <div><span>DATA METHOD / LORA</span><b>Choose the bus you intend to configure.</b></div>
              <div><button className={loraMode === "spi" ? "active" : ""} onClick={() => setLoraMode("spi")}>SPI</button><button className={loraMode === "uart" ? "active" : ""} onClick={() => setLoraMode("uart")}>UART</button></div>
            </div>
            <div className="controller-choice">
              <span><Cpu size={13} /> CONTROL BRAIN</span>
              <div>{controllerCandidates.length ? controllerCandidates.map((part) => <button key={part.id} className={activeControllerId === part.id ? "active" : ""} onClick={() => setPreferredControllerId(part.id)}>{part.shortName}</button>) : <em>ADD A CONTROLLER TO MAP ROUTES</em>}</div>
              <b>{controllerCandidates.length ? "Routes follow the selected controller. Camera links keep their compatible host." : "No controller selected"}</b>
            </div>
            <div className="system-plan-grid">
              <div className="route-ledger">
                <div className="route-ledger-head"><span>FUNCTIONAL ROUTES</span><em>Click a route to inspect its source part</em></div>
                <div className="route-list">
                  {connectionPlan.routes.map((route) => {
                    const source = parts.find((part) => part.id === route.fromId);
                    const target = parts.find((part) => part.id === route.toId);
                    const destination = target?.shortName ?? (route.toId === "external-phone" ? "Phone / tablet" : route.toId === "external-pc" ? "Computer" : "Wi‑Fi network");
                    return <button className={`route-row ${route.connectionClass}`} key={route.id} onClick={() => source && setSelectedId(source.id)}>
                      <span className="route-class">{connectionClassLabel[route.connectionClass]}</span>
                      <span><b>{source?.shortName ?? "External"} <i>→</i> {destination}</b><em>{route.medium}</em></span>
                      <ArrowRight size={14} />
                    </button>;
                  })}
                </div>
              </div>
              <div className="system-checks">
                <div className="route-ledger-head"><span>PRE-FLIGHT CHECKS</span><em>Resolve these before powering</em></div>
                {connectionPlan.alerts.length ? connectionPlan.alerts.map((alert, index) => <div className={`system-alert ${alert.severity}`} key={`${alert.title}-${index}`}><AlertTriangle size={16} /><span><b>{alert.title}</b><em>{alert.detail}</em></span></div>) : <div className="system-ready"><Zap size={17} /><span><b>Logic map complete</b><em>Every shown category has a reference route. Verify exact voltage, pinout, and current capacity before wiring.</em></span></div>}
                <div className="route-key"><span className="key-power">POWER</span><span className="key-data">DATA</span><span className="key-control">CONTROL</span><span className="key-wireless">WIRELESS</span><span className="key-host">HOST</span></div>
              </div>
            </div>
          </section>

          <section className="full-system-view" aria-label="Complete connected system 3D view">
            <div className="full-system-head"><div><div className="rail-index">04 / COMPLETE SYSTEM 3D</div><h3>See the <span>whole prototype.</span></h3><p>Prototype, selected routes, phone, PC, Wi‑Fi node, and any required ADC bridge appear together in this second view. External devices use human-scale reference envelopes: phone 152 × 72 mm and laptop 305 × 215 mm.</p></div><div className="system-mode-readout"><span className="status-dot" /> {connectionPlan.modeTitle}</div></div>
            <div className="system-scene-frame"><SystemScene ref={systemSceneRef} parts={parts} routes={connectionPlan.routes} mode={connectionMode} showLabels={showLabels} /><div className="system-scene-note">SECOND REFERENCE · SELECTED PATHS ONLY</div><button className="system-reset" onClick={() => systemSceneRef.current?.resetView()}><Rotate3D size={16} /> RESET VIEW</button></div>
            <div className="system-export-row"><div><b>DOWNLOAD THE COMPLETE SYSTEM</b><em>Includes selected external devices and route geometry, separate from the base prototype files.</em></div><button onClick={() => systemSceneRef.current?.exportGlb()}><Download size={16} /> SYSTEM GLB</button><button onClick={() => systemSceneRef.current?.exportPng()}><ImageDown size={16} /> SYSTEM PNG / 3×</button></div>
          </section>

          <section className="workflow-strip">
            <div><span>01</span><b>Build the material list</b><p>Keep the first prompt specific.</p></div>
            <div><span>02</span><b>Resolve every route</b><p>Choose the data, control and power strategy.</p></div>
            <div><span>03</span><b>Verify, then fabricate</b><p>Confirm exact pins, ratings and clearances.</p></div>
          </section>
        </main>

        <aside className="assembly-rail">
          <div className="rail-index">03 / ASSEMBLY TREE</div>
          <div className="assembly-title"><Layers3 size={19} /><span>{parts.length} recognised types</span><ChevronDown size={16} /></div>
          <div className="part-list" aria-label="Recognised parts">
            {parts.map((part) => (
              <button key={part.id} className={part.id === selectedId ? "part-row selected" : "part-row"} onClick={() => setSelectedId(part.id)}>
                <span className="part-marker" style={{ background: part.color }} />
                <span><strong>{part.shortName}</strong><em>{part.category} · {part.zone} zone · {part.quantity > 1 ? `${part.quantity} paths` : `${part.dimensions[0]}×${part.dimensions[1]}×${part.dimensions[2]} mm`}</em></span>
                <ChevronDown size={14} />
              </button>
            ))}
          </div>

          <section className="selection-card">
            <div className="section-label">SELECTED REFERENCE</div>
            {selectedPart ? <>
              <div className="selection-name"><span className="part-marker large" style={{ background: selectedPart.color }} /> {selectedPart.name}</div>
              <p>{selectedPart.description}</p>
              <div className="dimension-row"><span>ENVELOPE</span><b>{selectedPart.dimensions.join(" × ")} mm</b></div>
              <div className="dimension-row"><span>ZONE</span><b>{selectedPart.zone}</b></div>
              <div className="dimension-row"><span>ROLE</span><b>{selectedPart.category}</b></div>
            </> : <p>Select a recognised part to inspect its nominal envelope.</p>}
          </section>

          <section className="export-card" id="formats">
            <div className="section-label">04 / EXPORT AS</div>
            <h3>Take the model to the next tool.</h3>
            <button onClick={() => sceneRef.current?.exportGlb()}><Download size={17} /><span><b>GLB</b><em>Visual 3D scene</em></span><ArrowRight size={16} /></button>
            <button onClick={() => sceneRef.current?.exportStl()}><PackageCheck size={17} /><span><b>STL</b><em>Reference printable mesh</em></span><ArrowRight size={16} /></button>
            <button onClick={exportScad}><FileCode2 size={17} /><span><b>OpenSCAD</b><em>Editable parametric source</em></span><ArrowRight size={16} /></button>
            <button onClick={() => sceneRef.current?.exportPng(true)}><ImageDown size={17} /><span><b>PNG / 3×</b><em>High-resolution render with labels</em></span><ArrowRight size={16} /></button>
            <button onClick={() => sceneRef.current?.exportPng(false)}><ImageDown size={17} /><span><b>PNG / CLEAN</b><em>High-resolution render without labels</em></span><ArrowRight size={16} /></button>
          </section>

          <div className="safety-note"><AlertTriangle size={17} /><span><b>Reference geometry only.</b> Check maker drawings, mounting holes, thermal clearance, power, and wiring before printing or powering the prototype.</span></div>
          <div className="rail-photo" style={{ backgroundImage: "url('/manus-storage/circuit-forge-calibration_9464c3b7.jpg')" }}><span>CALIBRATE BEFORE FABRICATING</span></div>
        </aside>
      </div>

      <footer className="forge-footer"><span className="footer-institution"><img src="/manus-storage/esas-eloued-official-logo_33492011.webp" alt="" /> INCUBATEUR DE L’ÉCOLE SUPÉRIEURE D’AGRICULTURE SAHARIENNE — EL OUED</span><span>DEVELOPED BY DR. MOHAMED AMINE FARES · <a href="mailto:fares.mohamedamin@esas-eloued.dz">fares.mohamedamin@esas-eloued.dz</a></span></footer>
    </div>
  );
}
