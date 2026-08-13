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
 * Blocker classes tracked in v0: timeout, interval, raf, fetch, xhr,
 * websocket, resource (outstanding subresource loads: images, media, frames,
 * objects, dynamically inserted scripts and stylesheets).
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
 *  - Resource tracking: loading="lazy" images are never tracked (they fetch
 *    on viewport proximity with no observable start edge); scripts and
 *    stylesheets already in flight at DOMContentLoaded, and cross-origin
 *    frames already loading at that point, are missed (no introspectable
 *    completion state, so tracking them could produce a never-settling
 *    entry); media settles at first renderable data or `suspend`, not full
 *    buffering.
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
    // Whether outstanding subresource loads (img/media/iframe/object/script/
    // stylesheet) count as blockers.
    countResourceLoads: true,
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
      case 'resource':
        return policy.countResourceLoads;
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

  // ---- Subresource loading ---------------------------------------------------
  // Outstanding element-driven loads (img/media/iframe/object/script/
  // stylesheet) are ledger entries until their load/error (media: first
  // renderable data or suspend) events fire. Detection is edge-triggered:
  // insertions and src/href/data changes seen by the DOM observer, a
  // DOMContentLoaded sweep for parser-created elements still in flight, and a
  // src setter hook for detached loads (`new Image().src = ...` fetches
  // without ever entering the DOM).
  const RESOURCE_KIND_BY_TAG = {
    IMG: 'img', VIDEO: 'media', AUDIO: 'media', IFRAME: 'iframe',
    OBJECT: 'object', SCRIPT: 'script', LINK: 'stylesheet',
  };
  const RESOURCE_SELECTOR = 'img,video,audio,iframe,object,script[src],link[rel]';
  const MEDIA_SETTLE_EVENTS = ['loadeddata', 'suspend', 'error', 'abort', 'emptied'];
  const NETWORK_LOADING = 2;
  const resourceLedgerByEl = new WeakMap();
  // Script elements only ever fetch once (re-inserting a moved script does not
  // refetch), so each is tracked at most once to avoid a never-settling entry.
  const startedScripts = new WeakSet();
  function isStylesheetLink(el) {
    return el.relList ? el.relList.contains('stylesheet')
      : /(^|\s)stylesheet(\s|$)/i.test(el.rel || '');
  }
  function resourcePending(el, kind, atSweep) {
    switch (kind) {
      case 'img':
        return !!(el.getAttribute('src') || el.getAttribute('srcset'))
          && !el.complete && el.loading !== 'lazy';
      case 'media':
        return el.networkState === NETWORK_LOADING;
      case 'iframe':
        if (!el.getAttribute('src')) return false;
        if (atSweep) {
          // Only same-origin frames are introspectable at sweep time; a
          // cross-origin frame is skipped rather than risking an entry for
          // one that already finished (its load event will never re-fire).
          try {
            const doc = el.contentDocument;
            return !!doc && doc.readyState !== 'complete';
          } catch (_) { return false; }
        }
        return true; // edge-triggered: the load/error is still to come
      case 'script':
        if (atSweep || startedScripts.has(el)) return false;
        if (!el.getAttribute('src') || !el.isConnected) return false;
        startedScripts.add(el);
        return true;
      case 'stylesheet':
        return !atSweep && isStylesheetLink(el) && !!el.getAttribute('href')
          && el.isConnected && !el.sheet;
      case 'object':
        return !atSweep && !!el.getAttribute('data') && el.isConnected;
      default:
        return false;
    }
  }
  function trackResource(el, atSweep) {
    if (!policy.countResourceLoads) return;
    const kind = el.tagName && RESOURCE_KIND_BY_TAG[el.tagName];
    if (!kind) return;
    // A src/href/data change aborts the previous load (its events may never
    // fire), so any prior entry for this element is retired first.
    const previous = resourceLedgerByEl.get(el);
    if (previous !== undefined) { remove(previous); resourceLedgerByEl.delete(el); }
    if (!resourcePending(el, kind, !!atSweep)) return;
    const url = String(el.currentSrc || el.src || el.href || el.data || '');
    const id = add('resource', { kind, url }, { ignored: urlIgnored(url) });
    resourceLedgerByEl.set(el, id);
    const settle = () => {
      if (resourceLedgerByEl.get(el) === id) resourceLedgerByEl.delete(el);
      remove(id);
    };
    const events = kind === 'media' ? MEDIA_SETTLE_EVENTS : ['load', 'error'];
    for (const ev of events) el.addEventListener(ev, settle, { once: true });
  }
  function scanRecordsForResources(records) {
    if (!policy.countResourceLoads) return;
    for (const rec of records) {
      if (rec.type === 'attributes') {
        const attr = rec.attributeName;
        // Scripts never refetch on src change; retracking one would stick.
        if ((attr === 'src' || attr === 'srcset' || attr === 'href' || attr === 'data')
            && rec.target.tagName !== 'SCRIPT') {
          trackResource(rec.target);
        }
      } else if (rec.type === 'childList') {
        for (const node of rec.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (RESOURCE_KIND_BY_TAG[node.tagName]) trackResource(node);
          if (node.querySelectorAll) {
            for (const el of node.querySelectorAll(RESOURCE_SELECTOR)) trackResource(el);
          }
        }
      }
    }
  }
  function sweepPendingResources() {
    if (!policy.countResourceLoads) return;
    const doc = global.document;
    if (!doc || !doc.querySelectorAll) return;
    // Only kinds whose "still loading" state is introspectable — a done
    // script/stylesheet is indistinguishable from a pending one after the
    // fact, and a stale entry would hold the ledger until timeout.
    for (const el of doc.querySelectorAll('img,video,audio,iframe')) trackResource(el, true);
  }
  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', sweepPendingResources, { once: true });
    } else {
      sweepPendingResources();
    }
  }
  function hookSrcSetter(ctor) {
    if (!ctor || !ctor.prototype) return;
    const desc = Object.getOwnPropertyDescriptor(ctor.prototype, 'src');
    if (!desc || !desc.set || !desc.configurable) return;
    Object.defineProperty(ctor.prototype, 'src', {
      configurable: true,
      enumerable: desc.enumerable,
      get: desc.get,
      set(value) {
        desc.set.call(this, value);
        try { trackResource(this); } catch (_) { /* tracking must never break the page */ }
      },
    });
  }
  hookSrcSetter(global.HTMLImageElement);
  hookSrcSetter(global.HTMLMediaElement);

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
      scanRecordsForResources(records);
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

  // MutationObserver does not pierce shadow boundaries. Hook attachShadow so
  // open roots are observed too; closed roots are opaque and recorded as
  // unobservable rather than silently treated as quiet.
  if (global.Element && global.Element.prototype && global.Element.prototype.attachShadow) {
    const nativeAttachShadow = global.Element.prototype.attachShadow;
    global.Element.prototype.attachShadow = function (init) {
      const shadow = nativeAttachShadow.call(this, init);
      try {
        if (init && init.mode === 'open') {
          ensureDomObserver();
          if (domObs) {
            domObs.observe(shadow, {
              childList: true, subtree: true, attributes: true,
              characterData: true, attributeOldValue: true, characterDataOldValue: true,
            });
          }
        } else {
          domState.unobservable.push({ reason: 'closed-shadow', ts: native.now() });
        }
      } catch (_) { /* ignore */ }
      return shadow;
    };
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

  // ---- Element actionability -------------------------------------------------
  // Complements the region-level oracle above with an element-level question:
  // is *this* element safe to act on (visible, enabled, editable, in view, not
  // obstructed, not moving)? Built natively rather than vendored — see
  // .local/plans/acquiescence-gap-analysis.md. Semantics are ported from (not
  // imported from — that atom is Closure-style) javascript/atoms/dom.js's
  // bot.dom.isShown/isEnabled/isEditable, kept in parity with is_displayed()/
  // is_enabled(), extended with what that atom lacks: contenteditable/
  // aria-readonly, checked/indeterminate, and in-viewport clipping.
  function composedParent(node) {
    if (node.assignedSlot) return node.assignedSlot;
    const parent = node.parentNode;
    if (parent && parent.nodeType === 11 && parent.host) return parent.host; // shadow root
    return parent;
  }
  function hiddenByDetails(el) {
    let child = null;
    let node = el;
    while (node) {
      if (node.tagName === 'DETAILS' && !node.open) {
        const summary = node.querySelector && node.querySelector('summary');
        const insideSummary = summary && (summary === child || (child && summary.contains && summary.contains(child)));
        if (!insideSummary) return true;
      }
      child = node;
      node = composedParent(node);
    }
    return false;
  }
  function isShown(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'OPTION' || el.tagName === 'OPTGROUP') {
      const select = el.closest && el.closest('select');
      if (select) return isShown(select);
    }
    if (hiddenByDetails(el)) return false;
    const ownStyle = global.getComputedStyle(el);
    if (ownStyle.visibility === 'hidden' || ownStyle.visibility === 'collapse') return false;
    let node = el;
    while (node && node.nodeType === 1) {
      const cs = node === el ? ownStyle : global.getComputedStyle(node);
      if (cs.display === 'none') return false;
      if (cs.contentVisibility === 'hidden') return false;
      if (parseFloat(cs.opacity) === 0) return false;
      node = composedParent(node);
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    node = composedParent(el);
    while (node && node.nodeType === 1) {
      const cs = global.getComputedStyle(node);
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
        const ar = node.getBoundingClientRect();
        if (rect.right <= ar.left || rect.left >= ar.right
            || rect.bottom <= ar.top || rect.top >= ar.bottom) {
          return false;
        }
      }
      node = composedParent(node);
    }
    return true;
  }
  function ariaDisabled(el) {
    for (let n = el; n && n.nodeType === 1; n = composedParent(n)) {
      const v = n.getAttribute && n.getAttribute('aria-disabled');
      if (v === 'true') return true;
      if (v === 'false') return false;
    }
    return false;
  }
  function isEnabled(el) {
    if (!el || el.nodeType !== 1) return true;
    if (ariaDisabled(el)) return false;
    const formTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'OPTGROUP', 'FIELDSET'];
    if (formTags.indexOf(el.tagName) === -1) return true;
    if (el.disabled) return false;
    let node = composedParent(el);
    while (node && node.nodeType === 1) {
      if (node.tagName === 'FIELDSET' && node.disabled) {
        // The first <legend> child of a disabled fieldset is exempt from
        // the disabling (HTML spec: form controls inside it stay enabled).
        const legend = node.querySelector && node.querySelector(':scope > legend');
        if (!(legend && legend.contains(el))) return false;
      } else if ((node.tagName === 'OPTGROUP' || node.tagName === 'SELECT') && node.disabled) {
        return false;
      }
      node = composedParent(node);
    }
    return true;
  }
  function ariaReadonly(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      const v = node.getAttribute && node.getAttribute('aria-readonly');
      if (v != null) return v === 'true';
      node = composedParent(node);
    }
    return false;
  }
  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return !el.readOnly && isEnabled(el);
    }
    if (el.isContentEditable) {
      return !ariaReadonly(el);
    }
    return false;
  }
  function readChecked(el) {
    if (!el || el.nodeType !== 1) return null;
    const type = (el.getAttribute && el.getAttribute('type') || '').toLowerCase();
    if (el.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) return !!el.checked;
    const role = el.getAttribute && el.getAttribute('role');
    const checkableRoles = ['checkbox', 'switch', 'radio', 'menuitemcheckbox', 'menuitemradio'];
    if (role && checkableRoles.indexOf(role) !== -1) {
      const v = el.getAttribute('aria-checked');
      if (v === 'true') return true;
      if (v === 'mixed') return null;
      return false;
    }
    return null;
  }
  function rectIntersect(a, b) {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return null;
    return { left, top, right, bottom };
  }
  function isClippingAncestor(cs) {
    return cs.overflow === 'hidden' || cs.overflow === 'auto' || cs.overflow === 'scroll'
      || cs.overflowX === 'hidden' || cs.overflowX === 'auto' || cs.overflowX === 'scroll'
      || cs.overflowY === 'hidden' || cs.overflowY === 'auto' || cs.overflowY === 'scroll';
  }
  function visibleRectOf(el) {
    if (!isShown(el)) return null;
    const rect = el.getBoundingClientRect();
    let box = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    box = rectIntersect(box, { left: 0, top: 0, right: global.innerWidth, bottom: global.innerHeight });
    if (!box) return null;
    let node = composedParent(el);
    while (node && node.nodeType === 1) {
      const cs = global.getComputedStyle(node);
      if (isClippingAncestor(cs)) {
        const ar = node.getBoundingClientRect();
        box = rectIntersect(box, { left: ar.left, top: ar.top, right: ar.right, bottom: ar.bottom });
        if (!box) return null;
      }
      node = composedParent(node);
    }
    return { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top };
  }
  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }
  function rectsEqual(a, b) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }
  /**
   * Samples `el`'s bounding rect across `opts.frames` (default 2)
   * requestAnimationFrame callbacks; unstable if it moves. Independent of
   * `animationsActive()` (region-level, tracked-animation only): a
   * CSS-transition or JS-driven transform can move an element with no DOM
   * mutation and no animation the region oracle classifies as "running".
   */
  function isStable(el, opts) {
    const o = opts || {};
    const frames = o.frames || 2;
    return new Promise((resolve) => {
      if (!native.requestAnimationFrame) { resolve(true); return; }
      const rects = [rectOf(el)];
      function sample(remaining) {
        if (remaining <= 0) {
          for (let i = 1; i < rects.length; i++) {
            if (!rectsEqual(rects[0], rects[i])) { resolve(false); return; }
          }
          resolve(true);
          return;
        }
        native.requestAnimationFrame(() => {
          rects.push(rectOf(el));
          sample(remaining - 1);
        });
      }
      sample(frames);
    });
  }
  function nodePreview(el) {
    if (!el || el.nodeType !== 1) return '';
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim()) {
      const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (cls) s += '.' + cls;
    }
    return s;
  }
  /** Composed-tree containment: does `a` (composed-)contain `b`, inclusive? */
  function composedContains(a, b) {
    for (let n = b; n; n = composedParent(n)) {
      if (n === a) return true;
    }
    return false;
  }
  /**
   * Interaction point + obstruction (hit-test). No vendored registry needed:
   * `document.elementsFromPoint()` already performs a composed hit test that
   * pierces open shadow trees. Closed shadow targets are an out-of-scope,
   * documented limitation (same posture as the DOM-mutation observer's
   * closed-shadow handling).
   */
  function interactionPoint(el) {
    const rect = visibleRectOf(el);
    if (!rect) return { point: null, obstructedBy: null, reason: 'notinview' };
    const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    if (!global.document.elementsFromPoint) return { point, obstructedBy: null, reason: null };
    const hits = global.document.elementsFromPoint(point.x, point.y);
    const top = hits[0];
    if (!top || top === el || composedContains(top, el) || composedContains(el, top)) {
      return { point, obstructedBy: null, reason: null };
    }
    const pointerBlocked = global.getComputedStyle(top).pointerEvents === 'none';
    if (pointerBlocked) return { point, obstructedBy: null, reason: null };
    return { point, obstructedBy: nodePreview(top), reason: 'obstructed' };
  }
  const INTERACTION_BACKOFF_MS = [0, 0, 20, 50, 100, 100, 500];
  function reasonFor(state, hit) {
    const preview = nodePreview(state.el);
    if (!state.visible) return 'not visible: ' + preview;
    if (state.requiresEnabled && !state.enabled) return 'not enabled: ' + preview;
    if (hit.reason === 'obstructed') return 'obstructed by ' + hit.obstructedBy;
    if (!state.inViewport) return 'not in viewport: ' + preview;
    if (state.requiresEditable && !state.editable) return 'not editable: ' + preview;
    return 'not stable: ' + preview;
  }
  /**
   * Polls (backoff, not a fixed interval) element state + hit-testing +
   * stability until `el` is safe to act on, auto-scrolling into view once if
   * it starts out of viewport. On timeout, `reason` is a short diagnostic
   * (not a full nodePreviewer-style report — see the gap analysis).
   */
  function waitForInteractionReady(el, opts) {
    const o = opts || {};
    const interaction = o.interaction || 'click';
    const timeoutMs = o.timeoutMs != null ? o.timeoutMs : 10000;
    const autoScroll = o.autoScroll !== false;
    const requiresEditable = interaction === 'type' || interaction === 'clear';
    // drop/screenshot act on the element regardless of its enabled state.
    const requiresEnabled = interaction !== 'drop' && interaction !== 'screenshot';
    const started = native.now();
    return new Promise((resolve) => {
      let attempt = 0;
      let scrolled = false;
      function done(ready, point, reason) {
        resolve({ ready, interactionPoint: point, reason: reason || null, elapsedMs: native.now() - started });
      }
      function tick() {
        const state = elementState(el);
        state.el = el;
        state.requiresEditable = requiresEditable;
        state.requiresEnabled = requiresEnabled;
        const hit = interactionPoint(el);
        if (hit.reason === 'notinview' && autoScroll && !scrolled) {
          scrolled = true;
          try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (_) { /* ignore */ }
        }
        const ready = state.visible && (!requiresEnabled || state.enabled)
          && (!requiresEditable || state.editable)
          && !hit.obstructedBy && state.inViewport;
        if (ready) {
          isStable(el).then((stable) => {
            if (stable) { done(true, hit.point, null); return; }
            armNext(state, hit);
          });
          return;
        }
        armNext(state, hit);
      }
      function armNext(state, hit) {
        if (native.now() - started >= timeoutMs) {
          done(false, hit.point, reasonFor(state, hit));
          return;
        }
        const delay = INTERACTION_BACKOFF_MS[Math.min(attempt++, INTERACTION_BACKOFF_MS.length - 1)];
        native.setTimeout(tick, delay);
      }
      tick();
    });
  }
  function unsettledReason(dom) {
    const parts = [];
    const types = Array.from(new Set(getBlockers().map((b) => b.type)));
    if (types.length) parts.push('pending ' + types.join(', '));
    if (dom.activeRegions && dom.activeRegions.length) {
      parts.push(dom.activeRegions.length + ' mutating region(s)');
    }
    return parts.length ? parts.join('; ') : 'cause not observable';
  }
  /**
   * "Safe to act on X" = element-ready. Settledness is deliberately *not* on
   * this path: an application that long-polls or animates continuously never
   * settles, so composing it in would make every interaction pay the settle
   * timeout for a signal that says nothing about this element. Actionability
   * does not depend on settledness and is not derived from it.
   *
   * `opts.settled` opts into settle-then-act for a caller that knows the page
   * does quiesce — a slow re-render after a click, say. Failing to settle is
   * then reported, not silently stepped over: proceeding would spend the whole
   * budget and still act on a page that is visibly still working.
   */
  function waitUntilActionable(el, opts) {
    const o = opts || {};
    const timeoutMs = o.timeoutMs != null ? o.timeoutMs : 10000;
    const started = native.now();
    const elapsed = () => native.now() - started;
    if (!o.settled) return waitForInteractionReady(el, Object.assign({}, o, { timeoutMs }));
    return awaitDomSettled({ root: o.root, timeoutMs }).then((dom) => {
      if (!dom.settled) {
        return {
          ready: false,
          interactionPoint: null,
          reason: 'did not settle: ' + unsettledReason(dom),
        };
      }
      return waitForInteractionReady(
        el, Object.assign({}, o, { timeoutMs: Math.max(0, timeoutMs - elapsed()) }));
    }).then((result) => Object.assign({}, result, { elapsedMs: elapsed() }));
  }
  function elementState(el) {
    const rect = visibleRectOf(el);
    return {
      visible: isShown(el),
      enabled: isEnabled(el),
      editable: isEditable(el),
      checked: readChecked(el),
      indeterminate: !!el.indeterminate,
      inViewport: !!rect,
      visibleRect: rect,
    };
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
      awaitDomSettled, getActiveRegions, markDomInert, setDomPolicy, elementState, isStable,
      interactionPoint, waitForInteractionReady, waitUntilActionable,
      /** debug: raw ledger snapshot including inert/ignored entries */
      _snapshot: () => Array.from(ledger.values()).map((e) => ({ ...e, meta: { ...e.meta } })),
    }),
    writable: false, configurable: false,
  });
  scheduleEmit();
}(typeof window !== 'undefined' ? window : globalThis));
