import { describe, it, expect } from "vitest";
import {
  pushSnapshot,
  undoPage,
  redoPage,
  createBlankPage,
  HISTORY_LIMIT
} from "../src/zine-core.js";

function makePage(states = ["state0"], redo = []) {
  return {
    json: states[states.length - 1],
    history: [...states],
    redo: [...redo],
    thumbnail: "",
    label: "Page 1"
  };
}

// ─── pushSnapshot ────────────────────────────────────────────────────────────

describe("pushSnapshot", () => {
  it("appends a new snapshot to history", () => {
    const page = makePage(["a"]);
    expect(pushSnapshot(page, "b").history).toEqual(["a", "b"]);
  });

  it("updates json to the new snapshot", () => {
    expect(pushSnapshot(makePage(["a"]), "b").json).toBe("b");
  });

  it("clears the redo stack when a new snapshot is pushed", () => {
    const page = makePage(["a"], ["r1", "r2"]);
    expect(pushSnapshot(page, "b").redo).toEqual([]);
  });

  it("returns the same page reference when snapshot equals the last entry", () => {
    const page = makePage(["a"]);
    expect(pushSnapshot(page, "a")).toBe(page);
  });

  it("does not clear redo when snapshot is a no-op", () => {
    const page = makePage(["a"], ["r1"]);
    expect(pushSnapshot(page, "a").redo).toEqual(["r1"]);
  });

  it("evicts the oldest entry when the history limit is exceeded", () => {
    let page = makePage(["initial"]);
    for (let i = 1; i <= HISTORY_LIMIT; i++) {
      page = pushSnapshot(page, `state${i}`);
    }
    expect(page.history).toHaveLength(HISTORY_LIMIT);
    expect(page.history[0]).toBe("state1");
    expect(page.history[HISTORY_LIMIT - 1]).toBe(`state${HISTORY_LIMIT}`);
  });

  it("does not mutate the original page object", () => {
    const page = makePage(["a"]);
    const historySnapshot = [...page.history];
    pushSnapshot(page, "b");
    expect(page.history).toEqual(historySnapshot);
  });

  it("does not mutate the original redo array", () => {
    const page = makePage(["a"], ["r1"]);
    const redoSnapshot = [...page.redo];
    pushSnapshot(page, "b");
    expect(page.redo).toEqual(redoSnapshot);
  });
});

// ─── undoPage ────────────────────────────────────────────────────────────────

describe("undoPage", () => {
  it("returns the previous state", () => {
    expect(undoPage(makePage(["a", "b", "c"])).state).toBe("b");
  });

  it("removes the current state from history", () => {
    expect(undoPage(makePage(["a", "b", "c"])).page.history).toEqual(["a", "b"]);
  });

  it("pushes the popped state onto redo", () => {
    expect(undoPage(makePage(["a", "b", "c"])).page.redo).toEqual(["c"]);
  });

  it("updates json to the restored state", () => {
    expect(undoPage(makePage(["a", "b"])).page.json).toBe("a");
  });

  it("accumulates redo entries across multiple undos", () => {
    let page = makePage(["a", "b", "c"]);
    ({ page } = undoPage(page));
    ({ page } = undoPage(page));
    expect(page.redo).toEqual(["c", "b"]);
  });

  it("returns null state when already at the oldest history entry", () => {
    expect(undoPage(makePage(["only"])).state).toBeNull();
  });

  it("returns the unchanged page reference when at the oldest entry", () => {
    const page = makePage(["only"]);
    expect(undoPage(page).page).toBe(page);
  });

  it("does not mutate the original page", () => {
    const page = makePage(["a", "b"]);
    const original = [...page.history];
    undoPage(page);
    expect(page.history).toEqual(original);
  });
});

// ─── redoPage ────────────────────────────────────────────────────────────────

describe("redoPage", () => {
  it("returns the re-applied state", () => {
    expect(redoPage(makePage(["a"], ["b"])).state).toBe("b");
  });

  it("appends the redo state to history", () => {
    expect(redoPage(makePage(["a"], ["b"])).page.history).toEqual(["a", "b"]);
  });

  it("removes the re-applied state from redo", () => {
    expect(redoPage(makePage(["a"], ["b"])).page.redo).toEqual([]);
  });

  it("updates json to the restored state", () => {
    expect(redoPage(makePage(["a"], ["b"])).page.json).toBe("b");
  });

  it("pops only the last redo entry when multiple are present", () => {
    const page = makePage(["a"], ["b", "c"]);
    const { page: next, state } = redoPage(page);
    expect(state).toBe("c");
    expect(next.redo).toEqual(["b"]);
  });

  it("returns null state when redo stack is empty", () => {
    expect(redoPage(makePage(["a"])).state).toBeNull();
  });

  it("returns the unchanged page reference when redo is empty", () => {
    const page = makePage(["a"]);
    expect(redoPage(page).page).toBe(page);
  });

  it("does not mutate the original page", () => {
    const page = makePage(["a"], ["b"]);
    const originalRedo = [...page.redo];
    redoPage(page);
    expect(page.redo).toEqual(originalRedo);
  });

  it("undo then redo round-trips back to the same state and history", () => {
    const original = makePage(["a", "b", "c"]);
    const { page: afterUndo } = undoPage(original);
    const { page: afterRedo } = redoPage(afterUndo);
    expect(afterRedo.json).toBe("c");
    expect(afterRedo.history).toEqual(["a", "b", "c"]);
    expect(afterRedo.redo).toEqual([]);
  });

  it("multiple undo/redo cycles remain consistent", () => {
    let page = makePage(["a", "b", "c", "d"]);
    ({ page } = undoPage(page)); // c
    ({ page } = undoPage(page)); // b
    ({ page } = redoPage(page)); // c
    expect(page.json).toBe("c");
    expect(page.history).toEqual(["a", "b", "c"]);
    expect(page.redo).toEqual(["d"]);
  });
});

// ─── createBlankPage ─────────────────────────────────────────────────────────

describe("createBlankPage", () => {
  it("produces the correct label for the first page", () => {
    expect(createBlankPage(0, "{}").label).toBe("Page 1");
  });

  it("produces the correct label for the last page", () => {
    expect(createBlankPage(7, "{}").label).toBe("Page 8");
  });

  it("sets json to the provided blank JSON", () => {
    expect(createBlankPage(0, '{"blank":true}').json).toBe('{"blank":true}');
  });

  it("initialises history with exactly one entry matching blankJson", () => {
    const page = createBlankPage(0, "blank");
    expect(page.history).toEqual(["blank"]);
  });

  it("initialises redo as an empty array", () => {
    expect(createBlankPage(0, "blank").redo).toEqual([]);
  });

  it("initialises thumbnail as an empty string", () => {
    expect(createBlankPage(0, "blank").thumbnail).toBe("");
  });

  it("each call produces an independent object", () => {
    const p1 = createBlankPage(0, "x");
    const p2 = createBlankPage(0, "x");
    p1.history.push("extra");
    expect(p2.history).toHaveLength(1);
  });
});
