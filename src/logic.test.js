import { describe, expect, it } from "vitest";
import { createCapture, nextStatus, studioProgress } from "./logic";

describe("studio logic", () => {
  it("calculates completed work as a percentage", () => {
    expect(studioProgress([{ status: "done" }, { status: "next" }, { status: "done" }])).toBe(67);
  });

  it("cycles a captured task through the runway", () => {
    expect(nextStatus("parked")).toBe("next");
    expect(nextStatus("next")).toBe("in-progress");
  });

  it("turns a capture into a runnable local task", () => {
    const capture = createCapture("  Map the first customer ritual  ", "Northstar");
    expect(capture.title).toBe("Map the first customer ritual");
    expect(capture.status).toBe("next");
    expect(capture.project).toBe("Northstar");
  });
});
