## How to run

1. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/), which comes with node preinstalled.
2. Create the test case with the JSON input into `main.test.ts` file (have a look at existing test cases).
3. Run `deno test main.test.ts` to run all the test cases.

## Assumptions and decisions

- Both inputs and outputs are JSON values.
- A tree is a node list.
- Hierarchy is an object with a key that is atomic, and a tree as the value.
- Node lists and hierarchy objects can only have position as the parent reference.
  - e.g. `[["A"]]` and `[{ "A": [] }]` can only be accessed by `"/0"` as the parent.
- It is possible for canonical paths to also be ambiguous, which will result with producing error message.
- Error messages will be printed in console, but the program still proceeds (assuming that the input is a tree, otherwise doesn't proceed), i.e. the nodes that produces the error will be ignored.
- If had more time, would've created unit tests for the functions used, not just tests for the main function.
