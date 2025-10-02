interface Reference {
  ref: string;
}

interface Sequence {
  seq: { start: number; end: number };
}

interface Hierarchy {
  [key: string]: Tree;
}

type TreeObject = Reference | Sequence | Hierarchy;

type TreeNode = string | TreeObject | Tree;

export type Tree = TreeNode[];

interface ResultHierarchy {
  [key: string]: ResultTree;
}

type ResultTreeNode = string | ResultHierarchy | ResultTree;

type ResultTree = ResultTreeNode[];

function isRef(obj: object): obj is Reference {
  return "ref" in obj;
}

function isSeq(obj: object): obj is Sequence {
  return "seq" in obj;
}

// variables to help with indicating issues with references
const DUPLICATE = "DUPLICATE";
const PARENT = "PARENT";

// global variables
const RESULTOUTPUT: ResultTree = [];  // store the output
let PATHSMAP: Record<string, ResultTreeNode> = {};  // store all possible paths

function applyRefToPathsMap(ref: string, head: string, altHead: string, subResultOutput: ResultTree): void {
  switch (PATHSMAP[ref]) {
    case DUPLICATE:
      console.error(`Invalid reference: detected ambiguous references in ${ref}!`);
      break;
    case PARENT:
      console.error(`Invalid reference: detected parent references in ${ref}!`);
      break;
    case null:
    case undefined:
      console.error(`Invalid reference: path ${ref} doesn't exist!`);
      break;
    default: {
      const copiedVal = PATHSMAP[ref];
      if (typeof copiedVal == "string") {
        const newHead = head === "/" ? `/${copiedVal}` : `${head}/${copiedVal}`;
        PATHSMAP[newHead] = PATHSMAP[newHead] == null ? copiedVal : DUPLICATE;
      } else if (!Array.isArray(copiedVal)) {
        const key = Object.keys(copiedVal)[0];
        const newHead = `${altHead}/${key}`;
        PATHSMAP[newHead] = copiedVal[key];
      }
      PATHSMAP[altHead] = copiedVal;
      subResultOutput.push(PATHSMAP[ref]);
    }
  }
}

function treeObjCheck(treeObj: TreeObject, head: string, altHead: string, subResultOutput: ResultTree): void {
  if (isRef(treeObj)) {
    let { ref } = treeObj;
    // check short path
    if (ref[0] !== '/') {
      const tempPaths = ref.split("/");
      let keys: string[] = [];
      for (let len = 1; len < tempPaths.length + 1; len++) {
        keys = Object.keys(PATHSMAP).filter(key => key.includes(tempPaths.slice(0, len).join("/")));
        if (keys.length > 1) {
          console.error(`Invalid reference: detected ambiguous references in ${ref}!`);
          return;
        }
        if (
          (keys.length === 1 && !keys[0].includes(ref)) ||
          (len === tempPaths.length && keys.length < 0)
        ) {
          console.error(`Invalid reference: path ${ref} doesn't exist!`);
          return;
        }
      }
      ref = keys[0];
    }
    applyRefToPathsMap(ref, head, altHead, subResultOutput);
    return;
  } else if (isSeq(treeObj)) {
    const { start, end } = treeObj.seq;
    if (start == null || end == null) {
      console.error("Invalid sequence: must have both start and end!");
      return;
    }
    for (let i = 0; i < end - start + 1; i++) {
      const ind = subResultOutput.length;
      const tempVal = `'${i + start}'`;
      const newHead = head === "/" ? `/${tempVal}` : `${head}/${tempVal}`;
      const newAltHead = head === "/" ? `/${ind}` : `${head}/${ind}`;
      PATHSMAP[newHead] = PATHSMAP[newHead] == null ? tempVal : DUPLICATE;
      PATHSMAP[newAltHead] = tempVal;
      subResultOutput.push(tempVal);
    }
  } else {
    const key = Object.keys(treeObj)[0];
    const newHead = `${altHead}/${key}`;
    subResultOutput.push({ [key]: [] });
    treeExpansion(treeObj[key], newHead, (subResultOutput[subResultOutput.length - 1] as ResultHierarchy)[key]);
  }
}

function treeExpansion(treeInput: Tree, head: string = "/", subResultOutput: ResultTree = RESULTOUTPUT): void {
  PATHSMAP[head] = PATHSMAP[head] == null ? [] : DUPLICATE;

  for (let i = 0; i < treeInput.length; i++) {
    const node = treeInput[i];
    const ind = subResultOutput.length;
    if (typeof node == "string") {  // node is an atom
      // set direct paths, which can be from using atom or position
      const newHead = head === "/" ? `/${node}` : `${head}/${node}`;
      const newAltHead = head === "/" ? `/${ind}` : `${head}/${ind}`;

      if (PATHSMAP[newHead] != null) {  // e.g. ["A", "A"]
        PATHSMAP[newHead] = DUPLICATE;
      }

      const directParent = head.slice(head.lastIndexOf("/") + 1);
      if (directParent === node) {  // e.g. [{ "A" : ["A"] }] which is /0/A/A or /0/A/0
        PATHSMAP[newHead] = PATHSMAP[newHead] || PARENT;
        PATHSMAP[newAltHead] = PARENT;
      }

      PATHSMAP[newHead] ||= node;
      PATHSMAP[newAltHead] ||= node;

      subResultOutput.push(node);
    } else if (Array.isArray(node)) {  // node is a tree
      const newHead = head === "/" ? `/${ind}` : `${head}/${ind}`;
      subResultOutput.push([]);
      treeExpansion(node, newHead, subResultOutput[subResultOutput.length - 1] as ResultTree);
    } else {  // node is a reference, sequence or hierarchal object
      const altHead = head === "/" ? `/${ind}` : `${head}/${ind}`;
      treeObjCheck(node, head, altHead, subResultOutput);
    }

    if (PATHSMAP[head] !== DUPLICATE) {
      PATHSMAP[head] = JSON.parse(JSON.stringify(subResultOutput));  // need to do this to prevent circular references

      // add missing reference to hierarchy object's parent
      const key = head.slice(head.lastIndexOf("/") + 1);
      const parentPath = head.slice(0, head.lastIndexOf("/"));
      if (isNaN(key as any) && parentPath !== "") {
        PATHSMAP[parentPath] = { [key]: PATHSMAP[head] } as ResultHierarchy;
      }
    }
  }
}

export default function main(treeInput: Tree) {
  if (!Array.isArray(treeInput)) {
    console.error("Invalid input: tree must be an array!");
    return;
  }

  // initial reset of global variables to be able to run multiple tests in deno
  RESULTOUTPUT.length = 0;
  PATHSMAP = {};

  treeExpansion(treeInput);
  return RESULTOUTPUT;
}
