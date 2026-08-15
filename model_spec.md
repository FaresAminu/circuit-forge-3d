# Circuit Forge 3D — Component Model

The first release makes a **reference assembly**, not verified manufacturer CAD. It parses a student’s material description on the client, matches it to a transparent component catalogue, builds simplified geometry, then downloads an editable OpenSCAD file or a visual GLB/STL model.

| Recognised component | Simplified geometry | Default envelope (mm) | Student-facing role |
| --- | --- | ---: | --- |
| Raspberry Pi 4 | Board, ports, GPIO ridge, four mounting holes | 85 × 56 × 18 | Controller |
| NVIDIA Jetson Nano module | Board, heat-sink envelope, connector rail | 70 × 45 × 18 | Edge AI module |
| Arduino Uno | Board, USB block, header ridges | 69 × 54 × 16 | Microcontroller |
| ESP32 | Board, antenna end, header ridges | 55 × 28 × 12 | Wireless controller |
| Breadboard | Rectangular base and pin-field pattern | 165 × 55 × 10 | Test surface |
| HC-SR04 sensor | Board and paired transducer cylinders | 45 × 20 × 18 | Distance sensing |
| DHT22 sensor | Ventilated sensor case and pins | 28 × 15 × 8 | Temperature / humidity |
| Soil moisture probe | Probe fork and controller board | 60 × 20 × 7 | Soil sensing |
| Servo motor | Body, horn disc, shaft | 41 × 20 × 38 | Actuation |
| Battery pack | Battery enclosure with lead point | 70 × 35 × 20 | Power source |
| Jumper cables | Coloured line paths | configurable | Connections only |

## Prompt parsing rules

The parser recognises common English, French, and Arabic-adjacent spelling aliases, including `raspberry pi`, `rpi`, `jetson`, `nvidia nano`, `arduino`, `esp32`, `ultrasonic`, `dht`, `soil sensor`, `servo`, `breadboard`, `battery`, `cable`, `wire`, `capteur`, `câble`, and `carte`. Terms are matched locally and shown to the student before model generation, so no material description is sent to a third party.

## Model generation rule

Boards use nominal envelopes and only illustrative connectors. A generated enclosure is sized with 8 mm side clearance and 4 mm vertical clearance around the largest recognised component. The output must display the source assumption, physical units, and warning to compare critical dimensions, mounting holes, thermal design, voltage and electrical connections with manufacturer documentation before manufacturing or powering a prototype.
