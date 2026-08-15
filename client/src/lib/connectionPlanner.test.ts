/**
 * Circuit Forge 3D — system-planner safety regression tests.
 * These test route logic only; they never replace hardware datasheet checks.
 */
import { describe, expect, it } from "vitest";
import { buildAssembly, parseMaterialsPrompt } from "./prototypeCatalog";
import { buildConnectionPlan } from "./connectionPlanner";

function planFor(prompt: string, mode: "usb-pc" | "wifi-phone" | "wifi-phone-pc" | "wifi-network" | "ethernet-pc" | "none") {
  const parts = buildAssembly(parseMaterialsPrompt(prompt), prompt);
  return buildConnectionPlan(parts, mode);
}

describe("Circuit Forge system planner", () => {
  it("does not invent a phone Wi-Fi link without an ESP32", () => {
    const plan = planFor("Raspberry Pi 4, DHT22, battery pack", "wifi-phone");
    expect(plan.routes.some((route) => route.connectionClass === "wireless" && route.toId === "external-phone")).toBe(false);
    expect(plan.alerts.some((alert) => alert.title === "Add ESP32 for local phone Wi‑Fi")).toBe(true);
  });

  it("creates a local phone route when an ESP32 is present", () => {
    const plan = planFor("ESP32, DHT22, battery pack", "wifi-phone");
    expect(plan.routes.some((route) => route.connectionClass === "wireless" && route.toId === "external-phone")).toBe(true);
    expect(plan.alerts.some((alert) => alert.title === "Add ESP32 for local phone Wi‑Fi")).toBe(false);
  });

  it("requires a compatible camera host", () => {
    const plan = planFor("ESP32, Raspberry Pi camera, battery pack", "none");
    expect(plan.alerts.some((alert) => alert.title === "Choose a camera host")).toBe(true);
  });

  it("does not model a USB computer route through Raspberry Pi only", () => {
    const plan = planFor("Raspberry Pi 4, DHT22, battery pack", "usb-pc");
    expect(plan.routes.some((route) => route.connectionClass === "host" && route.toId === "external-pc")).toBe(false);
    expect(plan.alerts.some((alert) => alert.title === "Choose a USB-capable board")).toBe(true);
  });

  it("flags an unsupported solar supply and an unswitched water load", () => {
    const plan = planFor("ESP32, solar panel, water pump", "none");
    expect(plan.alerts.some((alert) => alert.title === "Add a solar power stage")).toBe(true);
    expect(plan.alerts.some((alert) => alert.title === "Choose a switching stage for Water pump")).toBe(true);
  });

  it("creates explicit phone and computer routes when local Wi‑Fi is selected", () => {
    const plan = planFor("ESP32, DHT22, battery pack", "wifi-phone-pc");
    expect(plan.routes.some((route) => route.toId === "external-phone" && route.connectionClass === "wireless")).toBe(true);
    expect(plan.routes.some((route) => route.toId === "external-pc" && route.connectionClass === "wireless")).toBe(true);
  });

  it("adds a visible ADC bridge route when analog soil sensing is selected for a Raspberry Pi", () => {
    const parts = buildAssembly(parseMaterialsPrompt("Raspberry Pi 4, soil sensor, battery pack"), "Raspberry Pi 4, soil sensor, battery pack");
    const plan = buildConnectionPlan(parts, "none", undefined, { soilMode: "analog-adc", loraMode: "spi" });
    expect(plan.routes.some((route) => route.toId === "adapter-adc")).toBe(true);
    expect(plan.routes.some((route) => route.fromId === "adapter-adc")).toBe(true);
  });
});
