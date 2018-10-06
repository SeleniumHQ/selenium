// @flow
'use strict';

const assert = require('assert');
const arrayFlatten = require('array-flatten');
const arrayIncludes = require('array-includes');

/*::
type Graph<T> = Map<T, Array<T>>;
type Groups<T> = Array<Array<T>>;

type Options<T> = {
  graph: Graph<T>,
  groups: Groups<T>,
};

type Result<T> = {
  safe: boolean,
  chunks: Groups<T>,
  cycles: Groups<T>,
};
*/

// A function for finding cycles in a remaining graph.
function getCycles/*::<T>*/(currDepsMap /*: Graph<T> */, visited /*: Graph<T> */) /*: Groups<T> */ {
  // Get a list of all the remaining items in the dep map.
  let items = Array.from(currDepsMap.keys());
  // Create an array for cycles to push to.
  let cycles /*: Groups<T> */ = [];

  // Create a function to call recursively in a depth-first search.
  function visit(item, cycle) {
    let visitedDeps = visited.get(item);

    // Create an object for the item to mark visited deps.
    if (!visitedDeps) {
      visitedDeps = [];
      visited.set(item, visitedDeps);
    }

    // Get the current deps for the item.
    let deps = currDepsMap.get(item);
    if (typeof deps === 'undefined') return;

    // For each dep,
    for (let dep of deps) {
      // Check if this dep creates a cycle. We know it's a cycle if the first
      // item is the same as our dep.
      if (cycle[0] === dep) {
        cycles.push(cycle);
      }

      // If an item hasn't been visited, visit it (and pass an updated
      // potential cycle)
      if (!arrayIncludes(visitedDeps, dep)) {
        visitedDeps.push(dep);
        visit(dep, cycle.concat(dep));
      }
    }
  }

  // Iterate through each item in our current deps map and search it for cycles.
  for (let item of items) {
    visit(item, [item]);
  }

  // Return any cycles we found.
  return cycles;
}

function graphSequencer/*::<T>*/(opts /*: Options<T> */) /*: Result<T> */ {
  let graph = opts.graph;
  let groups = opts.groups;
  let graphItems = Array.from(graph.keys());

  // Ensure that we have the same set of items in both graph and groups.
  assert.deepStrictEqual(
    graphItems.sort(),
    arrayFlatten(groups).sort(),
    'items in graph must be the same as items in groups'
  );

  // We'll push to these with the results.
  let chunks /*: Groups<T> */ = [];
  let cycles /*: Groups<T> */ = [];
  let safe = true;

  // We'll keep replacing this queue as we unload items into chunks.
  let queue = graphItems;
  // A set of items already put into chunks.
  let chunked /*: Set<T> */ = new Set();
  // A cache of visited connection in the graph when finding cycles.
  let visited /*: Graph<T> */ = new Map();

  // Keep running this loop while we have items left to unload into chunks.
  while (queue.length) {
    // Init the next `queue` after this iteration.
    let nextQueue = [];
    // Create a chunk for the cycle which we'll unload items into.
    let chunk = [];
    // A map of remaining deps for each of the remaining items in the current
    // iteration.
    let currDepsMap /*: Graph<T> */ = new Map();

    for (let i = 0; i < queue.length; i++) {
      // Get the current `item` in the `queue`.
      let item = queue[i];
      // Get all the deps of the `item`.
      let deps = graph.get(item);
      if (typeof deps === 'undefined') continue;

      // Find the index of the group that the `item` belongs to.
      let itemGroup = groups.findIndex(group => arrayIncludes(group, item));

      // Filter down a set of deps which need to be run first.
      let currDeps = deps.filter(dep => {
        // Find the index of the group that the `dep` belongs to.
        let depGroup = groups.findIndex(group => arrayIncludes(group, dep));

        if (depGroup > itemGroup) {
          return false;
        } else {
          return !chunked.has(dep);
        }
      });

      // Store the remaining deps for this `item` for later.
      currDepsMap.set(item, currDeps);

      // If there are deps remaining,
      if (currDeps.length) {
        // Add the `item` to the next `queue` for the next iteration.
        nextQueue.push(item);
      } else {
        // Otherwise, add it to the current `chunk`.
        chunk.push(item);
      }
    }

    // If we got to this point and nothing was added to the chunk, it's because
    // we have a cycle.
    if (!chunk.length) {
      // First we'll identify all the cycles in the `currDepsMap` so we can
      // return them at the end.
      cycles = cycles.concat(getCycles(currDepsMap, visited));

      // We'll sort the remaining items in the queue by the number of deps they
      // have remaining.
      let sorted = queue.sort((a, b) => {
        let aDeps = currDepsMap.get(a) || [];
        let bDeps = currDepsMap.get(b) || [];
        return aDeps.length - bDeps.length;
      });

      // We'll push the item with the fewest deps remaining to the chunk.
      chunk.push(sorted[0]);

      // And set the next `queue` to the rest of the items.
      nextQueue = sorted.slice(1);

      // This will ensure that something gets unloaded every cycle, putting in
      // a best effort to keep a working order... However, this does mean that
      // the resulting order is unsafe.
      safe = false;
    }

    // Mark all of the unloaded items in the chunk as being chunked already.
    for (let item of chunk) {
      chunked.add(item);
    }

    // Add the current cycle's chunk to the resulting chunks array, ensuring
    // that there is a consistent order.
    chunks.push(chunk.sort());
    // And move on to the next `queue`.
    queue = nextQueue;
  }

  return { safe, chunks, cycles };
}

module.exports = graphSequencer;
