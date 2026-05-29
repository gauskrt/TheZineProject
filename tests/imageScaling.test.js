import { describe, it, expect } from "vitest";
import { calcImageScale, PAGE_WIDTH, PAGE_HEIGHT } from "../src/zine-core.js";

const MAX_W = PAGE_WIDTH * 0.82;   // 246
const MAX_H = PAGE_HEIGHT * 0.82;  // 328

describe("calcImageScale", () => {
  it("does not upscale an image smaller than the max dimensions", () => {
    expect(calcImageScale(10, 10, PAGE_WIDTH, PAGE_HEIGHT)).toBe(1);
  });

  it("does not upscale a 1×1 image", () => {
    expect(calcImageScale(1, 1, PAGE_WIDTH, PAGE_HEIGHT)).toBe(1);
  });

  it("returns exactly 1 for an image at the exact max boundary", () => {
    expect(calcImageScale(MAX_W, MAX_H, PAGE_WIDTH, PAGE_HEIGHT)).toBe(1);
  });

  it("scales down a very wide image so its width fits within MAX_W", () => {
    const scale = calcImageScale(1000, 100, PAGE_WIDTH, PAGE_HEIGHT);
    expect(scale).toBeCloseTo(MAX_W / 1000);
    expect(1000 * scale).toBeLessThanOrEqual(MAX_W + 0.001);
  });

  it("scales down a very tall image so its height fits within MAX_H", () => {
    const scale = calcImageScale(100, 2000, PAGE_WIDTH, PAGE_HEIGHT);
    expect(scale).toBeCloseTo(MAX_H / 2000);
    expect(2000 * scale).toBeLessThanOrEqual(MAX_H + 0.001);
  });

  it("uses the more constraining dimension (width) for a landscape image", () => {
    const imgW = 600, imgH = 200;
    const scale = calcImageScale(imgW, imgH, PAGE_WIDTH, PAGE_HEIGHT);
    expect(scale).toBeCloseTo(Math.min(MAX_W / imgW, MAX_H / imgH));
  });

  it("uses the more constraining dimension (height) for a portrait image", () => {
    const imgW = 200, imgH = 800;
    const scale = calcImageScale(imgW, imgH, PAGE_WIDTH, PAGE_HEIGHT);
    expect(scale).toBeCloseTo(Math.min(MAX_W / imgW, MAX_H / imgH));
  });

  it("scaled image always stays within the 82 % boundary on both axes", () => {
    const cases = [
      [640, 480],
      [1920, 1080],
      [100, 3000],
      [3000, 100],
      [400, 400]
    ];
    for (const [w, h] of cases) {
      const scale = calcImageScale(w, h, PAGE_WIDTH, PAGE_HEIGHT);
      expect(w * scale).toBeLessThanOrEqual(MAX_W + 0.001);
      expect(h * scale).toBeLessThanOrEqual(MAX_H + 0.001);
    }
  });

  it("preserves aspect ratio after scaling", () => {
    const imgW = 1200, imgH = 800;
    const scale = calcImageScale(imgW, imgH, PAGE_WIDTH, PAGE_HEIGHT);
    expect((imgW * scale) / (imgH * scale)).toBeCloseTo(imgW / imgH);
  });
});
