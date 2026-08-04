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

"""Integration tests for the DOM-mutation quiescence oracle.

The quiescence preload (registered on ``browsing_context.navigate()``) exposes
``window.__quiescence.awaitDomSettled()``, which resolves once the DOM has
stopped *meaningfully* mutating for a settle window. These tests drive mutations
via ``execute_script`` and assert the oracle's classification of structural vs
bookkeeping vs periodic-noise churn.

``requirePendingQuiet`` is disabled in most tests so the DOM behaviour is
isolated from the timer/network ledger (a driving ``setInterval`` is itself a
pending blocker); composition with pending work is covered separately.
"""

from selenium.webdriver.support.ui import WebDriverWait


def _navigate(driver, pages, name):
    """Navigate to a served page via BiDi, which registers the preload."""
    driver.browsing_context.navigate(
        context=driver.current_window_handle,
        url=pages.url(name),
        wait="complete",
    )


def _await_dom_settled(driver, root=None, settle_ms=200, timeout_ms=5000, require_pending_quiet=False):
    """Resolve the in-page ``awaitDomSettled`` promise via execute_async_script."""
    return driver.execute_async_script(
        "const done = arguments[arguments.length - 1];"
        "window.__quiescence.awaitDomSettled({"
        "  root: arguments[0], settleMs: arguments[1],"
        "  timeoutMs: arguments[2], requirePendingQuiet: arguments[3]"
        "}).then(done);",
        root,
        settle_ms,
        timeout_ms,
        require_pending_quiet,
    )


def test_idle_dom_is_settled(driver, pages):
    _navigate(driver, pages, "blank.html")

    result = _await_dom_settled(driver, settle_ms=150, timeout_ms=3000)

    assert result["settled"] is True
    assert result["activeRegions"] == []


def test_burst_then_settles(driver, pages):
    _navigate(driver, pages, "blank.html")

    # Six structural appends spread over ~900ms, then silence.
    driver.execute_script(
        "let n = 0;"
        "(function burst() {"
        "  if (n++ < 6) {"
        "    document.body.appendChild(document.createElement('div'));"
        "    setTimeout(burst, 150);"
        "  }"
        "}());"
    )

    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=8000)

    assert result["settled"] is True
    # The append burst must have been awaited before declaring settled.
    assert result["elapsedMs"] >= 700


def test_bookkeeping_attributes_are_ignored(driver, pages):
    _navigate(driver, pages, "blank.html")

    # data-* churn is not layout/content meaningful, so the DOM is "settled".
    driver.execute_script(
        "window.__q_i = setInterval("
        "  () => document.body.setAttribute('data-x', String(performance.now())), 50);"
    )
    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=3000)
    driver.execute_script("clearInterval(window.__q_i);")

    assert result["settled"] is True


def test_periodic_text_is_classified_noise_and_settles(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A clock updating the same text node on a regular cadence is periodic noise:
    # after a few cycles it stops counting against quiescence.
    driver.execute_script(
        "document.body.innerHTML = '<span id=\"clk\">0</span>';"
        "window.__q_clock = setInterval("
        "  () => { document.getElementById('clk').textContent = String(Date.now()); }, 100);"
    )
    result = _await_dom_settled(driver, settle_ms=250, timeout_ms=6000)
    driver.execute_script("clearInterval(window.__q_clock);")

    assert result["settled"] is True


def test_structural_change_repromotes_noise_region(driver, pages):
    _navigate(driver, pages, "blank.html")

    # `#r` swaps its single text child on a steady cadence: net-zero childList
    # churn that is classified as noise (drops out of the active regions). When
    # the *same* fingerprint then makes a net node addition it must be
    # re-promoted to an active (meaningful) region.
    driver.execute_script(
        "document.body.innerHTML = '<div id=\"r\">x</div>';"
        "window.__q_n = 0;"
        "window.__q_m = setInterval(() => {"
        "  window.__q_n++;"
        "  document.getElementById('r').textContent = 'v' + window.__q_n;"
        "}, 60);"
    )

    # Wait until the net-zero swap region is classified as periodic noise.
    WebDriverWait(driver, 5).until(
        lambda d: not d.execute_script("return window.__quiescence.getActiveRegions();")
    )

    # A structural add on the same region must re-promote it.
    driver.execute_script("document.getElementById('r').appendChild(document.createElement('p'));")
    regions = WebDriverWait(driver, 3).until(
        lambda d: [
            r
            for r in d.execute_script("return window.__quiescence.getActiveRegions();")
            if "div#r" in r["key"] and "child" in r["key"]
        ]
        or False
    )
    driver.execute_script("clearInterval(window.__q_m);")

    assert regions


def test_finite_css_animation_blocks_then_settles(driver, pages):
    _navigate(driver, pages, "blank.html")

    # CSS animations never fire MutationObserver, so the ledger alone is blind to
    # them. A finite running animation must count as activity until it finishes.
    driver.execute_script(
        "const s = document.createElement('style');"
        "s.textContent = '@keyframes qmove{from{transform:translateX(0)}to{transform:translateX(100px)}}"
        " #qbox{width:10px;height:10px;background:red;animation:qmove 1200ms linear}';"
        "document.head.appendChild(s);"
        "const d = document.createElement('div'); d.id = 'qbox'; document.body.appendChild(d);"
    )

    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=5000)

    assert result["settled"] is True
    # Must have waited out the running animation, not settled on the idle ledger.
    assert result["elapsedMs"] >= 800


def test_infinite_css_animation_is_noise_and_settles(driver, pages):
    _navigate(driver, pages, "blank.html")

    # An infinite-iteration animation (spinner) is periodic noise: it must not
    # block quiescence forever.
    driver.execute_script(
        "const s = document.createElement('style');"
        "s.textContent = '@keyframes qspin{to{transform:rotate(360deg)}}"
        " #qsp{width:10px;height:10px;background:red;animation:qspin 1s linear infinite}';"
        "document.head.appendChild(s);"
        "const d = document.createElement('div'); d.id = 'qsp'; document.body.appendChild(d);"
    )

    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=3000)

    assert result["settled"] is True
    assert result["elapsedMs"] < 1500  # not blocked by the infinite spinner


def test_timeout_reports_active_regions(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__q_c = setInterval("
        "  () => document.body.appendChild(document.createElement('div')), 80);"
    )
    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=1500)
    driver.execute_script("clearInterval(window.__q_c);")

    assert result["settled"] is False
    assert len(result["activeRegions"]) >= 1


# ---------------------------------------------------------------------------
# Region scoping, cooperative annotation, policy, and composition
# ---------------------------------------------------------------------------


def test_root_scoping_ignores_unrelated_churn(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A footer region churns forever; a scoped wait on #main must still settle.
    driver.execute_script(
        "document.body.innerHTML = '<div id=\"main\">ok</div><div id=\"foot\"></div>';"
        "window.__q_f = setInterval("
        "  () => document.getElementById('foot').appendChild(document.createElement('span')), 80);"
    )

    result = _await_dom_settled(driver, root="#main", settle_ms=250, timeout_ms=3000)
    driver.execute_script("clearInterval(window.__q_f);")

    assert result["settled"] is True


def test_mark_dom_inert_is_durable(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A cooperatively inert region keeps structurally mutating; the annotation
    # must be durable across ticks (the settle window spans several).
    driver.execute_script(
        "document.body.innerHTML = '<div id=\"live\"></div>';"
        "window.__q_l = setInterval("
        "  () => document.getElementById('live').appendChild(document.createElement('span')), 80);"
        "window.__quiescence.markDomInert('#live');"
    )

    result = _await_dom_settled(driver, settle_ms=300, timeout_ms=3000)
    driver.execute_script("clearInterval(window.__q_l);")

    assert result["settled"] is True


def test_set_dom_policy_can_disable_css_animation_activity(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const s = document.createElement('style');"
        "s.textContent = '@keyframes qm2{from{transform:translateX(0)}to{transform:translateX(50px)}}"
        " #qb2{width:10px;height:10px;background:blue;animation:qm2 1500ms linear}';"
        "document.head.appendChild(s);"
        "const d = document.createElement('div'); d.id = 'qb2'; document.body.appendChild(d);"
        "window.__quiescence.setDomPolicy({treatCssAnimationsAsActivity: false});"
    )

    result = _await_dom_settled(driver, settle_ms=200, timeout_ms=4000)

    assert result["settled"] is True
    assert result["elapsedMs"] < 800  # animation no longer counted as activity


def test_await_quiet_with_dom_waits_for_animation(driver, pages):
    _navigate(driver, pages, "blank.html")

    # awaitQuiet({dom: true}) composes pending-work quiescence with DOM settle:
    # pending work is idle, but a running animation must still hold it busy.
    driver.execute_script(
        "const s = document.createElement('style');"
        "s.textContent = '@keyframes qm3{from{transform:translateX(0)}to{transform:translateX(50px)}}"
        " #qb3{width:10px;height:10px;background:green;animation:qm3 1000ms linear}';"
        "document.head.appendChild(s);"
        "const d = document.createElement('div'); d.id = 'qb3'; document.body.appendChild(d);"
    )

    result = driver.execute_async_script(
        "const cb = arguments[arguments.length - 1];"
        "window.__quiescence.awaitQuiet({dom: true, settleMs: 100, timeoutMs: 5000}).then(cb);"
    )

    assert result["quiet"] is True
    assert result["elapsedMs"] >= 700
