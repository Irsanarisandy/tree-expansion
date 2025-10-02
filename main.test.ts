import { assertEquals } from "@std/assert";
import computeTree, { Tree } from "./main.ts";

Deno.test("Test 1", () => {
  const treeInput: Tree = [
    "A",
    { "ref": "/0" },
    { "seq": { "start": 1, "end": 3 } },
    [
      "B",
      {"ref": "/0"}
    ],
    {"ref": "/2"}
  ];
  const result = computeTree(treeInput);
  assertEquals(result, [
    "A",
    "A",
    "'1'",
    "'2'",
    "'3'",
    [
      "B",
      "A"
    ],
    "'1'"
  ]);
});

Deno.test("Test 2", () => {
  const treeInput: Tree = [
    "A",
    { "ref": "/0" },
    { "seq": { "start": 1, "end": 3 } },
    { "C": ["D", "E"] },
    [
      "B",
      ["X"],
      {"ref": "/5"}
    ],
    {"ref": "/5/C"}
  ];
  const result = computeTree(treeInput);
  assertEquals(result, [
    "A",
    "A",
    "'1'",
    "'2'",
    "'3'",
    { "C": ["D", "E"] },
    [
      "B",
      ["X"],
      { "C": ["D", "E"] }
    ],
    ["D", "E"]
  ]);
});

Deno.test("Test 3", () => {
  const treeInput: Tree = [{"A": ["B", { "ref": "/0/0" }]}];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B"] }]);
});

Deno.test("Test 4", () => {
  const treeInput: Tree = ["A", { "A": ["B", { "ref": "/A" }] }];
  const result = computeTree(treeInput);
  assertEquals(result, ["A", { "A": ["B", "A"] }]);
});

Deno.test("Test 5", () => {
  const treeInput: Tree = [{ "A": ["B", { "ref": "/A" }] }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B"] }]);
});

Deno.test("Test 6", () => {
  const treeInput: Tree = [{ "A": ["B", { "ref": "/0" }] }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B", { "A": ["B"] }] }]);
});

Deno.test("Test 7", () => {
  const treeInput: Tree = [{ "A": ["B", { "ref": "/0/A" }] }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B", ["B"]] }]);
});

Deno.test("Test 8", () => {
  const treeInput: Tree = [{ "A": ["B"] }, { "ref": "/0/A/0" }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B"] }, "B"]);
});

Deno.test("Test 9", () => {
  const treeInput: Tree = [{ "A": ["B"] }, { "ref": "/0/A/1" }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B"] }]);
});

Deno.test("Test 10", () => {
  const treeInput: Tree = ["A", "A", { "ref": "A" }];
  const result = computeTree(treeInput);
  assertEquals(result, ["A", "A"]);
});

Deno.test("Test 11", () => {
  const treeInput: Tree = [{ "A": ["B"] }, "A", { "ref": "A/B" }];
  const result = computeTree(treeInput);
  assertEquals(result, [{ "A": ["B"] }, "A"]);
});
