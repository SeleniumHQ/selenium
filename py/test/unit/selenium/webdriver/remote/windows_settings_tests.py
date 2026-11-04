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

"""User context settings (ADR 17681 decision 8) and closing the last window (decision 3)."""

from unittest.mock import MagicMock

import pytest

from selenium.common.exceptions import NoSuchWindowException, WebDriverException
from selenium.webdriver.remote.windows import Windows, _bidi_prompt_handler, _bidi_proxy


def test_no_proxy_is_not_sent():
    assert _bidi_proxy(None) is None
    assert _bidi_proxy({}) is None


def test_manual_proxy_is_passed_through():
    proxy = {"proxyType": "manual", "httpProxy": "proxy:8080", "noProxy": ["localhost"]}
    assert _bidi_proxy(proxy) == proxy


def test_comma_separated_no_proxy_becomes_a_list():
    proxy = {"proxyType": "manual", "httpProxy": "proxy:8080", "noProxy": "localhost, 127.0.0.1,"}
    assert _bidi_proxy(proxy)["noProxy"] == ["localhost", "127.0.0.1"]


def test_autodetect_flag_is_folded_into_the_type():
    assert _bidi_proxy({"proxyType": "AUTODETECT", "autodetect": True}) == {"proxyType": "autodetect"}


def test_proxy_key_bidi_lacks_fails_instead_of_being_dropped():
    with pytest.raises(WebDriverException, match="ftpProxy"):
        _bidi_proxy({"proxyType": "manual", "ftpProxy": "ftp:21"})


@pytest.mark.parametrize(
    ("classic", "bidi"),
    [
        ("dismiss and notify", "dismiss"),
        ("accept", "accept"),
        ("accept and notify", "accept"),
        ("ignore", "ignore"),
    ],
)
def test_prompt_behavior_string_becomes_default_handler(classic, bidi):
    assert _bidi_prompt_handler(classic) == {"default": bidi}


def test_prompt_behavior_map_is_translated_per_kind():
    assert _bidi_prompt_handler({"alert": "accept", "beforeUnload": "dismiss and notify"}) == {
        "alert": "accept",
        "beforeUnload": "dismiss",
    }


def test_unknown_prompt_behavior_fails():
    with pytest.raises(WebDriverException, match="unhandledPromptBehavior"):
        _bidi_prompt_handler("shrug")


def _windows(caps, browser):
    driver = MagicMock()
    driver.caps = caps
    windows = Windows(driver)
    windows._browser = browser
    return windows


def test_create_user_context_sends_the_session_settings():
    browser = MagicMock()
    browser._execute.return_value = {"userContext": "uc-1"}
    caps = {
        "acceptInsecureCerts": True,
        "proxy": {"proxyType": "pac", "proxyAutoconfigUrl": "http://pac"},
        "unhandledPromptBehavior": "dismiss and notify",
    }
    assert _windows(caps, browser)._create_user_context() == "uc-1"
    (command,) = browser._execute.call_args.args
    assert command == "browser.createUserContext"
    assert browser._execute.call_args.kwargs["params"].as_json() == {
        "acceptInsecureCerts": True,
        "proxy": {"proxyType": "pac", "proxyAutoconfigUrl": "http://pac"},
        "unhandledPromptBehavior": {"default": "dismiss"},
    }


def test_browser_refusing_a_setting_fails_with_its_name():
    browser = MagicMock()
    browser._execute.side_effect = WebDriverException("unsupported operation: per-context proxy")
    caps = {"proxy": {"proxyType": "direct"}}
    with pytest.raises(WebDriverException, match="session's proxy settings"):
        _windows(caps, browser)._create_user_context()


def _bidi_driver(handles, current):
    driver = MagicMock()
    driver.caps = {"webSocketUrl": "ws://localhost/session"}
    driver.window_handles = handles

    def current_window_handle(self):
        # a driver whose current window has closed reports no such window
        if current not in handles:
            raise NoSuchWindowException("current window is closed")
        return current

    type(driver).current_window_handle = property(current_window_handle)
    return driver


def test_closing_the_last_window_uses_the_drivers_close():
    driver = _bidi_driver(["only"], "gone")
    windows = Windows(driver)
    windows._browsing_context = MagicMock()
    windows._close("only")
    driver.switch_to.window.assert_called_once_with("only")
    driver.close.assert_called_once_with()
    windows._browsing_context.close.assert_not_called()


@pytest.mark.parametrize("wait", ["soon", "complete", "interactive"])
def test_wait_takes_page_load_strategy_names_only(wait):
    windows = Windows(_bidi_driver(["only"], "only"))
    with pytest.raises(ValueError, match="normal, eager, none"):
        windows._resolve_wait(wait)


@pytest.mark.parametrize(("wait", "readiness"), [("none", "none"), ("eager", "interactive"), ("normal", "complete")])
def test_wait_maps_strategy_names_to_readiness(wait, readiness):
    windows = Windows(_bidi_driver(["only"], "only"))
    windows._driver.caps["pageLoadStrategy"] = "normal"
    assert windows._resolve_wait(wait) == (readiness, readiness != "complete")


def test_closing_a_background_window_uses_bidi():
    driver = _bidi_driver(["current", "other"], "current")
    windows = Windows(driver)
    windows._browsing_context = MagicMock()
    windows._close("other")
    windows._browsing_context.close.assert_called_once_with(context="other")
    driver.close.assert_not_called()
