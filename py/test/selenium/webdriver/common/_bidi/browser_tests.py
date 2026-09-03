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

"""Mirror of ``../bidi/browser_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import os

import pytest

from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common._bidi.browser import (
    Browser,
    ClientWindowInfo,
    ClientWindowInfoState,
    DownloadBehaviorAllowed,
    DownloadBehaviorDenied,
)
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType, ReadinessState
from selenium.webdriver.common._bidi.session import (
    DirectProxyConfiguration,
    ManualProxyConfiguration,
    UserPromptHandler,
    UserPromptHandlerType,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def test_create_user_context(driver):
    browser = Browser(driver)
    result = browser.create_user_context()
    assert result.user_context
    browser.remove_user_context(user_context=result.user_context)


def test_get_user_contexts(driver):
    browser = Browser(driver)
    first = browser.create_user_context().user_context
    second = browser.create_user_context().user_context

    ids = [info.user_context for info in browser.get_user_contexts().user_contexts]
    assert first in ids
    assert second in ids

    browser.remove_user_context(user_context=first)
    browser.remove_user_context(user_context=second)


def test_remove_user_context(driver):
    browser = Browser(driver)
    first = browser.create_user_context().user_context
    second = browser.create_user_context().user_context

    browser.remove_user_context(user_context=second)

    ids = [info.user_context for info in browser.get_user_contexts().user_contexts]
    assert first in ids
    assert second not in ids

    browser.remove_user_context(user_context=first)


def test_get_client_windows(driver):
    result = Browser(driver).get_client_windows()

    assert result.client_windows
    window = result.client_windows[0]
    assert isinstance(window, ClientWindowInfo)
    assert window.client_window
    assert isinstance(window.state, str)
    assert window.width > 0
    assert window.height > 0
    assert isinstance(window.active, bool)
    assert isinstance(window.x, int)
    assert isinstance(window.y, int)


def test_removing_default_user_context_raises(driver):
    with pytest.raises(WebDriverException):
        Browser(driver).remove_user_context(user_context="default")


def test_client_window_state_constants():
    assert ClientWindowInfoState.FULLSCREEN == "fullscreen"
    assert ClientWindowInfoState.MAXIMIZED == "maximized"
    assert ClientWindowInfoState.MINIMIZED == "minimized"
    assert ClientWindowInfoState.NORMAL == "normal"


def test_create_user_context_with_accept_insecure_certs(driver):
    browser = Browser(driver)
    user_context = browser.create_user_context(accept_insecure_certs=True).user_context

    bc = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
    driver.switch_to.window(bc)

    driver.get("https://self-signed.badssl.com/")
    h1 = driver.find_element(By.TAG_NAME, "h1")
    assert h1.text.strip() == "self-signed.\nbadssl.com"

    browser.remove_user_context(user_context=user_context)


def test_create_user_context_with_direct_proxy(driver):
    browser = Browser(driver)
    user_context = browser.create_user_context(proxy=DirectProxyConfiguration()).user_context

    bc = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
    driver.switch_to.window(bc)

    driver.get("http://example.com/")
    assert "example domain" in driver.find_element(By.TAG_NAME, "body").text.lower()

    browser.remove_user_context(user_context=user_context)


def test_create_user_context_with_unhandled_prompt_behavior(driver):
    browser = Browser(driver)
    handler = UserPromptHandler(
        alert=UserPromptHandlerType.DISMISS,
        default=UserPromptHandlerType.DISMISS,
        prompt=UserPromptHandlerType.DISMISS,
    )
    user_context = browser.create_user_context(unhandled_prompt_behavior=handler).user_context

    ids = [info.user_context for info in browser.get_user_contexts().user_contexts]
    assert user_context in ids

    browser.remove_user_context(user_context=user_context)


@pytest.mark.xfail_chrome(reason="Chrome auto upgrades HTTP to HTTPS in untrusted networks like CI environments")
def test_create_user_context_with_manual_proxy_all_params(driver, proxy_server):
    create_proxy_server = proxy_server(response_content=b"proxied response")
    no_proxy_server = proxy_server(response_content=b"direct connection - not proxied")
    proxy_port = create_proxy_server["port"]
    no_proxy_port = no_proxy_server["port"]

    proxy = ManualProxyConfiguration(
        http_proxy=f"localhost:{proxy_port}",
        ssl_proxy=f"localhost:{proxy_port}",
        socks_proxy=f"localhost:{proxy_port}",
        socks_version=5,
        no_proxy=[f"localhost:{no_proxy_port}"],
    )
    browser = Browser(driver)
    user_context = browser.create_user_context(proxy=proxy).user_context

    bc = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
    driver.switch_to.window(bc)

    try:
        driver.get(f"http://localhost:{no_proxy_port}/")
        assert "direct connection - not proxied" in driver.find_element(By.TAG_NAME, "body").text.lower()

        driver.get("http://example.com/")
        assert "proxied response" in driver.find_element(By.TAG_NAME, "body").text.lower()
    finally:
        browser.remove_user_context(user_context=user_context)


@pytest.mark.xfail_chrome(reason="Chrome auto upgrades HTTP to HTTPS in untrusted networks like CI environments")
def test_create_user_context_with_proxy_and_accept_insecure_certs(driver, proxy_server):
    create_proxy_server = proxy_server(response_content=b"proxied response")
    port = create_proxy_server["port"]

    proxy = ManualProxyConfiguration(
        http_proxy=f"localhost:{port}",
        ssl_proxy=f"localhost:{port}",
        socks_proxy=f"localhost:{port}",
        socks_version=5,
        no_proxy=["self-signed.badssl.com"],
    )
    browser = Browser(driver)
    user_context = browser.create_user_context(accept_insecure_certs=True, proxy=proxy).user_context

    bc = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
    driver.switch_to.window(bc)

    try:
        driver.get("https://self-signed.badssl.com/")
        assert "badssl.com" in driver.find_element(By.TAG_NAME, "h1").text.lower()

        driver.get("http://example.com/")
        assert "proxied response" in driver.find_element(By.TAG_NAME, "body").text.lower()
    finally:
        browser.remove_user_context(user_context=user_context)


# The facade's ``set_download_behavior(allowed=..., destination_folder=...)`` builds a
# DownloadBehavior union; the generated command takes the typed variant directly.


@pytest.mark.xfail_firefox
def test_set_download_behavior_allowed(driver, pages, tmp_path):
    browser = Browser(driver)
    try:
        browser.set_download_behavior(download_behavior=DownloadBehaviorAllowed(destination_folder=str(tmp_path)))

        context_id = driver.current_window_handle
        BrowsingContext(driver).navigate(
            context=context_id, url=pages.url("downloads/download.html"), wait=ReadinessState.COMPLETE
        )
        driver.find_element(By.ID, "file-1").click()

        WebDriverWait(driver, 5).until(lambda d: "file_1.txt" in os.listdir(tmp_path))
        assert "file_1.txt" in os.listdir(tmp_path)
    finally:
        browser.set_download_behavior(download_behavior=None)


@pytest.mark.xfail_firefox
def test_set_download_behavior_denied(driver, pages, tmp_path):
    browser = Browser(driver)
    try:
        browser.set_download_behavior(download_behavior=DownloadBehaviorDenied())

        context_id = driver.current_window_handle
        BrowsingContext(driver).navigate(
            context=context_id, url=pages.url("downloads/download.html"), wait=ReadinessState.COMPLETE
        )
        driver.find_element(By.ID, "file-1").click()

        with pytest.raises(TimeoutException):
            WebDriverWait(driver, 3, poll_frequency=0.2).until(lambda _: len(os.listdir(tmp_path)) > 0)
    finally:
        browser.set_download_behavior(download_behavior=None)


@pytest.mark.xfail_firefox
def test_set_download_behavior_user_context(driver, pages, tmp_path):
    browser = Browser(driver)
    user_context = browser.create_user_context().user_context
    try:
        bc = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
        driver.switch_to.window(bc)
        try:
            browser.set_download_behavior(
                download_behavior=DownloadBehaviorAllowed(destination_folder=str(tmp_path)),
                user_contexts=[user_context],
            )
            BrowsingContext(driver).navigate(
                context=bc, url=pages.url("downloads/download.html"), wait=ReadinessState.COMPLETE
            )
            driver.find_element(By.ID, "file-1").click()

            WebDriverWait(driver, 5).until(lambda d: "file_1.txt" in os.listdir(tmp_path))
            initial_file_count = len(os.listdir(tmp_path))

            browser.set_download_behavior(download_behavior=DownloadBehaviorDenied(), user_contexts=[user_context])
            driver.find_element(By.ID, "file-2").click()

            with pytest.raises(TimeoutException):
                WebDriverWait(driver, 3, poll_frequency=0.2).until(
                    lambda _: len(os.listdir(tmp_path)) > initial_file_count
                )
        finally:
            browser.set_download_behavior(download_behavior=None, user_contexts=[user_context])
    finally:
        browser.remove_user_context(user_context=user_context)
