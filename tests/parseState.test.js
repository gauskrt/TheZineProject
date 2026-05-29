import { describe, it, expect } from "vitest";
import { parseState } from "../src/zine-core.js";

describe("parseState", () => {
  it("parses a valid JSON string into an object", () => {
    const input = JSON.stringify({ version: 2, objects: [] });
    expect(parseState(input)).toEqual({ version: 2, objects: [] });
  });

  it("returns an already-parsed object unchanged (same reference)", () => {
    const obj = { version: 2, objects: [] };
    expect(parseState(obj)).toBe(obj);
  });

  it("parses a nested JSON string", () => {
    const state = { objects: [{ type: "textbox", text: "hello" }] };
    expect(parseState(JSON.stringify(state))).toEqual(state);
  });

  it("parses an empty object string", () => {
    expect(parseState("{}")).toEqual({});
  });

  it("parses an array string", () => {
    expect(parseState("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("passes null through as non-string", () => {
    expect(parseState(null)).toBeNull();
  });

  it("passes a number through as non-string", () => {
    expect(parseState(42)).toBe(42);
  });

  it("throws a SyntaxError on malformed JSON", () => {
    expect(() => parseState("not valid json")).toThrow(SyntaxError);
  });

  it("throws on a JSON string with trailing garbage", () => {
    expect(() => parseState('{"a":1}garbage')).toThrow();
  });
});
