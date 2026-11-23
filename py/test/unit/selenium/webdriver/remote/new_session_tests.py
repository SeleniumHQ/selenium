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

from importlib import import_module

import pytest

from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.options import ArgOptions, PageLoadStrategy
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.remote import webdriver
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver


def test_converts_proxy_type_value_to_lowercase_for_w3c(mocker):
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    w3c_caps = {"pageLoadStrategy": "normal", "proxy": {"proxyType": "manual", "httpProxy": "foo"}}
    options = ArgOptions()
    proxy = Proxy({"proxyType": ProxyType.MANUAL, "httpProxy": "foo"})
    options.proxy = proxy
    WebDriver(options=options)
    command, params = mock.call_args[0]
    assert command == Command.NEW_SESSION
    always_match = params["capabilities"]["alwaysMatch"]
    always_match.pop("se:remoteUrl", None)
    assert params["capabilities"]["firstMatch"] == [{}]
    assert always_match == w3c_caps


def test_advertises_remote_url_for_remote_session(mocker):
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    driver = WebDriver(command_executor="http://remote.example:4444", options=ArgOptions())
    command, params = mock.call_args[0]
    assert command == Command.NEW_SESSION
    assert driver._remote_url() is not None
    assert params["capabilities"]["alwaysMatch"]["se:remoteUrl"] == driver._remote_url()


def test_does_not_advertise_remote_url_for_local_driver(mocker):
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")

    class LocalLikeDriver(WebDriver):
        def __init__(self, **kwargs):
            # Local drivers (ChromeDriver, etc.) set ``service`` before start_session runs,
            # so the actual new-session payload must omit se:remoteUrl.
            self.service = object()
            super().__init__(**kwargs)

    driver = LocalLikeDriver(command_executor="http://remote.example:4444", options=ArgOptions())
    command, params = mock.call_args[0]
    assert command == Command.NEW_SESSION
    assert driver._remote_url() is None
    assert "se:remoteUrl" not in params["capabilities"]["alwaysMatch"]


def test_works_as_context_manager(mocker):
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    quit_ = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.quit")

    with WebDriver(options=ChromeOptions()) as driver:
        assert isinstance(driver, WebDriver)

    assert quit_.call_count == 1


@pytest.mark.parametrize("browser_name", ["firefox", "chrome", "ie"])
def test_acepts_options_to_remote_driver(mocker, browser_name):
    options = import_module(f"selenium.webdriver.{browser_name}.options")
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.start_session")

    opts = options.Options()
    opts.add_argument("foo")

    WebDriver(options=opts)

    expected_caps = opts.to_capabilities()
    mock.assert_called_with(expected_caps)


def test_always_match_if_2_of_the_same_options():
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.chrome.options import Options as ChromeOptions2

    co1 = ChromeOptions()
    co1.add_argument("foo")
    co2 = ChromeOptions2()
    co2.add_argument("bar")

    expected = {
        "capabilities": {
            "alwaysMatch": {
                "browserName": "chrome",
                "pageLoadStrategy": PageLoadStrategy.normal,
            },
            "firstMatch": [
                {"goog:chromeOptions": {"args": ["foo"], "extensions": []}},
                {"goog:chromeOptions": {"args": ["bar"], "extensions": []}},
            ],
        }
    }
    result = webdriver.create_matches([co1, co2])
    assert expected == result


def test_first_match_when_2_different_option_types():
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.firefox.options import Options as FirefoxOptions

    expected = {
        "capabilities": {
            "alwaysMatch": {"pageLoadStrategy": PageLoadStrategy.normal},
            "firstMatch": [
                {"browserName": "chrome", "goog:chromeOptions": {"extensions": [], "args": []}},
                {
                    "browserName": "firefox",
                    "acceptInsecureCerts": True,
                    "moz:debuggerAddress": True,
                    "moz:firefoxOptions": {"args": ["foo"], "prefs": {"remote.active-protocols": 1}},
                },
            ],
        }
    }

    firefox_options = FirefoxOptions()
    firefox_options.add_argument("foo")
    result = webdriver.create_matches([ChromeOptions(), firefox_options])
    assert expected == result


def test_first_match_with_three_options_including_a_different_browser():
    from selenium.webdriver.firefox.options import Options as FirefoxOptions

    # Regression: this used to raise ``KeyError: 'goog:chromeOptions'`` because a key
    # shared by only an adjacent pair was deleted from every option set.
    result = webdriver.create_matches([ChromeOptions(), ChromeOptions(), FirefoxOptions()])
    caps = result["capabilities"]

    # Only capabilities present with an identical value in *all three* sets belong in
    # alwaysMatch. browserName differs (firefox), goog:chromeOptions is absent for firefox.
    assert caps["alwaysMatch"] == {"pageLoadStrategy": PageLoadStrategy.normal}
    assert [fm.get("browserName") for fm in caps["firstMatch"]] == ["chrome", "chrome", "firefox"]


def test_first_match_keeps_capabilities_unique_to_one_option():
    a = ChromeOptions()
    a.add_argument("--foo")
    b = ChromeOptions()
    b.add_argument("--foo")
    c = ChromeOptions()
    c.add_argument("--DIFFERENT")

    caps = webdriver.create_matches([a, b, c])["capabilities"]

    assert "goog:chromeOptions" not in caps["alwaysMatch"]
    assert caps["firstMatch"][0]["goog:chromeOptions"]["args"] == ["--foo"]
    assert caps["firstMatch"][2]["goog:chromeOptions"]["args"] == ["--DIFFERENT"]


def test_list_of_options_is_not_double_wrapped_in_new_session(mocker):
    from selenium.webdriver.firefox.options import Options as FirefoxOptions

    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    WebDriver(options=[ChromeOptions(), ChromeOptions(), FirefoxOptions()])

    command, params = mock.call_args[0]
    assert command == Command.NEW_SESSION
    caps = params["capabilities"]
    assert "capabilities" not in caps["alwaysMatch"]
    assert len(caps["firstMatch"]) == 3
    assert [fm.get("browserName") for fm in caps["firstMatch"]] == ["chrome", "chrome", "firefox"]
