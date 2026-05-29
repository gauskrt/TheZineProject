import { describe, it, expect } from "vitest";
import { snapPosition, PAGE_WIDTH, PAGE_HEIGHT, SNAP_THRESHOLD } from "../src/zine-core.js";

const CX = PAGE_WIDTH / 2;   // 150
const CY = PAGE_HEIGHT / 2;  // 200

describe("snapPosition", () => {
  it("snaps x to center when distance is exactly at the threshold", () => {
    const { x } = snapPosition(CX + SNAP_THRESHOLD, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
  });

  it("snaps x to center when distance is within the threshold", () => {
    const { x } = snapPosition(CX + SNAP_THRESHOLD - 1, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
  });

  it("does not snap x when distance exceeds the threshold by 1", () => {
    const inputX = CX + SNAP_THRESHOLD + 1;
    const { x } = snapPosition(inputX, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(inputX);
  });

  it("snaps x when approaching from the left", () => {
    const { x } = snapPosition(CX - SNAP_THRESHOLD, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
  });

  it("snaps y to center when distance is exactly at the threshold", () => {
    const { y } = snapPosition(CX, CY - SNAP_THRESHOLD, PAGE_WIDTH, PAGE_HEIGHT);
    expect(y).toBe(CY);
  });

  it("does not snap y when distance exceeds the threshold", () => {
    const inputY = CY + SNAP_THRESHOLD + 1;
    const { y } = snapPosition(CX, inputY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(y).toBe(inputY);
  });

  it("snaps both axes simultaneously when both are within threshold", () => {
    const { x, y } = snapPosition(CX + 1, CY - 1, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
    expect(y).toBe(CY);
  });

  it("returns exact center unchanged", () => {
    const { x, y } = snapPosition(CX, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
    expect(y).toBe(CY);
  });

  it("snaps only x when y is out of threshold range", () => {
    const farY = CY + 100;
    const { x, y } = snapPosition(CX + 1, farY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(CX);
    expect(y).toBe(farY);
  });

  it("snaps only y when x is out of threshold range", () => {
    const farX = CX + 100;
    const { x, y } = snapPosition(farX, CY + 1, PAGE_WIDTH, PAGE_HEIGHT);
    expect(x).toBe(farX);
    expect(y).toBe(CY);
  });

  it("respects a custom threshold larger than the default", () => {
    const { x } = snapPosition(CX + 20, CY, PAGE_WIDTH, PAGE_HEIGHT, 25);
    expect(x).toBe(CX);
  });

  it("respects a custom threshold smaller than the default", () => {
    const inputX = CX + SNAP_THRESHOLD; // would snap with default, should not with threshold=0
    const { x } = snapPosition(inputX, CY, PAGE_WIDTH, PAGE_HEIGHT, 0);
    expect(x).toBe(inputX);
  });

  it("returns an object with exactly x and y keys", () => {
    const result = snapPosition(CX, CY, PAGE_WIDTH, PAGE_HEIGHT);
    expect(Object.keys(result).sort()).toEqual(["x", "y"]);
  });
});
