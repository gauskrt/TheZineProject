import { describe, it, expect } from "vitest";
import { FORMATS, createZineConfig } from "../src/zine-core.js";

describe("FORMATS a4-8", () => {
  const cfg = FORMATS["a4-8"];

  it("has PAGE_COUNT of 8", () => {
    expect(cfg.PAGE_COUNT).toBe(8);
  });

  it("has LAYOUT_WIDTH of 1200", () => {
    expect(cfg.LAYOUT_WIDTH).toBe(1200);
  });

  it("has exactly 8 layout slots", () => {
    expect(cfg.layoutSlots).toHaveLength(8);
  });

  it("places page 1 at col:3 row:1 not rotated", () => {
    const slot = cfg.layoutSlots.find(s => s.page === 1);
    expect(slot).toBeDefined();
    expect(slot.col).toBe(3);
    expect(slot.row).toBe(1);
    expect(slot.rotate).toBe(false);
  });

  it("pdfFormat is 'a4'", () => {
    expect(cfg.pdfFormat).toBe("a4");
  });
});

describe("FORMATS a2-16", () => {
  const cfg = FORMATS["a2-16"];

  it("has PAGE_COUNT of 16", () => {
    expect(cfg.PAGE_COUNT).toBe(16);
  });

  it("has LAYOUT_WIDTH of 2400", () => {
    expect(cfg.LAYOUT_WIDTH).toBe(2400);
  });

  it("has exactly 16 layout slots", () => {
    expect(cfg.layoutSlots).toHaveLength(16);
  });

  it("contains each page 1–16 exactly once", () => {
    const pages = cfg.layoutSlots.map(s => s.page).sort((a, b) => a - b);
    expect(pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it("uses 8 columns (col 0–7)", () => {
    const cols = cfg.layoutSlots.map(s => s.col);
    expect(Math.min(...cols)).toBe(0);
    expect(Math.max(...cols)).toBe(7);
  });

  it("uses exactly 2 rows", () => {
    const rows = [...new Set(cfg.layoutSlots.map(s => s.row))].sort();
    expect(rows).toEqual([0, 1]);
  });

  it("top row slots are all rotated", () => {
    const topRow = cfg.layoutSlots.filter(s => s.row === 0);
    expect(topRow.every(s => s.rotate === true)).toBe(true);
  });

  it("bottom row slots are none rotated", () => {
    const bottomRow = cfg.layoutSlots.filter(s => s.row === 1);
    expect(bottomRow.every(s => s.rotate === false)).toBe(true);
  });

  it("top row page order is [9,8,7,6,5,4,3,2] cols 0–7", () => {
    const topRow = cfg.layoutSlots
      .filter(s => s.row === 0)
      .sort((a, b) => a.col - b.col)
      .map(s => s.page);
    expect(topRow).toEqual([9, 8, 7, 6, 5, 4, 3, 2]);
  });

  it("bottom row page order is [10,11,12,13,14,15,16,1] cols 0–7", () => {
    const bottomRow = cfg.layoutSlots
      .filter(s => s.row === 1)
      .sort((a, b) => a.col - b.col)
      .map(s => s.page);
    expect(bottomRow).toEqual([10, 11, 12, 13, 14, 15, 16, 1]);
  });

  it("places page 1 at col:7 row:1 not rotated", () => {
    const slot = cfg.layoutSlots.find(s => s.page === 1);
    expect(slot).toBeDefined();
    expect(slot.col).toBe(7);
    expect(slot.row).toBe(1);
    expect(slot.rotate).toBe(false);
  });

  it("pdfFormat is [594, 420]", () => {
    expect(cfg.pdfFormat).toEqual([594, 420]);
  });

  it("canvas fills exactly: LAYOUT_WIDTH = 8 cols × PAGE_WIDTH", () => {
    expect(cfg.LAYOUT_WIDTH).toBe(8 * cfg.PAGE_WIDTH);
  });

  it("canvas fills exactly: LAYOUT_HEIGHT = 2 rows × PAGE_HEIGHT", () => {
    expect(cfg.LAYOUT_HEIGHT).toBe(2 * cfg.PAGE_HEIGHT);
  });
});

describe("createZineConfig", () => {
  it("returns a4-8 config by default", () => {
    expect(createZineConfig().PAGE_COUNT).toBe(8);
  });

  it("returns a4-8 config for unknown format", () => {
    expect(createZineConfig("unknown-format").PAGE_COUNT).toBe(8);
  });

  it("returns a2-16 config when requested", () => {
    expect(createZineConfig("a2-16").PAGE_COUNT).toBe(16);
  });
});
