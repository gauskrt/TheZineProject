import { describe, it, expect } from "vitest";
import {
  layoutSlots,
  PAGE_COUNT,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  LAYOUT_WIDTH,
  LAYOUT_HEIGHT
} from "../src/zine-core.js";

describe("layoutSlots", () => {
  it("contains exactly 8 slots — one per page", () => {
    expect(layoutSlots).toHaveLength(PAGE_COUNT);
  });

  it("references every page number from 1–8 exactly once", () => {
    const pages = layoutSlots.map((s) => s.page).sort((a, b) => a - b);
    expect(pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("uses exactly two rows", () => {
    const rows = new Set(layoutSlots.map((s) => s.row));
    expect([...rows].sort()).toEqual([0, 1]);
  });

  it("uses exactly four columns", () => {
    const cols = new Set(layoutSlots.map((s) => s.col));
    expect([...cols].sort()).toEqual([0, 1, 2, 3]);
  });

  it("all slots have valid boolean rotate flags", () => {
    for (const slot of layoutSlots) {
      expect(typeof slot.rotate).toBe("boolean");
    }
  });

  it("top row (row 0) is fully rotated 180°", () => {
    const topRow = layoutSlots.filter((s) => s.row === 0);
    expect(topRow).toHaveLength(4);
    expect(topRow.every((s) => s.rotate === true)).toBe(true);
  });

  it("bottom row (row 1) is never rotated", () => {
    const bottomRow = layoutSlots.filter((s) => s.row === 1);
    expect(bottomRow).toHaveLength(4);
    expect(bottomRow.every((s) => s.rotate === false)).toBe(true);
  });

  it("page 1 occupies the bottom-right slot (col 3, row 1, no rotation)", () => {
    const slot = layoutSlots.find((s) => s.page === 1);
    expect(slot).toMatchObject({ col: 3, row: 1, rotate: false });
  });

  it("page 5 occupies the top-left slot (col 0, row 0, rotated)", () => {
    const slot = layoutSlots.find((s) => s.page === 5);
    expect(slot).toMatchObject({ col: 0, row: 0, rotate: true });
  });

  it("top row order is [5, 4, 3, 2] left-to-right", () => {
    const topRow = layoutSlots
      .filter((s) => s.row === 0)
      .sort((a, b) => a.col - b.col)
      .map((s) => s.page);
    expect(topRow).toEqual([5, 4, 3, 2]);
  });

  it("bottom row order is [6, 7, 8, 1] left-to-right", () => {
    const bottomRow = layoutSlots
      .filter((s) => s.row === 1)
      .sort((a, b) => a.col - b.col)
      .map((s) => s.page);
    expect(bottomRow).toEqual([6, 7, 8, 1]);
  });

  it("no two slots share the same (col, row) position", () => {
    const positions = layoutSlots.map((s) => `${s.col},${s.row}`);
    expect(new Set(positions).size).toBe(PAGE_COUNT);
  });

  it("slots tile the full layout canvas dimensions exactly", () => {
    const maxCol = Math.max(...layoutSlots.map((s) => s.col));
    const maxRow = Math.max(...layoutSlots.map((s) => s.row));
    expect((maxCol + 1) * PAGE_WIDTH).toBe(LAYOUT_WIDTH);
    expect((maxRow + 1) * PAGE_HEIGHT).toBe(LAYOUT_HEIGHT);
  });
});
