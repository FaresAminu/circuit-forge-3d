# Circuit Forge 3D Pro Studio

**Circuit Forge 3D** is a browser-based student workbench created for the **Incubateur de l’École Supérieure d’Agriculture Saharienne — El Oued**. It turns a written list of electronic prototyping parts into an inspectable 3D **reference assembly**, so incubator teams can discuss component placement, enclosure size, clearances, and the next fabrication step before spending workshop materials.

**Developer:** Dr. Mohamed Amine FARES — [fares.mohamedamin@esas-eloued.dz](mailto:fares.mohamedamin@esas-eloued.dz)

> Describe the parts. Place the first model. Verify the fit before you fabricate.

## What it does

| Student action | Platform result |
| --- | --- |
| Type a prompt such as “Raspberry Pi, sensor, breadboard, battery and cables” | Matches supported component names locally in the browser. |
| Generate the assembly | Places simplified component envelopes in an interactive Three.js reference scene. |
| Drag, scroll, or click a part | Rotates, zooms, and inspects the selected part’s nominal dimensions and role. |
| Download GLB | Exports a portable visual 3D scene for compatible modelling and presentation tools. |
| Download STL | Exports a reference mesh for a further print-preparation workflow. |
| Download OpenSCAD | Exports editable parametric source that a student can adjust before fabrication. |
| Show or hide labels | Keeps complex assemblies readable, while making every placed component identifiable on demand. |
| Download high-resolution PNG | Exports a 3× labelled image for mentor review or a 3× clean image for presentation use. |

The component parser is intentionally transparent and local. A material prompt stays in the student’s browser; no prompt is sent to a third-party model or server.

## Functional organisation

The Pro Studio does more than place parts. It assigns every recognised item to a clear reference zone, then organises the scene predictably: the breadboard and controller core remain central; sensing parts are grouped above and left; power sits below; actuation is placed to the right; communications are placed lower-left; and jumper cables span the assembly. The grid control in the 3D viewport reapplies this zone-aware organisation whenever the prompt changes.

The scene also provides isometric, top, and front viewpoints, a selected-part focus control, and a label toggle. Labels are hidden by default so a complex model stays legible; students can show them when presenting the assembly or inspecting a particular component.

## System assembly planner

The Studio now creates a **functional system plan** alongside the spatial 3D reference. It maps a small, explicit set of routes and shows them both as coloured paths in the scene and as an inspectable route ledger.

| Route class | Meaning in the planner | Required verification before wiring |
| --- | --- | --- |
| **Power** | A nominal route from battery or regulator to controller or load. | Polarity, approved power input, voltage, current capacity, fuse protection, and conductor rating. |
| **Data** | A sensor, display, camera, radio, or positioning route to a compatible controller category. | Exact bus, pinout, logic level, pull-ups, address, timing, cable, and datasheet. |
| **Control** | A controller-to-servo, relay, or driver route; a driver-to-pump or valve route. | Driver/relay suitability, isolation, flyback protection, load rating, and a safe water-work boundary. |
| **Wireless** | An ESP32 local access-point route to a phone/tablet, or a Wi‑Fi route to an existing network. | Credentials, access control, service design, offline behaviour, and real antenna placement. |
| **Host** | A USB data/programming reference route between an Arduino, ESP32, or Jetson and a computer. | Correct connector, cable role, power role, drivers, and serial settings. |

The available external-link selector is intentionally explicit: choose **Phone / local Wi‑Fi**, **Phone + PC / local Wi‑Fi**, **Wi‑Fi / network**, **PC / USB**, **PC / Ethernet**, or **Offline only**. Options that the current materials cannot support are disabled and explain the prerequisite; after a student chooses a compatible mode, the planner makes the relationship visible instead of leaving them with an unexplained wall of warnings.

## Complete system 3D view

After the connection choices are resolved, **Complete System 3D** creates a second, separate reference scene. It contains the prototype assembly, the selected coloured route geometry, and the external endpoint implied by the selected mode: phone/tablet, PC/laptop, Wi‑Fi access point, USB reference, or the ADC bridge used for an analogue soil-sensor route. The phone is represented at a nominal human-scale envelope of approximately **152 × 72 mm** and the laptop at approximately **305 × 215 mm**, compared with the Raspberry Pi 4 reference footprint of **85.6 × 56 mm**; their proportions are therefore not merely decorative.

The complete-system viewport is a composition and communication aid, not a replacement for a wiring schematic. It is intentionally separate from the first 3D assembly view: the first scene remains a clean component model; the second shows the context in which the chosen prototype would be used. Students can export the second view as **System GLB** or a 3× **System PNG**, without mixing it with the base model exports.

> A route in Circuit Forge means “this relationship must be resolved during design.” It does **not** mean “connect these two parts directly.” The planner never supplies a certified wiring diagram or a final pinout.

The rules are based on published interface categories for Raspberry Pi, Arduino Uno, ESP32, and Jetson Nano; links and the product boundary are retained in [`connection_research.md`](connection_research.md). Always open the exact manufacturer documentation for the hardware in hand before assembly.

## Supported parts

| Group | Recognised references |
| --- | --- |
| Core / build | Raspberry Pi 4, NVIDIA Jetson Nano, Arduino Uno, ESP32, breadboard |
| Sensing / vision | HC-SR04 ultrasonic, DHT22, soil-moisture probe, BME280, Raspberry Pi Camera |
| Communications | LoRa radio, GPS module |
| Power | Battery pack, solar panel, DC-DC buck converter |
| Actuation | Micro servo, relay module, L298N motor driver, mini water pump, solenoid valve |
| Connection / interface | OLED display, terminal block, jumper cables—including prompts such as `12 jumper cables` |

The catalogue recognises common spelling variants for each reference. Add a definition and aliases in `client/src/lib/prototypeCatalog.ts` to support another board, sensor, or material.

## Important fabrication boundary

Circuit Forge creates **nominal, simplified reference geometry**, not manufacturer-certified CAD. It is useful for first-stage spatial decisions and enclosure concepts; it must not be used as the sole source for drilling, thermal design, electrical wiring, mechanical interference, or safety-critical choices. Before fabrication or powering a prototype, students must check the relevant datasheet, mechanical drawing, mounting pattern, thermal clearance, voltage limits, and wiring plan. The detailed model policy and its sources are recorded in `three_d_scope.md`.

## Run locally

```bash
pnpm install
pnpm dev
```

The platform needs a modern browser with WebGL enabled. Create a production build with:

```bash
pnpm exec vitest run client/src/lib/connectionPlanner.test.ts
pnpm check
pnpm build
```

The regression suite checks that the planner does not invent a phone Wi‑Fi route without an ESP32, rejects an unsupported camera host, avoids a Raspberry-Pi-only PC/USB route, and flags missing solar conditioning or a missing pump switching stage. These are guardrails for the planner’s reference logic—not substitutes for hardware verification.

## Publish with GitHub Pages

The repository includes `.github/workflows/deploy.yml`. Push the project to the `main` branch of a GitHub repository, then open **Settings → Pages** and choose **GitHub Actions** as the source. The workflow installs dependencies, creates the static bundle, and deploys `dist/public` after each push to `main`.

## Adaptation map

| File | Use it to… |
| --- | --- |
| `client/src/lib/prototypeCatalog.ts` | Add part aliases, nominal envelopes, categories, and OpenSCAD output. |
| `client/src/lib/connectionPlanner.ts` | Adjust deterministic connection classes, external-link modes, and pre-flight verification alerts. |
| `client/src/lib/connectionPlanner.test.ts` | Extend the safety regression cases whenever a connection rule or a recognised component changes. |
| `client/src/components/PrototypeScene.tsx` | Improve the simplified Three.js geometry or export behaviour. |
| `client/src/components/SystemScene.tsx` | Adapt the second full-system scene, external endpoint geometry, route overlay, System GLB, or System PNG export. |
| `client/src/pages/Home.tsx` | Change the student workflow, default prompt, or the visible export guidance. |
| `three_d_scope.md` | Review the model boundary and technical reference links. |
| `connection_research.md` | Review official interface sources and the planner’s safety boundary before extending a connection rule. |
| `.github/workflows/deploy.yml` | Adapt GitHub Pages branch or deployment policy. |

## Licence

MIT — adapt it for the Higher School of Saharan Agriculture, El Oued, and validate it with the institution’s workshop supervisor before operational use.
