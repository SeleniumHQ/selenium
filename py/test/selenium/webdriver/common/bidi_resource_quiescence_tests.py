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

"""Integration tests for subresource-loading quiescence.

The pending-work ledger (``bidi_quiescence_tests.py``) tracks timers and
script-initiated network (fetch/XHR/WebSocket), but a page is not "done" while
an ``<img>``, ``<iframe>``, ``<script src>``, stylesheet, or media element is
still fetching. These tests cover the ``resource`` blocker class: outstanding
subresource loads held in the ledger until their ``load``/``error`` (or, for
media, first-data/``suspend``) events fire.
"""

from selenium.webdriver.support.ui import WebDriverWait


def _navigate(driver, pages, name, wait="complete"):
    """Navigate to a served page via BiDi, which registers the preload."""
    driver.browsing_context.navigate(
        context=driver.current_window_handle,
        url=pages.url(name),
        wait=wait,
    )


def _is_quiet(driver):
    return driver.execute_script("return window.__quiescence.isQuiet();")


def _blockers(driver):
    return driver.execute_script("return window.__quiescence.getBlockers();")


def _await_quiet(driver, timeout_ms=8000, settle_ms=50):
    return driver.execute_async_script(
        "const done = arguments[arguments.length - 1];"
        "window.__quiescence.awaitQuiet({timeoutMs: arguments[0], settleMs: arguments[1]})"
        "  .then(done);",
        timeout_ms,
        settle_ms,
    )


# ---------------------------------------------------------------------------
# Images
# ---------------------------------------------------------------------------


def test_slow_image_is_a_resource_blocker(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const i = document.createElement('img'); i.src = '/slow?ms=3000&img=1'; document.body.appendChild(i);"
    )

    blockers = [b for b in _blockers(driver) if b["type"] == "resource"]
    assert blockers
    assert blockers[0]["kind"] == "img"
    assert "/slow" in blockers[0]["url"]


def test_await_quiet_waits_for_slow_image(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const i = document.createElement('img'); i.src = '/slow?ms=1200&img=1'; document.body.appendChild(i);"
    )

    result = _await_quiet(driver)

    assert result["quiet"] is True
    assert result["elapsedMs"] >= 1000


def test_broken_image_clears_on_error(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const i = document.createElement('img'); i.src = '/definitely-not-a-real-image.png';"
        "document.body.appendChild(i);"
    )

    result = _await_quiet(driver, timeout_ms=5000)

    assert result["quiet"] is True


def test_detached_image_load_blocks(driver, pages):
    _navigate(driver, pages, "blank.html")

    # An Image never inserted into the DOM still performs a network fetch; the
    # MutationObserver cannot see it, so the src setter hook must.
    driver.execute_script("window.__q_img = new Image(); window.__q_img.src = '/slow?ms=1200&img=1';")

    assert any(b["type"] == "resource" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_lazy_offscreen_image_does_not_block(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A loading="lazy" image far outside the viewport does not fetch, so it
    # must not be tracked (it would otherwise block until timeout).
    driver.execute_script(
        "document.body.style.height = '30000px';"
        "const i = document.createElement('img');"
        "i.loading = 'lazy';"
        "i.style.cssText = 'position:absolute;top:25000px';"
        "i.src = '/slow?ms=5000&img=1';"
        "document.body.appendChild(i);"
    )

    assert not any(b["type"] == "resource" for b in _blockers(driver))


def test_completed_image_does_not_block(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const i = document.createElement('img'); i.id = 'done'; i.src = '/button.png';"
        "document.body.appendChild(i);"
    )
    WebDriverWait(driver, 5).until(lambda d: d.execute_script("return document.getElementById('done').complete;"))

    assert _is_quiet(driver) is True


def test_image_src_change_retracks(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const i = document.createElement('img'); i.id = 'r'; i.src = '/button.png';"
        "document.body.appendChild(i);"
    )
    WebDriverWait(driver, 5).until(lambda d: d.execute_script("return document.getElementById('r').complete;"))
    assert _is_quiet(driver) is True

    # Swapping src via setAttribute exercises the attribute-mutation path.
    driver.execute_script("document.getElementById('r').setAttribute('src', '/slow?ms=1200&img=1');")

    assert any(b["type"] == "resource" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_parser_created_slow_image_is_awaited(driver, pages):
    # wait="interactive" returns at DOMContentLoaded, while the parser-created
    # image's bytes are still arriving; the DOMContentLoaded sweep must have
    # picked it up.
    _navigate(driver, pages, "slow_loading_resources.html", wait="interactive")

    result = _await_quiet(driver)

    assert result["quiet"] is True
    assert result["elapsedMs"] >= 300


# ---------------------------------------------------------------------------
# Frames, objects, scripts, stylesheets, media
# ---------------------------------------------------------------------------


def test_slow_iframe_blocks_until_loaded(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const f = document.createElement('iframe'); f.src = '/slow?ms=1200'; document.body.appendChild(f);"
    )

    assert any(b["type"] == "resource" and b["kind"] == "iframe" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_dynamic_script_blocks_until_fetched(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const s = document.createElement('script'); s.src = '/slow?ms=1200'; document.body.appendChild(s);"
    )

    assert any(b["type"] == "resource" and b["kind"] == "script" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_stylesheet_link_blocks_until_fetched(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/slow?ms=1200';"
        "document.head.appendChild(l);"
    )

    assert any(b["type"] == "resource" and b["kind"] == "stylesheet" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_object_data_blocks_until_loaded(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "const o = document.createElement('object'); o.type = 'text/plain'; o.data = '/slow?ms=1200';"
        "document.body.appendChild(o);"
    )

    assert any(b["type"] == "resource" and b["kind"] == "object" for b in _blockers(driver))

    result = _await_quiet(driver)
    assert result["quiet"] is True
    assert result["elapsedMs"] >= 900


def test_video_preload_none_does_not_hang(driver, pages):
    _navigate(driver, pages, "blank.html")

    # A preload="none" video performs no fetch; quiescence must not wait on it.
    driver.execute_script(
        "const v = document.createElement('video'); v.preload = 'none'; v.src = '/missing.webm';"
        "document.body.appendChild(v);"
    )

    result = _await_quiet(driver, timeout_ms=4000)

    assert result["quiet"] is True
    assert result["elapsedMs"] < 1500


# ---------------------------------------------------------------------------
# Policy
# ---------------------------------------------------------------------------


def test_count_resource_loads_policy_off(driver, pages):
    _navigate(driver, pages, "blank.html")

    quiet = driver.execute_script(
        "window.__quiescence.setPolicy({countResourceLoads: false});"
        "const i = document.createElement('img'); i.src = '/slow?ms=3000&img=1'; document.body.appendChild(i);"
        "return window.__quiescence.isQuiet();"
    )

    assert quiet is True


def test_ignored_url_pattern_resource_does_not_block(driver, pages):
    _navigate(driver, pages, "blank.html")

    driver.execute_script(
        "window.__quiescence.setPolicy({ignoreUrlPatterns: ['tracking-pixel']});"
        "const i = document.createElement('img'); i.src = '/slow?ms=3000&img=1&tracking-pixel=1';"
        "document.body.appendChild(i);"
    )

    assert _is_quiet(driver) is True
