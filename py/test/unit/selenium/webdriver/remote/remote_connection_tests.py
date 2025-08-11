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
from urllib import parse

import pytest
from urllib3 import PoolManager, ProxyManager, make_headers
from urllib3.contrib.socks import SOCKSProxyManager
from urllib3.util import Retry, Timeout

from selenium import __version__
from selenium.webdriver import Proxy
from selenium.webdriver.common.proxy import ProxyType
from selenium.webdriver.remote.client_config import AuthType
from selenium.webdriver.remote.remote_connection import ClientConfig, RemoteConnection


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


def test_get_remote_connection_headers_adds_auth_header_if_pass(recwarn):
    url = "http://user:pass@remote"
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert headers.get("Authorization") == "Basic dXNlcjpwYXNz"
    assert (
        recwarn[0].message.args[0]
        == "Embedding username and password in URL could be insecure, use ClientConfig instead"
    )


def test_get_remote_connection_headers_adds_keep_alive_if_requested():
    url = "http://remote"
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url), keep_alive=True)
    assert headers.get("Connection") == "keep-alive"


def test_get_proxy_url_http(mock_proxy_settings):
    proxy = "http://http_proxy.com:8080"
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    proxy_url = remote_connection.client_config.get_proxy_url()
    assert proxy_url == proxy


def test_get_auth_header_if_client_config_pass_basic_auth():
    custom_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        keep_alive=True,
        username="user",
        password="pass",
        auth_type=AuthType.BASIC,
    )
    remote_connection = RemoteConnection(custom_config.remote_server_addr, client_config=custom_config)
    headers = remote_connection.client_config.get_auth_header()
    assert headers.get("Authorization") == "Basic dXNlcjpwYXNz"


def test_get_auth_header_if_client_config_pass_bearer_token():
    custom_config = ClientConfig(
        remote_server_addr="http://localhost:4444", keep_alive=True, auth_type=AuthType.BEARER, token="dXNlcjpwYXNz"
    )
    remote_connection = RemoteConnection(custom_config.remote_server_addr, client_config=custom_config)
    headers = remote_connection.client_config.get_auth_header()
    assert headers.get("Authorization") == "Bearer dXNlcjpwYXNz"


def test_get_auth_header_if_client_config_pass_x_api_key():
    custom_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        keep_alive=True,
        auth_type=AuthType.X_API_KEY,
        token="abcdefgh123456789",
    )
    remote_connection = RemoteConnection(custom_config.remote_server_addr, client_config=custom_config)
    headers = remote_connection.client_config.get_auth_header()
    assert headers.get("X-API-Key") == "abcdefgh123456789"


def test_get_proxy_url_https(mock_proxy_settings):
    proxy = "http://https_proxy.com:8080"
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection.client_config.get_proxy_url()
    assert proxy_url == proxy


def test_get_proxy_url_https_via_client_config():
    client_config = ClientConfig(
        remote_server_addr="https://localhost:4444",
        proxy=Proxy({"proxyType": ProxyType.MANUAL, "sslProxy": "https://admin:admin@http_proxy.com:8080"}),
    )
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, ProxyManager)
    conn.proxy_url = "https://http_proxy.com:8080"
    conn.connection_pool_kw["proxy_headers"] = make_headers(proxy_basic_auth="admin:admin")


def test_get_proxy_url_http_via_client_config():
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        proxy=Proxy(
            {
                "proxyType": ProxyType.MANUAL,
                "httpProxy": "http://admin:admin@http_proxy.com:8080",
                "sslProxy": "https://admin:admin@http_proxy.com:8080",
            }
        ),
    )
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, ProxyManager)
    conn.proxy_url = "http://http_proxy.com:8080"
    conn.connection_pool_kw["proxy_headers"] = make_headers(proxy_basic_auth="admin:admin")


def test_get_proxy_direct_via_client_config():
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444", proxy=Proxy({"proxyType": ProxyType.DIRECT})
    )
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)
    proxy_url = remote_connection.client_config.get_proxy_url()
    assert proxy_url is None


def test_get_proxy_system_matches_no_proxy_via_client_config():
    with patch.dict(
        "os.environ", {"HTTP_PROXY": "http://admin:admin@system_proxy.com:8080", "NO_PROXY": "localhost,127.0.0.1"}
    ):
        client_config = ClientConfig(
            remote_server_addr="http://localhost:4444", proxy=Proxy({"proxyType": ProxyType.SYSTEM})
        )
        remote_connection = RemoteConnection(client_config=client_config)
        conn = remote_connection._get_connection_manager()
        assert isinstance(conn, PoolManager)
        proxy_url = remote_connection.client_config.get_proxy_url()
        assert proxy_url is None


def test_get_proxy_url_none(mock_proxy_settings_missing):
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection.client_config.get_proxy_url()
    assert proxy_url is None


def test_get_proxy_url_http_auth(mock_proxy_auth_settings):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    proxy_url = remote_connection.client_config.get_proxy_url()
    raw_proxy_url, basic_auth_string = remote_connection._separate_http_proxy_auth()
    assert proxy_url == "http://user:password@http_proxy.com:8080"
    assert raw_proxy_url == "http://http_proxy.com:8080"
    assert basic_auth_string == "user:password"


def test_get_proxy_url_https_auth(mock_proxy_auth_settings):
    remote_connection = RemoteConnection("https://remote", keep_alive=False)
    proxy_url = remote_connection.client_config.get_proxy_url()
    raw_proxy_url, basic_auth_string = remote_connection._separate_http_proxy_auth()
    assert proxy_url == "https://user:password@https_proxy.com:8080"
    assert raw_proxy_url == "https://https_proxy.com:8080"
    assert basic_auth_string == "user:password"


def test_get_connection_manager_without_proxy(mock_proxy_settings_missing):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)


def test_get_connection_manager_for_certs_and_timeout():
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    remote_connection.set_timeout(10)
    assert remote_connection.get_timeout() == 10
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert f"certifi{os.path.sep}cacert.pem" in conn.connection_pool_kw["ca_certs"]


def test_default_socket_timeout_is_correct():
    remote_connection = RemoteConnection("http://remote", keep_alive=True)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None


def test_get_connection_manager_with_http_proxy(mock_proxy_settings):
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "http_proxy.com"
    assert conn.proxy.port == 8080


def test_get_connection_manager_with_https_proxy(mock_proxy_settings):
    remote_connection_https = RemoteConnection("https://remote", keep_alive=False)
    conn = remote_connection_https._get_connection_manager()
    assert isinstance(conn, ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "https_proxy.com"
    assert conn.proxy.port == 8080


def test_get_connection_manager_with_auth_http_proxy(mock_proxy_auth_settings):
    proxy_auth_header = make_headers(proxy_basic_auth="user:password")
    remote_connection = RemoteConnection("http://remote", keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, ProxyManager)
    assert conn.proxy.scheme == "http"
    assert conn.proxy.host == "http_proxy.com"
    assert conn.proxy.port == 8080
    assert conn.proxy_headers == proxy_auth_header


def test_get_connection_manager_with_auth_https_proxy(mock_proxy_auth_settings):
    proxy_auth_header = make_headers(proxy_basic_auth="user:password")
    remote_connection_https = RemoteConnection("https://remote", keep_alive=False)
    conn = remote_connection_https._get_connection_manager()
    assert isinstance(conn, ProxyManager)
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
        "localhost",
        "LOCALHOST",
        "LOCALHOST:80",
        "http://localhost",
        "https://localhost",
        "test.localhost",
        " localhost",
        "127.0.0.1",
        "127.0.0.2",
        "::1",
    ],
)
def test_get_connection_manager_when_no_proxy_set(mock_no_proxy_settings, url):
    remote_connection = RemoteConnection(url)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)


def test_ignore_proxy_env_vars(mock_proxy_settings):
    remote_connection = RemoteConnection("http://remote", ignore_proxy=True)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)


def test_get_socks_proxy_when_set(mock_socks_proxy_settings):
    remote_connection = RemoteConnection("http://remote")
    conn = remote_connection._get_connection_manager()

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
    RemoteConnection.user_agent = "custom-agent/1.0 (python 3.13)"

    mock_get_remote_connection_headers.return_value = {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "User-Agent": "custom-agent/1.0 (python 3.13)",
    }

    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse("http://remote"))

    assert headers.get("User-Agent") == "custom-agent/1.0 (python 3.13)"
    assert headers.get("Accept") == "application/json"
    assert headers.get("Content-Type") == "application/json;charset=UTF-8"


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection.get_remote_connection_headers")
def test_override_user_agent_via_client_config(mock_get_remote_connection_headers):
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        user_agent="custom-agent/1.0 (python 3.13)",
        extra_headers={"Content-Type": "application/xml;charset=UTF-8"},
    )
    remote_connection = RemoteConnection(client_config=client_config)

    mock_get_remote_connection_headers.return_value = {
        "Accept": "application/json",
        "Content-Type": "application/xml;charset=UTF-8",
        "User-Agent": "custom-agent/1.0 (python 3.13)",
    }

    headers = remote_connection.get_remote_connection_headers(parse.urlparse("http://localhost:4444"))

    assert headers.get("User-Agent") == "custom-agent/1.0 (python 3.13)"
    assert headers.get("Accept") == "application/json"
    assert headers.get("Content-Type") == "application/xml;charset=UTF-8"


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection._request")
def test_register_extra_headers(mock_request, remote_connection):
    RemoteConnection.extra_headers = {"Foo": "bar"}

    mock_request.return_value = {"status": 200, "value": "OK"}
    remote_connection.execute("newSession", {})

    mock_request.assert_called_once_with("POST", "http://localhost:4444/session", body="{}")
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse("http://localhost:4444"), False)
    assert headers["Foo"] == "bar"


@patch("selenium.webdriver.remote.remote_connection.RemoteConnection._request")
def test_register_extra_headers_via_client_config(mock_request):
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        extra_headers={
            "Authorization": "AWS4-HMAC-SHA256",
            "Credential": "abc/20200618/us-east-1/execute-api/aws4_request",
        },
    )
    remote_connection = RemoteConnection(client_config=client_config)

    mock_request.return_value = {"status": 200, "value": "OK"}
    remote_connection.execute("newSession", {})

    mock_request.assert_called_once_with("POST", "http://localhost:4444/session", body="{}")
    headers = remote_connection.get_remote_connection_headers(parse.urlparse("http://localhost:4444"), False)
    assert headers["Authorization"] == "AWS4-HMAC-SHA256"
    assert headers["Credential"] == "abc/20200618/us-east-1/execute-api/aws4_request"


def test_backwards_compatibility_with_appium_connection():
    # Keep backward compatibility for AppiumConnection - https://github.com/SeleniumHQ/selenium/issues/14694
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444", ca_certs="/path/to/cacert.pem", timeout=300
    )
    remote_connection = RemoteConnection(client_config=client_config)
    assert remote_connection._ca_certs == "/path/to/cacert.pem"
    assert remote_connection._timeout == 300
    assert remote_connection._client_config == client_config
    remote_connection.set_timeout(120)
    assert remote_connection.get_timeout() == 120
    remote_connection.set_certificate_bundle_path("/path/to/cacert2.pem")
    assert remote_connection.get_certificate_bundle_path() == "/path/to/cacert2.pem"


def test_get_connection_manager_with_timeout_from_client_config():
    remote_connection = RemoteConnection(remote_server_addr="http://localhost:4444", keep_alive=False)
    remote_connection.set_timeout(10)
    conn = remote_connection._get_connection_manager()
    assert remote_connection.get_timeout() == 10
    assert conn.connection_pool_kw["timeout"] == 10
    assert isinstance(conn, PoolManager)


def test_connection_manager_with_timeout_via_client_config():
    client_config = ClientConfig("http://remote", timeout=300)
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 300
    assert isinstance(conn, PoolManager)


def test_get_connection_manager_with_ca_certs():
    remote_connection = RemoteConnection(remote_server_addr="http://localhost:4444")
    remote_connection.set_certificate_bundle_path("/path/to/cacert.pem")
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert conn.connection_pool_kw["ca_certs"] == "/path/to/cacert.pem"
    assert isinstance(conn, PoolManager)


def test_connection_manager_with_ca_certs_via_client_config():
    client_config = ClientConfig(remote_server_addr="http://localhost:4444", ca_certs="/path/to/cacert.pem")
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] is None
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"
    assert conn.connection_pool_kw["ca_certs"] == "/path/to/cacert.pem"
    assert isinstance(conn, PoolManager)


def test_get_connection_manager_ignores_certificates():
    remote_connection = RemoteConnection(
        remote_server_addr="http://localhost:4444", keep_alive=False, ignore_certificates=True
    )
    remote_connection.set_timeout(10)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_NONE"
    assert isinstance(conn, PoolManager)
    remote_connection.reset_timeout()
    assert remote_connection.get_timeout() is None


def test_connection_manager_ignores_certificates_via_client_config():
    client_config = ClientConfig(remote_server_addr="http://localhost:4444", ignore_certificates=True, timeout=10)
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)
    assert conn.connection_pool_kw["timeout"] == 10
    assert conn.connection_pool_kw["cert_reqs"] == "CERT_NONE"


def test_get_connection_manager_with_custom_args():
    custom_args = {"init_args_for_pool_manager": {"retries": 3, "block": True}}

    remote_connection = RemoteConnection(
        remote_server_addr="http://localhost:4444", keep_alive=False, init_args_for_pool_manager=custom_args
    )
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)
    assert isinstance(conn.connection_pool_kw["retries"], Retry)
    assert conn.connection_pool_kw["retries"].total == 3
    assert conn.connection_pool_kw["block"] is True
    assert conn.connection_pool_kw["timeout"] is None


def test_connection_manager_with_custom_args_via_client_config():
    retries = Retry(connect=2, read=2, redirect=2)
    timeout = Timeout(connect=300, read=3600)
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        init_args_for_pool_manager={"init_args_for_pool_manager": {"retries": retries, "timeout": timeout}},
    )
    remote_connection = RemoteConnection(client_config=client_config)
    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, PoolManager)
    assert conn.connection_pool_kw["retries"] == retries
    assert conn.connection_pool_kw["timeout"] == timeout


def test_proxy_auth_with_special_characters_url_encoded():
    proxy_url = "http://user:passw%23rd@proxy.example.com:8080"
    client_config = ClientConfig(
        remote_server_addr="http://localhost:4444",
        keep_alive=False,
        proxy=Proxy({"proxyType": ProxyType.MANUAL, "httpProxy": proxy_url}),
    )
    remote_connection = RemoteConnection(client_config=client_config)

    proxy_without_auth, basic_auth = remote_connection._separate_http_proxy_auth()

    assert proxy_without_auth == "http://proxy.example.com:8080"
    assert basic_auth == "user:passw%23rd"  # Still URL-encoded

    conn = remote_connection._get_connection_manager()
    assert isinstance(conn, ProxyManager)

    expected_auth = base64.b64encode("user:passw#rd".encode()).decode()  # Decoded password
    expected_headers = make_headers(proxy_basic_auth="user:passw#rd")  # Unquoted password

    assert conn.proxy_headers == expected_headers
    assert conn.proxy_headers["proxy-authorization"] == f"Basic {expected_auth}"


def test_proxy_auth_with_multiple_special_characters():
    test_cases = [
        ("passw%23rd", "passw#rd"),  # # character
        ("passw%40rd", "passw@rd"),  # @ character
        ("passw%26rd", "passw&rd"),  # & character
        ("passw%3Drd", "passw=rd"),  # = character
        ("passw%2Brd", "passw+rd"),  # + character
        ("passw%20rd", "passw rd"),  # space character
        ("passw%21%40%23%24", "passw!@#$"),  # Multiple special chars
    ]

    for encoded_password, decoded_password in test_cases:
        proxy_url = f"http://testuser:{encoded_password}@proxy.example.com:8080"
        client_config = ClientConfig(
            remote_server_addr="http://localhost:4444",
            keep_alive=False,
            proxy=Proxy({"proxyType": ProxyType.MANUAL, "httpProxy": proxy_url}),
        )
        remote_connection = RemoteConnection(client_config=client_config)

        proxy_without_auth, basic_auth = remote_connection._separate_http_proxy_auth()
        assert basic_auth == f"testuser:{encoded_password}"

        conn = remote_connection._get_connection_manager()
        expected_auth = base64.b64encode(f"testuser:{decoded_password}".encode()).decode()
        expected_headers = make_headers(proxy_basic_auth=f"testuser:{decoded_password}")

        assert conn.proxy_headers == expected_headers
        assert conn.proxy_headers["proxy-authorization"] == f"Basic {expected_auth}"
