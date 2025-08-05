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

import http.server
import socketserver
import threading

import pytest

from selenium.webdriver.common.bidi.browser import ClientWindowInfo, ClientWindowState
from selenium.webdriver.common.bidi.session import UserPromptHandler, UserPromptHandlerType
from selenium.webdriver.common.by import By
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.common.utils import free_port
from selenium.webdriver.common.window import WindowTypes


class FakeProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"[Fake Proxy] Intercepted request to: {self.path}")
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"proxied response")


def start_fake_proxy(port):
    server = socketserver.TCPServer(("localhost", port), FakeProxyHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def test_browser_initialized(driver):
    """Test that the browser module is initialized properly."""
    assert driver.browser is not None


def test_create_user_context(driver):
    """Test creating a user context."""
    user_context = driver.browser.create_user_context()
    assert user_context is not None

    # Clean up
    driver.browser.remove_user_context(user_context)


def test_get_user_contexts(driver):
    """Test getting user contexts."""
    user_context1 = driver.browser.create_user_context()
    user_context2 = driver.browser.create_user_context()

    user_contexts = driver.browser.get_user_contexts()
    # it should be 3 since there is a default user context present, therefore >= 2
    assert len(user_contexts) >= 2

    # Clean up
    driver.browser.remove_user_context(user_context1)
    driver.browser.remove_user_context(user_context2)


def test_remove_user_context(driver):
    """Test removing a user context."""
    user_context1 = driver.browser.create_user_context()
    user_context2 = driver.browser.create_user_context()

    user_contexts = driver.browser.get_user_contexts()
    assert len(user_contexts) >= 2

    driver.browser.remove_user_context(user_context2)

    updated_user_contexts = driver.browser.get_user_contexts()
    assert user_context1 in updated_user_contexts
    assert user_context2 not in updated_user_contexts

    # Clean up
    driver.browser.remove_user_context(user_context1)


def test_get_client_windows(driver):
    """Test getting client windows."""
    client_windows = driver.browser.get_client_windows()

    assert client_windows is not None
    assert len(client_windows) > 0

    window_info = client_windows[0]
    assert isinstance(window_info, ClientWindowInfo)
    assert window_info.get_client_window() is not None
    assert window_info.get_state() is not None
    assert isinstance(window_info.get_state(), str)
    assert window_info.get_width() > 0
    assert window_info.get_height() > 0
    assert isinstance(window_info.is_active(), bool)
    assert window_info.get_x() >= 0
    assert window_info.get_y() >= 0


def test_raises_exception_when_removing_default_user_context(driver):
    with pytest.raises(Exception):
        driver.browser.remove_user_context("default")


def test_client_window_state_constants(driver):
    assert ClientWindowState.FULLSCREEN == "fullscreen"
    assert ClientWindowState.MAXIMIZED == "maximized"
    assert ClientWindowState.MINIMIZED == "minimized"
    assert ClientWindowState.NORMAL == "normal"


def test_create_user_context_with_accept_insecure_certs(driver):
    """Test creating a user context with accept_insecure_certs parameter."""
    INSECURE_TEST_SITE = "https://self-signed.badssl.com/"
    user_context = driver.browser.create_user_context(accept_insecure_certs=True)

    bc = driver.browsing_context.create(type=WindowTypes.WINDOW, user_context=user_context)
    driver.switch_to.window(bc)
    assert user_context is not None
    assert bc is not None

    driver.get(INSECURE_TEST_SITE)

    h1 = driver.find_element(By.TAG_NAME, "h1")
    assert h1.text.strip() == "self-signed.\nbadssl.com"

    # Clean up
    driver.browser.remove_user_context(user_context)


def test_create_user_context_with_direct_proxy(driver):
    """Test creating a user context with direct proxy configuration."""
    proxy = Proxy()
    proxy.proxy_type = ProxyType.DIRECT

    user_context = driver.browser.create_user_context(proxy=proxy)
    assert user_context is not None

    bc = driver.browsing_context.create(type=WindowTypes.WINDOW, user_context=user_context)
    driver.switch_to.window(bc)

    # Visiting a site should load directly without proxy
    driver.get("http://example.com/")
    body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
    assert "example domain" in body_text

    # Clean up
    driver.browser.remove_user_context(user_context)


@pytest.mark.xfail_chrome(reason="Chrome auto upgrades HTTP to HTTPS in untrusted networks like CI environments")
@pytest.mark.xfail_firefox(reason="Firefox proxy settings are different")
@pytest.mark.xfail_remote
def test_create_user_context_with_manual_proxy_all_params(driver):
    """Test creating a user context with manual proxy configuration."""
    # Start a fake proxy server
    port = free_port()
    fake_proxy_server = start_fake_proxy(port=port)

    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = f"localhost:{port}"
    proxy.ssl_proxy = f"localhost:{port}"
    proxy.socks_proxy = f"localhost:{port}"
    proxy.socks_version = 5
    proxy.no_proxy = ["the-internet.herokuapp.com"]

    user_context = driver.browser.create_user_context(proxy=proxy)

    # Create and switch to a new browsing context using this proxy
    bc = driver.browsing_context.create(type=WindowTypes.WINDOW, user_context=user_context)
    driver.switch_to.window(bc)

    try:
        # Visit no proxy site, it should bypass proxy
        driver.get("http://the-internet.herokuapp.com/")
        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "welcome to the-internet" in body_text

        # Visit a site that should be proxied
        driver.get("http://example.com/")

        body_text = driver.find_element("tag name", "body").text
        assert "proxied response" in body_text.lower()

    finally:
        driver.browser.remove_user_context(user_context)
        fake_proxy_server.shutdown()
        fake_proxy_server.server_close()


@pytest.mark.xfail_chrome(reason="Chrome auto upgrades HTTP to HTTPS in untrusted networks like CI environments")
@pytest.mark.xfail_firefox(reason="Firefox proxy settings are different")
@pytest.mark.xfail_remote
def test_create_user_context_with_proxy_and_accept_insecure_certs(driver):
    """Test creating a user context with both acceptInsecureCerts and proxy parameters."""
    # Start fake proxy server
    port = free_port()
    fake_proxy_server = start_fake_proxy(port=port)

    proxy = Proxy()
    proxy.proxy_type = ProxyType.MANUAL
    proxy.http_proxy = f"localhost:{port}"
    proxy.ssl_proxy = f"localhost:{port}"
    proxy.no_proxy = ["self-signed.badssl.com"]

    user_context = driver.browser.create_user_context(accept_insecure_certs=True, proxy=proxy)

    bc = driver.browsing_context.create(type=WindowTypes.WINDOW, user_context=user_context)
    driver.switch_to.window(bc)

    try:
        # Visit a site with an invalid certificate
        driver.get("https://self-signed.badssl.com/")
        h1 = driver.find_element(By.TAG_NAME, "h1")
        assert "badssl.com" in h1.text.lower()

        # Visit a site that should go through the fake proxy
        driver.get("http://example.com/")
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert "proxied response" in body_text.lower()

    finally:
        driver.browser.remove_user_context(user_context)
        fake_proxy_server.shutdown()
        fake_proxy_server.server_close()


def test_create_user_context_with_unhandled_prompt_behavior(driver, pages):
    """Test creating a user context with unhandled prompt behavior configuration."""
    prompt_handler = UserPromptHandler(
        alert=UserPromptHandlerType.DISMISS, default=UserPromptHandlerType.DISMISS, prompt=UserPromptHandlerType.DISMISS
    )

    user_context = driver.browser.create_user_context(unhandled_prompt_behavior=prompt_handler)
    assert user_context is not None

    # create a new browsing context with the user context
    bc = driver.browsing_context.create(type=WindowTypes.WINDOW, user_context=user_context)
    assert bc is not None

    driver.switch_to.window(bc)
    pages.load("alerts.html")

    # TODO: trigger an alert and test that it is dismissed automatically, currently not working,
    #  conftest.py unhandled_prompt_behavior set to IGNORE, see if it is related
    # driver.find_element(By.ID, "alert").click()
    # # accessing title should be possible since alert is auto handled
    # assert driver.title == "Testing Alerts"

    # Clean up
    driver.browser.remove_user_context(user_context)
