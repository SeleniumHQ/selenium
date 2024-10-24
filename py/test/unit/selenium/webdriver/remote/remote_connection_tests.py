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

from unittest.mock import patch
from urllib import parse

import pytest
import urllib3

from selenium import __version__
from selenium.webdriver.remote.remote_connection import ClientConfig
from selenium.webdriver.remote.remote_connection import RemoteConnection


@pytest.fixture
def remote_connection():
    """Fixture to create a RemoteConnection instance."""
    return RemoteConnection("http://localhost:4444")


def test_add_command(remote_connection):
    """Test adding a custom command to the connection."""
    remote_connection.add_command("CUSTOM_COMMAND", "PUT", "/session/$sessionId/custom")
    assert remote_connection.get_command("CUSTOM_COMMAND") == ("PUT", "/session/$sessionId/custom")


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection._request")
def test_execute_custom_command(mock_request, remote_connection):
    """Test executing a custom command through the connection."""
    remote_connection.add_command("CUSTOM_COMMAND", "PUT", "/session/$sessionId/custom")
    mock_request.return_value = {"status": 200, "value": "OK"}

    params = {"sessionId": "12345"}
    response = remote_connection.execute("CUSTOM_COMMAND", params)

    mock_request.assert_called_once_with("PUT", "http://localhost:4444/session/12345/custom", body="{}")
    assert response == {"status": 200, "value": "OK"}


def test_get_remote_connection_headers_defaults():
    url = "http://remote"
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert "Authorization" not in headers
    assert "Connection" not in headers
    assert headers.get("Accept") == "application/json"
    assert headers.get("Content-Type") == "application/json;charset=UTF-8"
    assert headers.get("User-Agent").startswith(f"selenium/{__version__} (python ")
    assert headers.get("User-Agent").split(" ")[-1] in {"windows)", "mac)", "linux)", "mac", "windows", "linux"}


def test_get_remote_connection_headers_adds_auth_header_if_pass():
    url = "http://user:pass@remote"
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert headers.get("Authorization") == "Basic dXNlcjpwYXNz"


def test_get_remote_connection_headers_adds_keep_alive_if_requested():
    url = "http://remote"
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url), keep_alive=True)
    assert headers.get("Connection") == "keep-alive"


def test_get_proxy_url_http(mock_proxy_settings):
    proxy = "http://http_proxy.com:8080"
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    proxy_url = remote_connection._client_config.get_proxy_url()
    assert proxy_url == proxy


def test_get_auth_header_if_client_config_pass():
    custom_config = ClientConfig(
        remote_server_addr="http://remote", keep_alive=True, username="user", password="pass", auth_type="Basic"
    )
    remote_connection = RemoteConnection(custom_config.remote_server_addr, client_config=custom_config)
    headers = remote_connection._client_config.get_auth_header()
    assert headers.get("Authorization") == "Basic dXNlcjpwYXNz"


def test_get_proxy_url_https(mock_proxy_settings):
    proxy = "http://https_proxy.com:8080"
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection._client_config.get_proxy_url()
    assert proxy_url == proxy


def test_get_proxy_url_none(mock_proxy_settings_missing):
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection._client_config.get_proxy_url()
    assert proxy_url is None


def test_get_proxy_url_http_auth(mock_proxy_auth_settings):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    proxy_url = remote_connection._client_config.get_proxy_url()
    raw_proxy_url, basic_auth_string = remote_connection._separate_http_proxy_auth()
    assert proxy_url == "http://user:password@http_proxy.com:8080"
    assert raw_proxy_url == "http://http_proxy.com:8080"
    assert basic_auth_string == "user:password"


def test_get_proxy_url_https_auth(mock_proxy_auth_settings):
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection._client_config.get_proxy_url()
    raw_proxy_url, basic_auth_string = remote_connection._separate_http_proxy_auth()
    assert proxy_url == "https://user:password@https_proxy.com:8080"
    assert raw_proxy_url == "https://https_proxy.com:8080"
    assert basic_auth_string == "user:password"


def test_get_connection_manager_without_proxy(mock_proxy_settings_missing):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.PoolManager)


def test_get_connection_manager_for_certs_and_timeout():
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    remote_connection.set_timeout(10)
    assert remote_connection.get_timeout() == 10
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert "certifi/cacert.pem" in conn.connection_pool_kw["ca_certs"]


def test_default_socket_timeout_is_correct():
    remote_connection = RemoteConnection("http://remote", keep_alive=True)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None


def test_get_connection_manager_with_proxy(mock_proxy_settings):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "http_proxy.com"
    assert conn.proxy.port == 8080
    remote_connection_https = RemoteConnection("https://remote", keep_alive=False)
    conn = remote_connection_https._get_connection_manager()
    assert isinstance(conn, urllib3.ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "https_proxy.com"
    assert conn.proxy.port == 8080


def test_get_connection_manager_with_auth_proxy(mock_proxy_auth_settings):
    proxy_auth_header = urllib3.make_headers(proxy_basic_auth="user:password")
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "http_proxy.com"
    assert conn.proxy.port == 8080
    assert conn.proxy_headers == proxy_auth_header
    remote_connection_https = RemoteConnection("https://remote", keep_alive=False)
    conn = remote_connection_https._get_connection_manager()
    assert isinstance(conn, urllib3.ProxyManager)
    assert conn.proxy.scheme == "https"
    assert conn.proxy.host == "https_proxy.com"
    assert conn.proxy.port == 8080
    assert conn.proxy_headers == proxy_auth_header


@pytest.mark.parametrize(
    "url",
    [
        "*",
        ".localhost",
        "localhost:80",
        "locahost",
        "127.0.0.1",
        "LOCALHOST",
        "LOCALHOST:80",
        "http://localhost",
        "https://localhost",
        "test.localhost",
        " localhost",
        "::1",
        "127.0.0.2",
    ],
)
def test_get_connection_manager_when_no_proxy_set(mock_no_proxy_settings, url):
    remote_connection = RemoteConnection(url)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.PoolManager)


def test_ignore_proxy_env_vars(mock_proxy_settings):
    remote_connection = RemoteConnection("http://remote", ignore_proxy=True)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.PoolManager)


def test_get_socks_proxy_when_set(mock_socks_proxy_settings):
    remote_connection = RemoteConnection("http://127.0.0.1:4444/wd/hub")
    conn = remote_connection._get_connection_manager()
    from urllib3.contrib.socks import SOCKSProxyManager

    assert isinstance(conn, SOCKSProxyManager)


class MockResponse:
    code = 200
    headers = []

    def read(self):
        return b"{}"

    def close(self):
        pass

    def getheader(self, *args, **kwargs):
        pass


@pytest.fixture(scope="function")
def mock_proxy_settings_missing(monkeypatch):
    monkeypatch.delenv("HTTPS_PROXY", raising=False)
    monkeypatch.delenv("HTTP_PROXY", raising=False)
    monkeypatch.delenv("https_proxy", raising=False)
    monkeypatch.delenv("http_proxy", raising=False)


@pytest.fixture(scope="function")
def mock_socks_proxy_settings(monkeypatch):
    http_proxy = "SOCKS5://http_proxy.com:8080"
    https_proxy = "SOCKS5://https_proxy.com:8080"
    monkeypatch.setenv("HTTPS_PROXY", https_proxy)
    monkeypatch.setenv("HTTP_PROXY", http_proxy)
    monkeypatch.setenv("https_proxy", https_proxy)
    monkeypatch.setenv("http_proxy", http_proxy)


@pytest.fixture(scope="function")
def mock_proxy_settings(monkeypatch):
    http_proxy = "http://http_proxy.com:8080"
    https_proxy = "http://https_proxy.com:8080"
    monkeypatch.setenv("HTTPS_PROXY", https_proxy)
    monkeypatch.setenv("HTTP_PROXY", http_proxy)
    monkeypatch.setenv("https_proxy", https_proxy)
    monkeypatch.setenv("http_proxy", http_proxy)


@pytest.fixture(scope="function")
def mock_proxy_auth_settings(monkeypatch):
    http_proxy = "http://user:password@http_proxy.com:8080"
    https_proxy = "https://user:password@https_proxy.com:8080"
    monkeypatch.setenv("HTTPS_PROXY", https_proxy)
    monkeypatch.setenv("HTTP_PROXY", http_proxy)
    monkeypatch.setenv("https_proxy", https_proxy)
    monkeypatch.setenv("http_proxy", http_proxy)


@pytest.fixture(scope="function")
def mock_no_proxy_settings(monkeypatch):
    http_proxy = "http://http_proxy.com:8080"
    https_proxy = "http://https_proxy.com:8080"
    monkeypatch.setenv("HTTPS_PROXY", https_proxy)
    monkeypatch.setenv("HTTP_PROXY", http_proxy)
    monkeypatch.setenv("https_proxy", https_proxy)
    monkeypatch.setenv("http_proxy", http_proxy)
    monkeypatch.setenv("no_proxy", "65.253.214.253,localhost,127.0.0.1,*zyz.xx,::1")
    monkeypatch.setenv("NO_PROXY", "65.253.214.253,localhost,127.0.0.1,*zyz.xx,::1,127.0.0.0/8")


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection.get_remote_connection_headers")
def test_override_user_agent_in_headers(mock_get_remote_connection_headers, remote_connection):
    RemoteConnection.user_agent = "custom-agent/1.0 (python 3.8)"

    mock_get_remote_connection_headers.return_value = {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "User-Agent": "custom-agent/1.0 (python 3.8)",
    }

    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse("http://remote"))

    assert headers.get("User-Agent") == "custom-agent/1.0 (python 3.8)"
    assert headers.get("Accept") == "application/json"
    assert headers.get("Content-Type") == "application/json;charset=UTF-8"


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection._request")
def test_register_extra_headers(mock_request, remote_connection):
    RemoteConnection.extra_headers = {"Foo": "bar"}

    mock_request.return_value = {"status": 200, "value": "OK"}
    remote_connection.execute("newSession", {})

    mock_request.assert_called_once_with("POST", "http://localhost:4444/session", body="{}")
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse("http://localhost:4444"), False)
    assert headers["Foo"] == "bar"


def test_get_connection_manager_with_timeout_from_client_config():
    remote_connection = RemoteConnection(remote_server_addr="http://remote", keep_alive=False)
    remote_connection.set_timeout(10)
    conn = remote_connection._get_connection_manager()
    assert remote_connection.get_timeout() == 10
    assert conn.connection_pool_kw["timeout"] == 10
    assert isinstance(conn, urllib3.PoolManager)

    client_config = ClientConfig("http://remote", timeout=300)
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 300
    assert isinstance(conn, urllib3.PoolManager)


def test_get_connection_manager_with_ca_certs_from_client_config():
    remote_connection = RemoteConnection(remote_server_addr="http://remote")
    remote_connection.set_certificate_bundle_path("/path/to/cacert.pem")
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert conn.connection_pool_kw["ca_certs"] == "/path/to/cacert.pem"
    assert isinstance(conn, urllib3.PoolManager)

    client_config = ClientConfig(remote_server_addr="http://remote", ca_certs="/path/to/cacert.pem")
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert conn.connection_pool_kw["ca_certs"] == "/path/to/cacert.pem"
    assert isinstance(conn, urllib3.PoolManager)


def test_get_connection_manager_ignores_certificates():
    remote_connection = RemoteConnection(remote_server_addr="http://remote", keep_alive=False, ignore_certificates=True)
    remote_connection.set_timeout(10)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_NONE"
    assert isinstance(conn, urllib3.PoolManager)

    client_config = ClientConfig(remote_server_addr="http://remote", ignore_certificates=True, timeout=10)
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_NONE"
    assert isinstance(conn, urllib3.PoolManager)

    remote_connection.reset_timeout()
    assert remote_connection.get_timeout() is None


def test_get_connection_manager_with_custom_args():
    custom_args = {"init_args_for_pool_manager": {"retries": 3, "block": True}}

    remote_connection = RemoteConnection(
        remote_server_addr="http://remote", keep_alive=False, init_args_for_pool_manager=custom_args
    )
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.PoolManager)
    assert conn.connection_pool_kw["retries"] == 3
    assert conn.connection_pool_kw["block"] is True

    client_config = ClientConfig(
        remote_server_addr="http://remote", keep_alive=False, init_args_for_pool_manager=custom_args
    )
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, urllib3.PoolManager)
    assert conn.connection_pool_kw["retries"] == 3
    assert conn.connection_pool_kw["block"] is True
