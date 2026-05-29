export const PAGE_COUNT = 8;
export const PAGE_WIDTH = 300;
export const PAGE_HEIGHT = 400;
export const LAYOUT_WIDTH = 1200;
export const LAYOUT_HEIGHT = 800;
export const PREVIEW_DEBOUNCE_MS = 250;
export const HISTORY_LIMIT = 60;
export const SNAP_THRESHOLD = 8;

// Printable imposition sheet layout.
// Top row is rotated 180 degrees: [5][4][3][2]
// Bottom row remains upright:      [6][7][8][1]
export const layoutSlots = [
  { page: 5, col: 0, row: 0, rotate: true },
  { page: 4, col: 1, row: 0, rotate: true },
  { page: 3, col: 2, row: 0, rotate: true },
  { page: 2, col: 3, row: 0, rotate: true },
  { page: 6, col: 0, row: 1, rotate: false },
  { page: 7, col: 1, row: 1, rotate: false },
  { page: 8, col: 2, row: 1, rotate: false },
  { page: 1, col: 3, row: 1, rotate: false }
];

export function parseState(jsonString) {
  return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
}

export function calcImageScale(imageWidth, imageHeight, pageWidth, pageHeight) {
  const maxWidth = pageWidth * 0.82;
  const maxHeight = pageHeight * 0.82;
  return Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1);
}

export function createBlankPage(index, blankJson) {
  return {
    json: blankJson,
    history: [blankJson],
    redo: [],
    thumbnail: "",
    label: "Page " + (index + 1)
  };
}

// Returns the same page reference (no allocation) when nothing changed so
// callers can use reference equality to detect whether history was mutated.
export function pushSnapshot(page, snapshot, limit = HISTORY_LIMIT) {
  const last = page.history[page.history.length - 1];
  if (snapshot === last) {
    return page;
  }

  const newHistory = [...page.history, snapshot];
  if (newHistory.length > limit) {
    newHistory.shift();
  }

  return { ...page, json: snapshot, history: newHistory, redo: [] };
}

export function undoPage(page) {
  if (page.history.length <= 1) {
    return { page, state: null };
  }

  const newHistory = [...page.history];
  const currentState = newHistory.pop();
  const newRedo = [...page.redo, currentState];
  const previousState = newHistory[newHistory.length - 1];

  return {
    page: { ...page, history: newHistory, redo: newRedo, json: previousState },
    state: previousState
  };
}

export function redoPage(page) {
  if (!page.redo.length) {
    return { page, state: null };
  }

  const newRedo = [...page.redo];
  const restoredState = newRedo.pop();
  const newHistory = [...page.history, restoredState];

  return {
    page: { ...page, history: newHistory, redo: newRedo, json: restoredState },
    state: restoredState
  };
}

export function snapPosition(centerX, centerY, pageWidth, pageHeight, threshold = SNAP_THRESHOLD) {
  const x = Math.abs(centerX - pageWidth / 2) <= threshold ? pageWidth / 2 : centerX;
  const y = Math.abs(centerY - pageHeight / 2) <= threshold ? pageHeight / 2 : centerY;
  return { x, y };
}
