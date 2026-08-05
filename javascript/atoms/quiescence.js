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

  // ---- DOM mutation quiescence ----------------------------------------------
  // Backward-looking debounce: the DOM is "settled" when meaningful mutations
  // have stopped for a settle window. Uses its own observer — runTracked drains
  // mutObs synchronously via takeRecords(), which would steal records from an
  // async activity callback.
  const domPolicy = {
    settleMs: 100,
    timeoutMs: 10000,
    meaningfulAttributes: ['class', 'style', 'hidden', 'open', 'width', 'height', 'src', 'value'],
    ignoreAttributes: ['data-__webdriver_id', 'data-wd-inert'],
    quietCyclesForNoise: 4,
    cadenceCV: 0.3, // coeff. of variation below which a cadence is "regular"
    treatCssAnimationsAsActivity: true,
  };
  const domState = {
    buffer: [],                // ring of recent meaningful {ts, key, target}
    fingerprints: new Map(),   // key -> classification state
    inertNodes: new WeakSet(), // markDomInert targets (sticky)
    unobservable: [],          // {reason} for closed shadow roots / canvas, etc.
    lastMeaningfulTs: 0,
  };
  function stableTargetPath(node, maxDepth) {
    maxDepth = maxDepth || 6;
    const parts = [];
    let n = node;
    while (n && n.nodeType && parts.length < maxDepth) {
      if (n.nodeType === 1) {
        let seg = n.tagName ? n.tagName.toLowerCase() : 'node';
        if (n.id) { parts.unshift(seg + '#' + n.id); break; }
        parts.unshift(seg);
        n = n.parentNode;
      } else {
        n = n.parentNode; // attribute text/comment change to owning element
      }
    }
    return parts.join('>') || 'document';
  }
  function fingerprint(rec) {
    const p = stableTargetPath(rec.target);
    if (rec.type === 'childList') return p + '|child';
    if (rec.type === 'attributes') return p + '|attr|' + rec.attributeName;
    return p + '|text';
  }
  function nodeInert(node) {
    for (let n = node; n; n = n.parentNode) {
      if (domState.inertNodes.has(n)) return true;
      if (n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-wd-inert')) return true;
    }
    return false;
  }
  function isIgnoredAttr(rec) {
    return rec.type === 'attributes'
      && domPolicy.ignoreAttributes.indexOf(rec.attributeName) !== -1;
  }
  function isMeaningful(rec, fp) {
    if (nodeInert(rec.target)) return false;
    if (fp && fp.classifiedNoise) return false;
    switch (rec.type) {
      case 'childList':
        return (rec.addedNodes.length + rec.removedNodes.length) > 0;
      case 'characterData':
        return true;
      case 'attributes':
        return !isIgnoredAttr(rec)
          && domPolicy.meaningfulAttributes.indexOf(rec.attributeName) !== -1;
      default:
        return false;
    }
  }
  function _mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
  function _cv(a) {
    if (a.length < 2) return Infinity;
    const m = _mean(a);
    if (m <= 0) return Infinity;
    const variance = _mean(a.map((x) => (x - m) * (x - m)));
    return Math.sqrt(variance) / m;
  }
  function updateFingerprint(key, rec, now) {
    let fp = domState.fingerprints.get(key);
    if (!fp) {
      fp = {
        count: 0, lastTs: 0, intervals: [], valueOnly: true,
        structuralSeen: false, classifiedNoise: false, lastTarget: null,
      };
      domState.fingerprints.set(key, fp);
    }
    if (fp.lastTs) { fp.intervals.push(now - fp.lastTs); if (fp.intervals.length > 12) fp.intervals.shift(); }
    fp.lastTs = now; fp.count++; fp.lastTarget = rec.target;
    if (rec.type === 'childList' && rec.addedNodes.length !== rec.removedNodes.length) {
      fp.valueOnly = false; fp.structuralSeen = true; fp.classifiedNoise = false; // re-promote
    }
    // Observed inertness: value-only churn on a regular cadence is periodic
    // noise (a clock, a counter) and stops counting against quiescence.
    if (fp.valueOnly && !fp.structuralSeen
        && fp.count >= domPolicy.quietCyclesForNoise
        && _cv(fp.intervals) <= domPolicy.cadenceCV) {
      fp.classifiedNoise = true;
    }
    return fp;
  }
  let domObs = null;
  function ensureDomObserver() {
    if (domObs || !global.document) return;
    const root = global.document.documentElement;
    if (!root) return; // too early at document_start; retried on DOMContentLoaded
    domObs = new MutationObserver((records) => {
      const now = native.now();
      let meaningful = false;
      for (const rec of records) {
        const key = fingerprint(rec);
        const fp = updateFingerprint(key, rec, now);
        if (isMeaningful(rec, fp)) {
          meaningful = true;
          domState.buffer.push({ ts: now, key, target: rec.target });
          if (domState.buffer.length > 512) domState.buffer.shift();
        }
      }
      if (meaningful) { domState.lastMeaningfulTs = now; scheduleEmit(); }
    });
    domObs.observe(root, {
      childList: true, subtree: true, attributes: true,
      characterData: true, attributeOldValue: true, characterDataOldValue: true,
    });
  }
  if (global.document) {
    ensureDomObserver();
    global.document.addEventListener('DOMContentLoaded', ensureDomObserver, { once: true });
  }

  // CSS animation activity source. MutationObserver is blind to
  // animations/transitions (they live at the style/compositor layer), so a
  // running animation is treated as activity — except infinite-iteration ones,
  // which are periodic noise (spinners) rather than settling work.
  function animationsActive(root) {
    try {
      if (!global.document || !global.document.getAnimations) return false;
      const anims = global.document.getAnimations({ subtree: true });
      for (const a of anims) {
        if (a.playState !== 'running') continue;
        const target = a.effect && a.effect.target;
        if (!target || nodeInert(target)) continue;
        if (root && root.contains && !root.contains(target)) continue;
        const timing = a.effect.getTiming ? a.effect.getTiming() : {};
        if (timing.iterations === Infinity) continue; // spinner-style noise
        return true;
      }
    } catch (_) { /* getAnimations unsupported */ }
    return false;
  }

  function resolveRoot(root) {
    if (!root) return null;
    return typeof root === 'string'
      ? (global.document && global.document.querySelector(root))
      : root;
  }
  function withinRoot(node, root) {
    if (!root) return true;
    return !!(node && root.contains && root.contains(node));
  }
  function domLastMeaningfulTs(root) {
    if (!root) return domState.lastMeaningfulTs;
    for (let i = domState.buffer.length - 1; i >= 0; i--) {
      const e = domState.buffer[i];
      if (withinRoot(e.target, root) && !nodeInert(e.target)) return e.ts;
    }
    return 0;
  }

  function getActiveRegions(root) {
    const scope = resolveRoot(root);
    const now = native.now();
    const out = [];
    for (const [key, fp] of domState.fingerprints) {
      if (fp.classifiedNoise) continue;
      if ((now - fp.lastTs) > domPolicy.settleMs) continue; // not currently active
      if (scope && !withinRoot(fp.lastTarget, scope)) continue;
      out.push({ key, lastAgeMs: now - fp.lastTs, count: fp.count });
    }
    return out;
  }

  function awaitDomSettled(opts) {
    const o = opts || {};
    const settleMs = o.settleMs != null ? o.settleMs : domPolicy.settleMs;
    const timeoutMs = o.timeoutMs != null ? o.timeoutMs : domPolicy.timeoutMs;
    const requirePendingQuiet = o.requirePendingQuiet !== false;
    const root = resolveRoot(o.root);
    const started = native.now();
    // Fixed-cadence poll rather than event-driven re-arm: a mutation outside a
    // scoped `root` must not reset that root's settle window.
    const pollMs = Math.min(settleMs, 50);
    ensureDomObserver();
    return new Promise((resolve) => {
      let pollHandle = null;
      let deadlineHandle = null;
      function settledNow() {
        // Observe for at least one settle window before declaring settled, so
        // churn that begins just after the call is not missed.
        return (native.now() - started) >= settleMs
          && (native.now() - domLastMeaningfulTs(root)) >= settleMs
          && (!requirePendingQuiet || isQuiet())
          && !(domPolicy.treatCssAnimationsAsActivity && animationsActive(root));
      }
      function finish(settled) {
        native.clearTimeout(pollHandle);
        native.clearTimeout(deadlineHandle);
        resolve({
          settled,
          elapsedMs: native.now() - started,
          activeRegions: settled ? [] : getActiveRegions(root),
          lastMutationAgeMs: native.now() - domLastMeaningfulTs(root),
          unobservable: domState.unobservable.slice(),
        });
      }
      function poll() {
        if (settledNow()) { finish(true); return; }
        pollHandle = native.setTimeout(poll, pollMs);
      }
      deadlineHandle = native.setTimeout(() => finish(false), timeoutMs);
      // Defer the first check so the async MutationObserver has flushed any
      // just-issued records (microtasks run before this timer fires).
      pollHandle = native.setTimeout(poll, pollMs);
    });
  }

  // ---- Public API ----------------------------------------------------------------
  function awaitQuiet(opts) {
    const o = opts || {};
    const timeoutMs = o.timeoutMs != null ? o.timeoutMs : 10000;
    const settleMs = o.settleMs != null ? o.settleMs : 75;
    const started = native.now();
    const pending = new Promise((resolve) => {
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
    // Opt-in composition: also require the DOM (optionally under opts.root) to
    // settle, so a render pipeline (fetch -> mutate -> fetch) or a running
    // animation holds quiescence even once pending work drains.
    if (!o.dom) return pending;
    return pending.then((res) => {
      if (!res.quiet) return res;
      const remaining = Math.max(0, timeoutMs - (native.now() - started));
      return awaitDomSettled({
        root: o.root, settleMs, timeoutMs: remaining, requirePendingQuiet: true,
      }).then((dom) => ({
        quiet: res.quiet && dom.settled,
        blockers: res.blockers,
        activeRegions: dom.activeRegions,
        elapsedMs: native.now() - started,
      }));
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

  /**
   * Cooperative annotation: the app declares a DOM region inert (a live ticker,
   * an ad, a chat widget). Sticky — never auto-cleared — so ongoing mutations
   * under it are always discounted. Accepts an element or a CSS selector.
   */
  function markDomInert(target) {
    const node = typeof target === 'string'
      ? (global.document && global.document.querySelector(target)) : target;
    if (!node) return false;
    domState.inertNodes.add(node);
    scheduleEmit();
    return true;
  }

  function setDomPolicy(partial) {
    Object.assign(domPolicy, partial || {});
    return { ...domPolicy };
  }

  compileIgnores();
  Object.defineProperty(global, '__quiescence', {
    value: Object.freeze({
      getBlockers, isQuiet, awaitQuiet, setPolicy, markInert, onStateChanged,
      awaitDomSettled, getActiveRegions, markDomInert, setDomPolicy,
      /** debug: raw ledger snapshot including inert/ignored entries */
      _snapshot: () => Array.from(ledger.values()).map((e) => ({ ...e, meta: { ...e.meta } })),
    }),
    writable: false, configurable: false,
  });
  scheduleEmit();
}(typeof window !== 'undefined' ? window : globalThis));
