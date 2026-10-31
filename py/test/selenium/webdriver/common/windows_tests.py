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

"""Tests for ``driver.windows`` (ADR 17681)."""

import threading
import time

import pytest

from selenium.common.exceptions import InvalidArgumentException, NoSuchWindowException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.windows import (
    Navigation,
    PrintedPage,
    Screenshot,
    UserContext,
    Window,
)
from selenium.webdriver.support.wait import WebDriverWait

PNG_MAGIC = b"\x89PNG"
PDF_MAGIC = b"%PDF"


@pytest.fixture
def bidi(driver):
    if not driver.caps.get("webSocketUrl"):
        pytest.skip("needs a BiDi session (--bidi)")
    return driver


@pytest.fixture(autouse=True)
def close_extra_windows(driver):
    original = driver.current_window_handle
    yield
    for handle in driver.window_handles:
        if handle != original:
            driver.switch_to.window(handle)
            driver.close()
    driver.switch_to.window(original)


def test_current_is_a_window_equal_by_handle(driver):
    current = driver.windows.current
    assert isinstance(current, Window)
    assert current.handle == driver.current_window_handle
    assert current == driver.windows.current
    assert len({current, driver.windows.current}) == 1
    assert current.is_current


def test_open_does_not_move_focus(driver):
    before = driver.current_window_handle
    tab = driver.windows.open()
    assert isinstance(tab, Window)
    assert driver.current_window_handle == before
    assert tab in driver.windows.all()
    assert not tab.is_current


def test_open_rejects_unknown_type(driver):
    with pytest.raises(ValueError):
        driver.windows.open("popup")


def test_get_on_current_window_returns_navigation(driver, pages):
    url = pages.url("simpleTest.html")
    nav = driver.windows.current.get(url)
    assert isinstance(nav, Navigation)
    assert nav.window == driver.windows.current
    assert nav.url == url
    assert driver.title == "Hello WebDriver"


def test_get_in_background_window_keeps_focus(driver, pages):
    driver.get(pages.url("formPage.html"))
    tab = driver.windows.open()
    nav = tab.get(pages.url("simpleTest.html"))
    assert nav.url == pages.url("simpleTest.html")
    assert tab.title == "Hello WebDriver"
    assert tab.url == pages.url("simpleTest.html")
    assert driver.title == "We Leave From Here"


def test_refresh_back_and_forward(driver, pages):
    tab = driver.windows.open()
    tab.get(pages.url("simpleTest.html"))
    tab.get(pages.url("formPage.html"))
    assert tab.back().url == pages.url("simpleTest.html")
    assert tab.forward().url == pages.url("formPage.html")
    assert tab.refresh().url == pages.url("formPage.html")


def test_back_and_forward_wait_for_page_load(bidi, pages):
    # forward() lands on a page left before it finished loading, so it loads again;
    # the document commits at once but its image takes seven seconds
    slow = pages.url("slowLoadingResourcePage.html")
    tab = bidi.windows.open()
    tab.get(pages.url("simpleTest.html"))
    tab.get(slow, wait="none")
    tab.back()
    started = time.monotonic()
    nav = tab.forward()
    assert nav.url == slow
    assert time.monotonic() - started > 3
    assert bidi.script.execute("() => document.readyState", context_id=tab) == "complete"


def test_handlers_skip_events_the_browser_does_not_know(bidi, pages):
    # Firefox, for one, rejects browsingContext.navigationAborted
    windows = bidi.windows
    seen = []
    subscriptions, callbacks = windows._listen(
        ["browsingContext.load", "browsingContext.noSuchEvent"], lambda method: seen.append
    )
    try:
        bidi.get(pages.url("simpleTest.html"))
        WebDriverWait(bidi, 5).until(lambda _: seen)
    finally:
        windows._unlisten(subscriptions, callbacks)
    with pytest.raises(InvalidArgumentException):
        windows._listen(["browsingContext.noSuchEvent"], lambda method: seen.append)


def test_window_operations_ignore_frame_focus(driver, pages):
    driver.get(pages.url("iframes.html"))
    driver.switch_to.frame(0)
    assert driver.windows.current.url == pages.url("iframes.html")


def test_switch_to_window_accepts_a_window(driver):
    tab = driver.windows.open()
    driver.switch_to.window(tab)
    assert driver.current_window_handle == tab.handle
    original = next(w for w in driver.windows.all() if w != tab)
    tab.close()
    original.switch_to()
    assert original.is_current


def test_screenshot_is_an_object(driver, pages, tmp_path):
    tab = driver.windows.open()
    tab.get(pages.url("simpleTest.html"))
    shot = tab.screenshot()
    assert isinstance(shot, Screenshot)
    assert shot.png.startswith(PNG_MAGIC)
    shot.save(str(tmp_path / "shot.png"))
    assert (tmp_path / "shot.png").read_bytes().startswith(PNG_MAGIC)


@pytest.mark.xfail_safari(reason="no endpoint for print in safari")
def test_print_page_is_an_object(driver, pages):
    tab = driver.windows.open()
    tab.get(pages.url("simpleTest.html"))
    printed = tab.print_page()
    assert isinstance(printed, PrintedPage)
    assert printed.pdf.startswith(PDF_MAGIC)


def test_closed_window_raises_no_such_window(driver):
    tab = driver.windows.open()
    tab.close()
    assert tab not in driver.windows.all()
    with pytest.raises(NoSuchWindowException):
        tab.get("about:blank")


def test_full_page_screenshot(bidi, pages):
    tab = bidi.windows.open()
    tab.get(pages.url("simpleTest.html"))
    assert tab.screenshot(full_page=True).png.startswith(PNG_MAGIC)


def test_get_with_wait_override(bidi, pages):
    tab = bidi.windows.open()
    nav = tab.get(pages.url("simpleTest.html"), wait="none")
    assert nav.window == tab
    with pytest.raises(ValueError):
        tab.get(pages.url("simpleTest.html"), wait="soon")


def test_opener_and_user_context(bidi, pages):
    tab = bidi.windows.open()
    assert tab.opener is None
    assert tab.user_context.is_default


def test_activate(bidi):
    tab = bidi.windows.open()
    before = bidi.current_window_handle
    tab.activate()
    assert bidi.current_window_handle == before


def test_isolated_window_has_own_cookies(bidi, pages):
    bidi.get(pages.url("simpleTest.html"))
    bidi.add_cookie({"name": "shared", "value": "main"})
    tab = bidi.windows.open(isolated=True)
    assert not tab.user_context.is_default
    tab.get(pages.url("simpleTest.html"))
    assert bidi.script.execute("() => document.cookie", context_id=tab) == ""
    user_context = tab.user_context
    tab.close()
    assert user_context not in bidi.windows.user_contexts()


def test_user_context_as_context_manager(bidi, pages):
    with bidi.windows.create_user_context() as profile:
        assert isinstance(profile, UserContext)
        a = profile.open()
        b = profile.open()
        assert set(profile.windows()) == {a, b}
        assert a.user_context == profile
    assert profile not in bidi.windows.user_contexts()
    assert a not in bidi.windows.all()


def test_user_context_handlers_see_only_their_windows(bidi, pages):
    outside = bidi.windows.open()
    with bidi.windows.create_user_context() as profile:
        navigations = []
        windows = []
        loaded = threading.Event()

        def on_navigation(n):
            navigations.append(n)
            if n.stage == "load":
                loaded.set()

        profile.add_navigation_handler(on_navigation)
        profile.add_window_handler(windows.append)
        inside = profile.open()  # opened after registering
        outside.get(pages.url("formPage.html"))
        inside.get(pages.url("simpleTest.html"))
        assert loaded.wait(5)
        bidi.windows.clear_navigation_handlers()
        bidi.windows.clear_window_handlers()
    assert navigations
    assert all(n.window == inside for n in navigations)
    assert ("opened", inside) in [(e.kind, e.window) for e in windows]
    assert all(e.user_context == profile for e in windows)


def test_default_user_context_cannot_be_removed(bidi):
    default = bidi.windows.current.user_context
    with pytest.raises(WebDriverException):
        default.remove()


def test_navigation_handler_scoped_to_window(bidi, pages):
    tab = bidi.windows.open()
    other = bidi.windows.open()
    seen = []
    loaded = threading.Event()

    def on_navigation(n):
        seen.append(n)
        if n.stage == "load":
            loaded.set()

    reg = tab.add_navigation_handler(on_navigation)
    other.get(pages.url("formPage.html"))
    tab.get(pages.url("simpleTest.html"))
    assert loaded.wait(5)
    bidi.windows.remove_navigation_handler(reg)
    assert all(n.window == tab for n in seen)
    assert {"started", "load"} <= {n.stage for n in seen}


def test_window_handler_sees_open_and_close(bidi):
    events = []
    closed = threading.Event()

    def on_window(e):
        events.append(e)
        if e.kind == "closed":
            closed.set()

    reg = bidi.windows.add_window_handler(on_window)
    tab = bidi.windows.open()
    tab.close()
    assert closed.wait(5)
    bidi.windows.remove_window_handler(reg)
    kinds = [(e.kind, e.window) for e in events]
    assert ("opened", tab) in kinds
    assert ("closed", tab) in kinds


def test_download_handler(bidi, pages):
    downloads = []
    started = threading.Event()

    ended = threading.Event()

    def on_download(d):
        downloads.append(d)
        if d.stage == "started":
            started.set()
        elif d.stage in ("completed", "canceled"):
            ended.set()

    window = bidi.windows.current
    reg = window.add_download_handler(on_download)
    bidi.get(pages.url("downloads/download.html"))
    bidi.find_element(By.ID, "file-1").click()
    assert started.wait(5)
    assert ended.wait(10)
    bidi.windows.remove_download_handler(reg)
    first, last = downloads[0], downloads[-1]
    assert first.window == window
    assert first.suggested_filename == "file_1.txt"
    assert last.stage in ("completed", "canceled")
    assert last.window == window
    assert last.url == first.url


def test_handler_exception_is_logged_not_raised(bidi, pages, caplog):
    tab = bidi.windows.open()
    called = threading.Event()

    def boom(n):
        called.set()
        raise RuntimeError("boom")

    with caplog.at_level("ERROR", logger="selenium.webdriver.remote.windows"):
        tab.add_navigation_handler(boom)
        tab.get(pages.url("simpleTest.html"))
        assert called.wait(5)
        bidi.windows.clear_navigation_handlers()
    assert any(r.exc_info and "boom" in str(r.exc_info[1]) for r in caplog.records)


def test_handler_scope_rejects_both(bidi):
    with pytest.raises(ValueError):
        bidi.windows.add_navigation_handler(print, window_handle="x", user_context="y")


def test_handlers_need_bidi(driver):
    if driver.caps.get("webSocketUrl"):
        pytest.skip("checks the classic-only session")
    with pytest.raises(WebDriverException, match="enable_bidi"):
        driver.windows.add_navigation_handler(print)
