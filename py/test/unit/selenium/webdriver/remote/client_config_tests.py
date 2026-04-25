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

import base64
import os
from unittest.mock import patch

import pytest

from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.remote.client_config import AuthType, ClientConfig


def _make_config(**overrides):
    defaults = {"remote_server_addr": "http://localhost:4444"}
    defaults.update(overrides)
    return ClientConfig(**defaults)


# ── AuthType enum ────────────────────────────────────────────────


def test_authtype_values():
    assert AuthType.BASIC.value == "Basic"
    assert AuthType.BEARER.value == "Bearer"
    assert AuthType.X_API_KEY.value == "X-API-Key"


# ── _ClientConfigDescriptor ───────────────────────────────────────


def test_descriptor_get_and_set():
    config = _make_config()
    assert config.remote_server_addr == "http://localhost:4444"
    config.remote_server_addr = "http://new-host:5555"
    assert config.remote_server_addr == "http://new-host:5555"


def test_descriptor_defaults():
    config = _make_config()
    assert config.keep_alive is True
    assert config.ignore_certificates is False
    assert config.auth_type is AuthType.BASIC


# ── __init__ defaults ────────────────────────────────────────────


def test_init_defaults():
    config = _make_config()
    assert config.remote_server_addr == "http://localhost:4444"
    assert config.keep_alive is True
    assert config.proxy.proxy_type == ProxyType.SYSTEM
    assert config.ignore_certificates is False
    assert config.init_args_for_pool_manager == {}
    assert config.username is None
    assert config.password is None
    assert config.auth_type is AuthType.BASIC
    assert config.token is None
    assert config.user_agent is None
    assert config.extra_headers is None
    assert config.websocket_timeout == 30.0
    assert config.websocket_interval == 0.1


def test_init_explicit_values():
    proxy = Proxy(raw={"proxyType": ProxyType.MANUAL, "httpProxy": "localhost:8080"})
    config = ClientConfig(
        remote_server_addr="http://grid:4444",
        keep_alive=False,
        proxy=proxy,
        ignore_certificates=True,
        timeout=60,
        username="user1",
        password="pass1",
        auth_type=AuthType.BEARER,
        token="tok123",
        user_agent="MyAgent/1.0",
        extra_headers={"X-Custom": "1"},
        websocket_timeout=10.0,
        websocket_interval=0.5,
    )
    assert config.remote_server_addr == "http://grid:4444"
    assert config.keep_alive is False
    assert config.ignore_certificates is True
    assert config.timeout == 60
    assert config.username == "user1"
    assert config.auth_type is AuthType.BEARER
    assert config.websocket_timeout == 10.0
    assert config.websocket_interval == 0.5


# ── timeout ───────────────────────────────────────────────────────


def test_timeout_default_uses_socket():
    """When timeout=None, timeout should be socket.getdefaulttimeout()."""
    with patch("socket.getdefaulttimeout", return_value=42):
        config = _make_config(timeout=None)
        assert config.timeout == 42


def test_timeout_explicit():
    config = _make_config(timeout=120)
    assert config.timeout == 120


# ── ca_certs ─────────────────────────────────────────────────────


def test_ca_certs_default():
    """Default ca_certs should come from certifi (or REQUESTS_CA_BUNDLE env)."""
    config = _make_config()
    assert isinstance(config.ca_certs, str)
    assert len(config.ca_certs) > 0


def test_ca_certs_from_env(monkeypatch):
    monkeypatch.setenv("REQUESTS_CA_BUNDLE", "/path/from/env")
    config = _make_config()
    assert config.ca_certs == "/path/from/env"


def test_ca_certs_explicit():
    config = _make_config(ca_certs="/explicit/path.pem")
    assert config.ca_certs == "/explicit/path.pem"


# ── reset_timeout ────────────────────────────────────────────────


def test_reset_timeout():
    with patch("socket.getdefaulttimeout", return_value=99):
        config = _make_config(timeout=10)
        assert config.timeout == 10
        config.reset_timeout()
        assert config.timeout == 99


# ── get_auth_header ──────────────────────────────────────────────


def test_auth_header_none_when_no_credentials():
    config = _make_config()
    assert config.get_auth_header() is None


def test_auth_header_basic():
    config = _make_config(username="alice", password="secret")
    header = config.get_auth_header()
    assert header is not None
    assert header["Authorization"].startswith("Basic ")
    decoded = base64.b64decode(header["Authorization"].split(" ")[1]).decode("utf-8")
    assert decoded == "alice:secret"


def test_auth_header_bearer():
    config = _make_config(auth_type=AuthType.BEARER, token="my-bearer-token")
    header = config.get_auth_header()
    assert header == {"Authorization": "Bearer my-bearer-token"}


def test_auth_header_x_api_key():
    config = _make_config(auth_type=AuthType.X_API_KEY, token="my-api-key")
    header = config.get_auth_header()
    assert header == {"X-API-Key": "my-api-key"}


def test_auth_header_basic_missing_password():
    """BASIC auth requires both username and password."""
    config = _make_config(username="alice", password=None)
    assert config.get_auth_header() is None


def test_auth_header_bearer_missing_token():
    config = _make_config(auth_type=AuthType.BEARER, token=None)
    assert config.get_auth_header() is None


def test_auth_header_x_api_key_missing_token():
    config = _make_config(auth_type=AuthType.X_API_KEY, token=None)
    assert config.get_auth_header() is None


# ── get_proxy_url ────────────────────────────────────────────────


def test_proxy_url_direct():
    config = _make_config(
        remote_server_addr="http://example.com:4444",
        proxy=Proxy(raw={"proxyType": ProxyType.DIRECT}),
    )
    assert config.get_proxy_url() is None


def test_proxy_url_system_no_env():
    """SYSTEM proxy without env vars set should return None or http_proxy/https_proxy."""
    config = _make_config(remote_server_addr="http://example.com:4444")
    # SYSTEM with no env vars → os.environ.get returns None → get_proxy_url returns None
    with patch.dict(os.environ, {}, clear=False):
        # Make sure no proxy env vars are set
        for key in ["http_proxy", "HTTP_PROXY", "https_proxy", "HTTPS_PROXY", "no_proxy", "NO_PROXY"]:
            os.environ.pop(key, None)
        url = config.get_proxy_url()
        # With no env vars, should be None
        assert url is None


def test_proxy_url_system_with_http_proxy(monkeypatch):
    monkeypatch.setenv("http_proxy", "http://proxy:8080")
    config = _make_config(remote_server_addr="http://example.com:4444")
    assert config.get_proxy_url() == "http://proxy:8080"


def test_proxy_url_system_with_https_proxy(monkeypatch):
    monkeypatch.setenv("https_proxy", "http://secure-proxy:8443")
    config = _make_config(remote_server_addr="https://example.com:4444")
    assert config.get_proxy_url() == "http://secure-proxy:8443"


def test_proxy_url_system_no_proxy_asterisk(monkeypatch):
    """no_proxy=* means bypass proxy for all hosts."""
    monkeypatch.setenv("http_proxy", "http://proxy:8080")
    monkeypatch.setenv("no_proxy", "*")
    config = _make_config(remote_server_addr="http://example.com:4444")
    assert config.get_proxy_url() is None


def test_proxy_url_system_no_proxy_host_match(monkeypatch):
    monkeypatch.setenv("http_proxy", "http://proxy:8080")
    monkeypatch.setenv("no_proxy", "example.com,other.com")
    config = _make_config(remote_server_addr="http://example.com:4444")
    assert config.get_proxy_url() is None


def test_proxy_url_manual_http():
    proxy = Proxy(raw={"proxyType": ProxyType.MANUAL, "httpProxy": "http://manual:8080"})
    config = _make_config(remote_server_addr="http://example.com:4444", proxy=proxy)
    assert config.get_proxy_url() == "http://manual:8080"


def test_proxy_url_manual_https():
    proxy = Proxy(raw={"proxyType": ProxyType.MANUAL, "sslProxy": "http://secure:8443"})
    config = _make_config(remote_server_addr="https://example.com:4444", proxy=proxy)
    assert config.get_proxy_url() == "http://secure:8443"


def test_proxy_url_manual_https_without_ssl_proxy():
    """For HTTPS remote address, manual proxy returns empty string when sslProxy not set."""
    proxy = Proxy(raw={"proxyType": ProxyType.MANUAL, "httpProxy": "http://fallback:8080"})
    config = _make_config(remote_server_addr="https://example.com:4444", proxy=proxy)
    # sslProxy not set, get_proxy_url returns empty string (not None)
    assert config.get_proxy_url() == ""
