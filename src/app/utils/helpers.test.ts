import { describe, expect, it } from "vitest";
import { FALLBACK_IMAGE, formatDate, formatPercent, formatTime } from "./helpers";

describe("helpers", () => {
  it("formats percentages using rounded whole numbers", () => {
    expect(formatPercent(83.75)).toBe("84%");
    expect(formatPercent(80)).toBe("80%");
  });

  it("formats dates into a short US locale string", () => {
    expect(formatDate("2026-05-10T00:00:00.000Z")).toContain("2026");
  });

  it("formats times into a short locale time string", () => {
    const formatted = formatTime("2026-05-10T18:45:00.000Z");
    expect(formatted).toMatch(/(\d{1,2}):(\d{2})/);
  });

  it("exposes an inline fallback image payload", () => {
    expect(FALLBACK_IMAGE.startsWith("data:image/svg+xml")).toBe(true);
    expect(FALLBACK_IMAGE).toContain("NexArena");
  });
});
