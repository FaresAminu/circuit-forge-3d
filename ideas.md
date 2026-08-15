# CIRCUIT FORGE 3D — Design Direction

## Three possible directions

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| **Desert Fab Lab** | A warm workshop built from sandstone, tool steel, and solar utility; it turns component lists into tangible field devices. | 0.07 |
| **Circuit Forge 3D** | A precise, daylight engineering workbench that makes the path from typed materials to a printable assembly feel transparent and controllable. | 0.04 |
| **Blue Archive CAD** | A composed, archival technical document interface with cyanotype drawings and typographic measurement marks. | 0.08 |

## Chosen approach — Circuit Forge 3D

### Design Movement

**Industrial information design with contemporary maker-lab clarity.** The product should feel like a well-maintained engineering bench: deliberate, practical, and safe to use, not like a science-fiction game or an opaque AI box.

### Core Principles

1. **The model is inspectable.** Every recognised component is surfaced as an individual part with dimensions and an editable role.
2. **The workbench stays spatial.** The central canvas carries the visual weight, while prompt, inventory, assembly tree, and exports form an asymmetric surrounding frame.
3. **Fabrication needs boundaries.** Approximate geometry, clearance, and reference-only language are always visible; no model is silently presented as production-ready manufacturer CAD.
4. **Prompt-to-part must feel tactile.** Progress moves from typed material list, to recognised parts, to a visible assembly, to a deliberate download.

### Color Philosophy

Near-white drafting paper removes visual noise; **forge cobalt** communicates active geometry and selected parts; **safety chartreuse** marks ready-to-export states; **oxide orange** identifies warnings and reference-only constraints. The palette favors daylight contrast and physical workshop signifiers over glossy gradients.

### Layout Paradigm

The page is a **three-sided fabrication bench**: a fixed left drawer for the prompt and parts library, an expansive central viewport for the 3D model, and a right-side assembly/properties rail. Instead of centered marketing sections, the interface makes the current model physically feel like the work’s centre of gravity.

### Signature Elements

* A bold isometric **F** cut from a calibration cube, used as the brand mark and scene loading token.
* Measurement ticks and coordinate labels around the canvas, like an engineering drawing without becoming decorative noise.
* A translucent “reference geometry” stamp that follows exports and high-risk components.

### Interaction Philosophy

Controls should resemble a digital workshop: material chips can be added from examples, recognised parts appear one-by-one, selection in the parts rail highlights an object on the model, and export actions explicitly label the target format. No gesture should hide a decision that affects geometry.

### Animation

The generated assembly uses short 180–260 ms transform/opacity transitions: component chips land with a small lateral slide, newly placed objects ease into their local coordinates, and selected geometry receives a restrained cobalt outline. The camera never auto-spins after the first orientation cue. All non-essential motion is removed under `prefers-reduced-motion`.

### Typography System

**Space Grotesk** provides the compact, engineered display hierarchy. **IBM Plex Sans** keeps instructions and warnings highly legible. **IBM Plex Mono** is reserved for part IDs, millimetres, export formats, and coordinate readouts. Large headlines are rare and left-aligned; technical labels are deliberately small but high-contrast.

### Brand Essence

**Circuit Forge 3D turns a student’s list of electronic parts into an inspectable first assembly model, before the workshop spends money or material.**

Personality: **practical, exacting, enabling**.

### Brand Voice

Headlines state the action and the condition, while microcopy tells the student what is recognised and what still needs verification. It avoids vague claims of intelligence or instant fabrication.

> “Describe the parts. We’ll place the first assembly.”

> “Download a model to edit — verify every fit before you print.”

### Wordmark & Logo

The mark is a cropped isometric calibration cube with an **F** formed by its negative space; the wordmark uses a custom spaced construction with a small `3D` coordinate tag, never a default typeset label.

### Signature Brand Color

**Forge Cobalt — #2457FF.**

## Style Decisions

Forge Cobalt `#2457FF` is the only primary action and selection color. Safety Chartreuse is reserved for verified, ready-to-export, or completed states, while oxide orange owns reference-only and risk language. The central canvas is always the visual protagonist; the side rails behave like quieter workshop drawers. The calibration-cube **F** and the spaced `3D` coordinate tag recur in the header and key reference or export moments as the ownable fabrication mark.

Circuit Forge 3D is the dominant product identity in the header. The institutional mark of the Incubateur de l’École Supérieure d’Agriculture Saharienne — El Oued provides visible provenance but never outweighs the calibration-cube **F** and the product wordmark. Non-CAD imagery is treated as a muted, captioned reference plate with a fabrication caveat. The central canvas remains the brightest and most spatially commanding surface; rails and planning sections use document-like borders and restrained paper surfaces rather than generic dashboard-card treatment.
