# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Integration tests for the quiescence polyfill injected as a BiDi preload.

``browsing_context.navigate()`` registers ``javascript/atoms/quiescence.js`` as
a preload script when the session negotiated a BiDi WebSocket, so
``window.__quiescence`` is installed before any page script runs. Unlike
``driver.get()``, BiDi navigation does not wait for the page to load, which is
where the quiescence oracle earns its keep.
"""

import time

from selenium.webdriver.support.ui import WebDriverWait


def _navigate(driver, pages, name):
    """Navigate to a served page via BiDi, which registers the preload."""
    driver.browsing_context.navigate(
        context=driver.current_window_handle,
        url=pages.url(name),
        wait="complete",
    )


def _is_quiet(driver):
    return driver.execute_script("return window.__quiescence.isQuiet();")


def _blocker_types(driver):
    return [b["type"] for b in driver.execute_script("return window.__quiescence.getBlockers();")]


def _await_quiet(driver, timeout_ms=5000, settle_ms=50):
    """Resolve the in-page ``awaitQuiet`` promise via execute_async_script."""
    return driver.execute_async_script(
        "const done = arguments[arguments.length - 1];"
        "window.__quiescence.awaitQuiet({timeoutMs: arguments[0], settleMs: arguments[1]})"
        "  .then(done);",
        timeout_ms,
        settle_ms,
    )


def test_quiescence_preload_installed(driver, pages):
    _navigate(driver, pages, "blank.html")

    assert driver.execute_script("return typeof window.__quiescence") == "object"
    assert driver._quiescence_script_id is not None


def test_idle_page_is_quiet(driver, pages):
    _navigate(driver, pages, "blank.html")

    assert driver.execute_script("return window.__quiescence.isQuiet()") is True


def test_await_quiet_resolves_on_idle_page(driver, pages):
    _navigate(driver, pages, "quiescence.html")

    result = _await_quiet(driver)

    assert result["quiet"] is True
    assert result["blockers"] == []


def test_pending_timeout_is_a_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.setTimeout(() => {}, 2000);")

    assert driver.execute_script("return window.__quiescence.isQuiet()") is False
    blockers = driver.execute_script("return window.__quiescence.getBlockers()")
    assert any(b["type"] == "timeout" for b in blockers)


def test_await_quiet_waits_for_pending_timeout(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.setTimeout(() => {}, 1000);")

    result = _await_quiet(driver, timeout_ms=5000)

    assert result["quiet"] is True
    assert result["elapsedMs"] >= 1000


def test_long_timeout_is_policy_inert(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.setTimeout(() => {}, 30000);")

    assert driver.execute_script("return window.__quiescence.isQuiet()") is True


def test_preload_persists_across_navigations(driver, pages):
    _navigate(driver, pages, "blank.html")
    first_id = driver._quiescence_script_id

    _navigate(driver, pages, "quiescence.html")

    # The preload is registered once and re-runs on every navigation, so the
    # script id is stable and the API is present on the new document.
    assert driver._quiescence_script_id == first_id
    assert driver.execute_script("return typeof window.__quiescence") == "object"


# ---------------------------------------------------------------------------
# Network work (fetch / XHR / WebSocket)
# ---------------------------------------------------------------------------


def test_fetch_blocks_and_await_waits(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.__q_fetch = window.fetch('/slow?ms=1500');")

    assert "fetch" in _blocker_types(driver)

    result = _await_quiet(driver, timeout_ms=8000)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 1000


def test_xhr_blocks_and_clears(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("const x = new XMLHttpRequest(); x.open('GET', '/slow?ms=1200'); x.send();")

    assert "xhr" in _blocker_types(driver)

    WebDriverWait(driver, 8).until(lambda d: _is_quiet(d))


def test_ignored_url_pattern_does_not_block(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A fetch whose URL matches an ignore pattern must never count as a blocker.
    quiet = driver.execute_script(
        "window.__quiescence.setPolicy({ignoreUrlPatterns: ['beacon']});"
        "window.fetch('/slow?ms=2000&beacon=1');"
        "return window.__quiescence.isQuiet();"
    )
    assert quiet is True


def test_websocket_registers_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    # Constructing a WebSocket should add a 'websocket' blocker synchronously,
    # before the connection resolves or closes.
    types_ = driver.execute_script(
        "try { window.__q_ws = new WebSocket('ws://127.0.0.1:65000/'); } catch (e) {}"
        "return window.__quiescence.getBlockers().map((b) => b.type);"
    )
    assert "websocket" in types_


# ---------------------------------------------------------------------------
# Chained asynchronous work — the settle window must span the whole chain
# ---------------------------------------------------------------------------


def test_chained_work_is_awaited(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_chain_done = false;"
        "window.fetch('/slow?ms=800')"
        "  .then(() => new Promise((res) => setTimeout(res, 600)))"
        "  .then(() => window.fetch('/slow?ms=800'))"
        "  .then(() => { window.__q_chain_done = true; });"
    )

    result = _await_quiet(driver, timeout_ms=10000, settle_ms=100)

    assert result["quiet"] is True
    assert driver.execute_script("return window.__q_chain_done;") is True
    # 800 + 600 + 800 ms of sequential work must all have been awaited.
    assert result["elapsedMs"] >= 2000


# ---------------------------------------------------------------------------
# Periodic work — the "undecidable corner" (observed inertness)
# ---------------------------------------------------------------------------


def test_effect_free_interval_becomes_observed_inert(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.__q_hb = setInterval(() => {}, 200);")

    # Blocks initially (before it has ticked enough times to be judged inert).
    assert _is_quiet(driver) is False

    # After a few effect-free ticks it should self-classify as inert -> quiet.
    WebDriverWait(driver, 5).until(lambda d: _is_quiet(d))

    driver.execute_script("clearInterval(window.__q_hb);")


def test_dom_mutating_interval_stays_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_clock = setInterval("
        "  () => { document.body.setAttribute('data-t', String(performance.now())); }, 100);"
    )

    time.sleep(1.0)  # well past the inertness threshold

    assert _is_quiet(driver) is False
    assert "interval" in _blocker_types(driver)

    driver.execute_script("clearInterval(window.__q_clock);")


def test_storage_writing_interval_stays_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_st = setInterval(() => { localStorage.setItem('k', String(performance.now())); }, 100);"
    )

    time.sleep(1.0)

    assert _is_quiet(driver) is False
    assert "interval" in _blocker_types(driver)

    driver.execute_script("clearInterval(window.__q_st);")


def test_mark_inert_clears_blocker_immediately(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_clock = setInterval("
        "  () => { document.body.setAttribute('data-t', String(performance.now())); }, 100);"
    )
    time.sleep(0.4)
    assert _is_quiet(driver) is False

    # Cooperative annotation: the app declares the work inert.
    assert driver.execute_script("return window.__quiescence.markInert(window.__q_clock);") is True
    assert _is_quiet(driver) is True

    driver.execute_script("clearInterval(window.__q_clock);")


def test_mark_inert_survives_subsequent_ticks(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_clock = setInterval("
        "  () => { document.body.setAttribute('data-t', String(performance.now())); }, 100);"
    )
    time.sleep(0.4)

    assert driver.execute_script("return window.__quiescence.markInert(window.__q_clock);") is True
    assert _is_quiet(driver) is True

    # A cooperative "this work is inert" annotation should be durable. Wait for
    # several more ticks of the (still DOM-mutating) interval and confirm it has
    # not been reclassified as a blocker.
    time.sleep(0.6)
    assert _is_quiet(driver) is True

    driver.execute_script("clearInterval(window.__q_clock);")


# ---------------------------------------------------------------------------
# Timers — clearing and policy boundaries
# ---------------------------------------------------------------------------


def test_clear_timeout_removes_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script("window.__q_t = setTimeout(() => {}, 5000);")
    assert _is_quiet(driver) is False

    driver.execute_script("clearTimeout(window.__q_t);")
    assert _is_quiet(driver) is True


def test_timeout_just_below_policy_threshold_blocks(driver, pages):
    _navigate(driver, pages, "blank.html")

    # Default inertTimeoutMinDelayMs is 10000ms; 9999ms must still block.
    driver.execute_script("window.__q_t = setTimeout(() => {}, 9999);")
    assert _is_quiet(driver) is False
    driver.execute_script("clearTimeout(window.__q_t);")


def test_timeout_at_policy_threshold_is_inert(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A delay of exactly the threshold (10000ms) is treated as inert.
    driver.execute_script("window.__q_t = setTimeout(() => {}, 10000);")
    assert _is_quiet(driver) is True
    driver.execute_script("clearTimeout(window.__q_t);")


# ---------------------------------------------------------------------------
# requestAnimationFrame
# ---------------------------------------------------------------------------


def test_single_pending_raf_blocks(driver, pages):
    _navigate(driver, pages, "blank.html")

    types_ = driver.execute_script(
        "requestAnimationFrame(() => {});return window.__quiescence.getBlockers().map((b) => b.type);"
    )
    assert "raf" in types_


def test_noop_raf_loop_becomes_observed_inert(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_raf_stop = false;"
        "(function loop() {"
        "  if (window.__q_raf_stop) return;"
        "  window.__q_raf = requestAnimationFrame(loop);"
        "}());"
    )

    # A long, purely animational (effect-free) rAF chain should eventually be
    # classified as an animation loop and stop counting as a blocker.
    WebDriverWait(driver, 6).until(lambda d: _is_quiet(d))

    driver.execute_script("window.__q_raf_stop = true; cancelAnimationFrame(window.__q_raf);")


def test_dom_mutating_raf_loop_stays_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_raf_stop = false;"
        "(function loop() {"
        "  if (window.__q_raf_stop) return;"
        "  document.body.setAttribute('data-raf', String(performance.now()));"
        "  window.__q_raf = requestAnimationFrame(loop);"
        "}());"
    )

    time.sleep(2.0)

    assert _is_quiet(driver) is False
    assert "raf" in _blocker_types(driver)

    driver.execute_script("window.__q_raf_stop = true; cancelAnimationFrame(window.__q_raf);")


def test_count_raf_policy_disables_raf_blocking(driver, pages):
    _navigate(driver, pages, "blank.html")

    quiet = driver.execute_script(
        "window.__quiescence.setPolicy({countRaf: false});"
        "requestAnimationFrame(() => {});"
        "return window.__quiescence.isQuiet();"
    )
    assert quiet is True


# ---------------------------------------------------------------------------
# awaitQuiet timeout path and debug/observer surfaces
# ---------------------------------------------------------------------------


def test_await_quiet_times_out_with_named_blockers(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_clock = setInterval(  () => { document.body.appendChild(document.createElement('div')); }, 100);"
    )

    result = _await_quiet(driver, timeout_ms=1500, settle_ms=50)

    assert result["quiet"] is False
    assert any(b["type"] == "interval" for b in result["blockers"])

    driver.execute_script("clearInterval(window.__q_clock);")


def test_snapshot_includes_non_blocking_entries(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A policy-inert timeout does not block, but should still appear in the raw
    # ledger snapshot exposed for debugging.
    snapshot = driver.execute_script(
        "window.__q_t = setTimeout(() => {}, 30000);return window.__quiescence._snapshot();"
    )
    assert _is_quiet(driver) is True
    assert any(entry["type"] == "timeout" for entry in snapshot)
    driver.execute_script("clearTimeout(window.__q_t);")


def test_on_state_changed_reports_transitions(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_events = [];"
        "window.__q_unsub = window.__quiescence.onStateChanged((p) => window.__q_events.push(p.quiet));"
        "window.__q_clock = setInterval("
        "  () => { document.body.setAttribute('data-t', String(performance.now())); }, 100);"
    )

    WebDriverWait(driver, 3).until(lambda d: d.execute_script("return window.__q_events.includes(false);"))

    driver.execute_script("clearInterval(window.__q_clock);")

    WebDriverWait(driver, 3).until(lambda d: d.execute_script("return window.__q_events.includes(true);"))

    events = driver.execute_script("window.__q_unsub(); return window.__q_events;")
    assert False in events
    assert True in events
