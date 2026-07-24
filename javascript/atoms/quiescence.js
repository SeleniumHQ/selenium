// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * quiescence.js
 *
 * Prototype of a proposed WebDriver BiDi `quiescence` module, implemented as a
 * preload script. Maintains a live pending-work ledger for the document and
 * exposes:
 *
 *   window.__quiescence.getBlockers()          -> Blocker[]
 *   window.__quiescence.isQuiet()              -> boolean
 *   window.__quiescence.awaitQuiet(opts)       -> Promise<{quiet, blockers, elapsedMs}>
 *   window.__quiescence.setPolicy(partial)     -> Policy   (remote-end annotations)
 *   window.__quiescence.markInert(handle)      -> boolean  (in-page cooperative annotation)
 *   window.__quiescence.onStateChanged(cb)     -> unsubscribe fn
 *
 * Blocker classes tracked in v0: timeout, interval, raf, fetch, xhr, websocket.
 * Observed-inertness is implemented for intervals and rAF loops: a periodic
 * task that completes N consecutive invocations with no DOM mutation, no
 * network dispatch, and no Web Storage write is reclassified as provisionally
 * inert; any later effectful invocation re-promotes it to a blocker.
 *
 * Known limitations (documented, not hidden — this is a spec prototype):
 *  - Effects performed *asynchronously* by a periodic callback (e.g. an
 *    interval that awaits then fetches) are attributed to the fetch blocker,
 *    not back to the interval's inertness score. A real implementation would
 *    use task attribution inside the browser.
 *  - Workers, MessageChannel, SSE, WebTransport, IndexedDB, and canvas-only
 *    rAF effects are not tracked in v0.
 *  - Promise reactions are not tracked (undecidable from script level without
 *    async-context hooks); microtasks drain within the settle window anyway.
 *
 * Must run before any page script (BiDi script.addPreloadScript, or CDP
 * Page.addScriptToEvaluateOnNewDocument).
 */
(function quiescenceInstall(global) {
  'use strict';
  if (global.__quiescence) return; // idempotent

  // ---- Untracked native references (our own internals must not self-block) --
  const native = {
    setTimeout: global.setTimeout.bind(global),
    clearTimeout: global.clearTimeout.bind(global),
    setInterval: global.setInterval.bind(global),
    clearInterval: global.clearInterval.bind(global),
    requestAnimationFrame: global.requestAnimationFrame
      ? global.requestAnimationFrame.bind(global) : null,
    cancelAnimationFrame: global.cancelAnimationFrame
      ? global.cancelAnimationFrame.bind(global) : null,
    fetch: global.fetch ? global.fetch.bind(global) : null,
    WebSocket: global.WebSocket || null,
    now: () => Date.now(),
  };

  // ---- Policy (remote-end annotation surface; mirrors quiescence.setPolicy) --
  const policy = {
    // Timers scheduled this far out are assumed to be session-keepalive style
    // work and do not block quiescence.
    inertTimeoutMinDelayMs: 10000,
    // Intervals at or above this period are inert by declaration.
    inertIntervalMinPeriodMs: 15000,
    // Consecutive effect-free invocations before a periodic task is
    // provisionally inert (observed inertness).
    quietInvocationsForInert: 3,
    // rAF chains longer than this are classified as animation loops and
    // become eligible for observed-inertness scoring.
    rafLoopChainThreshold: 60,
    // Regex source strings; matching fetch/XHR URLs never block (analytics
    // beacons, telemetry, etc.).
    ignoreUrlPatterns: [],
    // Whether an open WebSocket counts as a blocker.
    countOpenSockets: true,
    // Whether pending rAF counts at all (some suites only care about data).
    countRaf: true,
  };
  let compiledIgnores = [];
  function compileIgnores() {
    compiledIgnores = policy.ignoreUrlPatterns.map((s) => new RegExp(s));
  }
  function urlIgnored(url) {
    return compiledIgnores.some((re) => re.test(String(url)));
  }

  // ---- Ledger ---------------------------------------------------------------
  let nextId = 1;
  /** Map<ledgerId, entry> — entry: {id, type, meta, createdAt, inert, ignored} */
  const ledger = new Map();
  const listeners = new Set();
  let lastQuiet = null;
  let emitScheduled = false;

  function add(type, meta, flags) {
    const id = nextId++;
    ledger.set(id, {
      id, type, meta: meta || {},
      createdAt: native.now(),
      inert: !!(flags && flags.inert),
      ignored: !!(flags && flags.ignored),
    });
    scheduleEmit();
    return id;
  }
  function remove(id) {
    if (ledger.delete(id)) scheduleEmit();
  }
  function setInert(id, value) {
    const e = ledger.get(id);
    if (e && e.inert !== value) { e.inert = value; scheduleEmit(); }
  }

  function isBlocking(e) {
    if (e.ignored || e.inert) return false;
    switch (e.type) {
      case 'timeout':
        return e.meta.delay < policy.inertTimeoutMinDelayMs;
      case 'interval':
        return e.meta.period < policy.inertIntervalMinPeriodMs;
      case 'raf':
        return policy.countRaf;
      case 'websocket':
        return policy.countOpenSockets;
      default: // fetch, xhr
        return true;
    }
  }

  function getBlockers() {
    const out = [];
    for (const e of ledger.values()) {
      if (isBlocking(e)) {
        out.push({
          id: e.id, type: e.type, ageMs: native.now() - e.createdAt,
          ...e.meta,
        });
      }
    }
    return out;
  }
  function isQuiet() { return getBlockers().length === 0; }

  function scheduleEmit() {
    if (emitScheduled) return;
    emitScheduled = true;
    // Microtask coalescing so a burst of ledger churn emits one transition.
    Promise.resolve().then(() => {
      emitScheduled = false;
      const quiet = isQuiet();
      if (quiet !== lastQuiet) {
        lastQuiet = quiet;
        const payload = { quiet, blockers: quiet ? [] : getBlockers(), ts: native.now() };
        for (const cb of listeners) {
          try { cb(payload); } catch (err) { /* listener errors are not ours */ }
        }
        // Debug channel visible to remote ends without a BiDi channel wired up.
        try {
          console.debug('[quiescence] stateChanged', JSON.stringify(payload));
        } catch (_) { /* ignore */ }
      }
    });
  }

  // ---- Effect tracking for observed inertness -------------------------------
  // A single document-wide MutationObserver; takeRecords() lets us check
  // synchronously whether a callback mutated the DOM during its invocation.
  const effectFlags = { network: false, storage: false };
  let mutObs = null;
  function ensureObserver() {
    if (mutObs || !global.document) return;
    const root = global.document.documentElement;
    if (!root) return; // too early at document_start; retried below
    mutObs = new MutationObserver(() => {});
    mutObs.observe(root, {
      childList: true, subtree: true, attributes: true, characterData: true,
    });
  }
  if (global.document) {
    ensureObserver();
    global.document.addEventListener('DOMContentLoaded', ensureObserver, { once: true });
  }

  /** Runs fn, returns true if it produced an observable effect synchronously. */
  function runTracked(fn, thisArg, args) {
    ensureObserver();
    if (mutObs) mutObs.takeRecords(); // clear backlog
    effectFlags.network = false;
    effectFlags.storage = false;
    try {
      fn.apply(thisArg, args);
    } finally {
      const mutated = mutObs ? mutObs.takeRecords().length > 0 : true; // fail closed
      const effectful = mutated || effectFlags.network || effectFlags.storage;
      return effectful; // eslint-disable-line no-unsafe-finally
    }
  }

  // Storage writes count as observable effects.
  if (global.Storage && global.Storage.prototype) {
    for (const m of ['setItem', 'removeItem', 'clear']) {
      const orig = global.Storage.prototype[m];
      if (typeof orig === 'function') {
        global.Storage.prototype[m] = function (...a) {
          effectFlags.storage = true;
          return orig.apply(this, a);
        };
      }
    }
  }

  // ---- setTimeout / clearTimeout --------------------------------------------
  const timeoutLedgerByHandle = new Map();
  global.setTimeout = function (cb, delay, ...args) {
    const d = Number(delay) || 0;
    let ledgerId = null;
    const handle = native.setTimeout(function () {
      if (ledgerId !== null) remove(ledgerId);
      timeoutLedgerByHandle.delete(handle);
      if (typeof cb === 'function') cb.apply(this, args);
      else if (cb) (0, eval)(String(cb)); // string form, spec-compat
    }, d);
    ledgerId = add('timeout', { delay: d, source: 'setTimeout' });
    timeoutLedgerByHandle.set(handle, ledgerId);
    return handle;
  };
  global.clearTimeout = function (handle) {
    const ledgerId = timeoutLedgerByHandle.get(handle);
    if (ledgerId !== undefined) { remove(ledgerId); timeoutLedgerByHandle.delete(handle); }
    return native.clearTimeout(handle);
  };

  // ---- setInterval / clearInterval — with observed inertness ----------------
  const intervalLedgerByHandle = new Map();
  global.setInterval = function (cb, period, ...args) {
    const p = Number(period) || 0;
    const state = { quietStreak: 0, invocations: 0, ledgerId: null };
    const handle = native.setInterval(function () {
      state.invocations++;
      const effectful = typeof cb === 'function'
        ? runTracked(cb, this, args)
        : (cb ? ((0, eval)(String(cb)), true) : false);
      if (effectful) {
        state.quietStreak = 0;
        // Observed effects re-promote an interval unless it has been
        // cooperatively declared inert via markInert(); a declared annotation
        // is durable and must survive later effectful ticks.
        const entry = ledger.get(state.ledgerId);
        if (!(entry && entry.meta.declaredInert)) {
          setInert(state.ledgerId, false); // re-promote if it was inert
        }
      } else {
        state.quietStreak++;
        if (state.quietStreak >= policy.quietInvocationsForInert) {
          setInert(state.ledgerId, true); // provisionally inert
        }
      }
      const e = ledger.get(state.ledgerId);
      if (e) { e.meta.invocations = state.invocations; e.meta.quietStreak = state.quietStreak; }
    }, p);
    state.ledgerId = add('interval', {
      period: p, source: 'setInterval', invocations: 0, quietStreak: 0,
    });
    intervalLedgerByHandle.set(handle, state.ledgerId);
    return handle;
  };
  global.clearInterval = function (handle) {
    const ledgerId = intervalLedgerByHandle.get(handle);
    if (ledgerId !== undefined) { remove(ledgerId); intervalLedgerByHandle.delete(handle); }
    return native.clearInterval(handle);
  };

  // ---- requestAnimationFrame — chain detection + observed inertness ---------
  // A "chain" is a callback that schedules another rAF from within itself.
  let rafChain = { depth: 0, quietStreak: 0, inChainCallback: false, ledgerId: null };
  const rafLedgerByHandle = new Map();
  if (native.requestAnimationFrame) {
    global.requestAnimationFrame = function (cb) {
      const scheduledFromChain = rafChain.inChainCallback;
      if (scheduledFromChain) rafChain.depth++;
      else rafChain = { depth: 1, quietStreak: 0, inChainCallback: false, ledgerId: null };

      let ledgerId = null;
      const handle = native.requestAnimationFrame(function (ts) {
        remove(ledgerId);
        rafLedgerByHandle.delete(handle);
        rafChain.inChainCallback = true;
        const isLoop = rafChain.depth >= policy.rafLoopChainThreshold;
        try {
          if (isLoop) {
            const effectful = runTracked(cb, this, [ts]);
            if (effectful) rafChain.quietStreak = 0;
            else rafChain.quietStreak++;
          } else {
            cb.call(this, ts);
          }
        } finally {
          rafChain.inChainCallback = false;
        }
      });
      const loopInert = rafChain.depth >= policy.rafLoopChainThreshold
        && rafChain.quietStreak >= policy.quietInvocationsForInert;
      ledgerId = add('raf', { chainDepth: rafChain.depth, source: 'requestAnimationFrame' },
        { inert: loopInert });
      rafLedgerByHandle.set(handle, ledgerId);
      return handle;
    };
    global.cancelAnimationFrame = function (handle) {
      const ledgerId = rafLedgerByHandle.get(handle);
      if (ledgerId !== undefined) { remove(ledgerId); rafLedgerByHandle.delete(handle); }
      return native.cancelAnimationFrame(handle);
    };
  }

  // ---- fetch -----------------------------------------------------------------
  if (native.fetch) {
    global.fetch = function (input, init) {
      const url = (input && input.url) ? input.url : String(input);
      effectFlags.network = true;
      const ignored = urlIgnored(url);
      const ledgerId = add('fetch', { url }, { ignored });
      const p = native.fetch(input, init);
      p.then(() => remove(ledgerId), () => remove(ledgerId));
      return p;
    };
  }

  // ---- XMLHttpRequest ---------------------------------------------------------
  if (global.XMLHttpRequest) {
    const XHR = global.XMLHttpRequest;
    const origOpen = XHR.prototype.open;
    const origSend = XHR.prototype.send;
    XHR.prototype.open = function (method, url, ...rest) {
      this.__q_url = String(url);
      return origOpen.call(this, method, url, ...rest);
    };
    XHR.prototype.send = function (...a) {
      effectFlags.network = true;
      const ignored = urlIgnored(this.__q_url || '');
      const ledgerId = add('xhr', { url: this.__q_url || '' }, { ignored });
      this.addEventListener('loadend', () => remove(ledgerId), { once: true });
      return origSend.apply(this, a);
    };
  }

  // ---- WebSocket ---------------------------------------------------------------
  const socketLedger = new WeakMap();
  if (native.WebSocket) {
    global.WebSocket = new Proxy(native.WebSocket, {
      construct(Target, args) {
        const ws = new Target(...args);
        effectFlags.network = true;
        const ledgerId = add('websocket', { url: String(args[0] || '') });
        socketLedger.set(ws, ledgerId);
        ws.addEventListener('close', () => remove(ledgerId), { once: true });
        const origSend = ws.send.bind(ws);
        ws.send = (...sa) => { effectFlags.network = true; return origSend(...sa); };
        return ws;
      },
    });
  }

  // ---- Public API ----------------------------------------------------------------
  function awaitQuiet(opts) {
    const { timeoutMs = 10000, settleMs = 75 } = opts || {};
    const started = native.now();
    return new Promise((resolve) => {
      let settleHandle = null;
      let deadlineHandle = null;
      let unsub = null;
      const finish = (quiet) => {
        if (unsub) unsub();
        native.clearTimeout(settleHandle);
        native.clearTimeout(deadlineHandle);
        resolve({
          quiet,
          blockers: quiet ? [] : getBlockers(),
          elapsedMs: native.now() - started,
        });
      };
      const armSettle = () => {
        native.clearTimeout(settleHandle);
        if (isQuiet()) {
          // Quiet must *hold* for settleMs to catch chained work
          // (fetch -> then -> setTimeout -> fetch ...).
          settleHandle = native.setTimeout(() => {
            if (isQuiet()) finish(true); // else next stateChanged re-arms
          }, settleMs);
        }
      };
      unsub = onStateChanged(() => armSettle());
      deadlineHandle = native.setTimeout(() => finish(false), timeoutMs);
      armSettle();
    });
  }

  function onStateChanged(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  /**
   * Cooperative in-page annotation: the app declares work inert.
   * Accepts a setInterval/setTimeout handle, a WebSocket instance,
   * or a raw ledger id.
   */
  function markInert(handle) {
    let ledgerId = intervalLedgerByHandle.get(handle);
    if (ledgerId === undefined) ledgerId = timeoutLedgerByHandle.get(handle);
    if (ledgerId === undefined && handle && typeof handle === 'object') {
      ledgerId = socketLedger.get(handle);
    }
    if (ledgerId === undefined && typeof handle === 'number' && ledger.has(handle)) {
      ledgerId = handle;
    }
    if (ledgerId === undefined) return false;
    const e = ledger.get(ledgerId);
    if (!e) return false;
    e.inert = true;
    e.meta.declaredInert = true;
    scheduleEmit();
    return true;
  }

  function setPolicy(partial) {
    Object.assign(policy, partial || {});
    compileIgnores();
    scheduleEmit();
    return { ...policy };
  }

  compileIgnores();
  Object.defineProperty(global, '__quiescence', {
    value: Object.freeze({
      getBlockers, isQuiet, awaitQuiet, setPolicy, markInert, onStateChanged,
      /** debug: raw ledger snapshot including inert/ignored entries */
      _snapshot: () => Array.from(ledger.values()).map((e) => ({ ...e, meta: { ...e.meta } })),
    }),
    writable: false, configurable: false,
  });
  scheduleEmit();
}(typeof window !== 'undefined' ? window : globalThis));
