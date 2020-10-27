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


import urllib3
import pytest

try:
    from urllib import parse
except ImportError:  # above is available in py3+, below is py2.7
    import urlparse as parse

from selenium import __version__
from selenium.webdriver.remote.remote_connection import (
    RemoteConnection,
)


def test_get_remote_connection_headers_defaults():
    url = 'http://remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert 'Authorization' not in headers.keys()
    assert 'Connection' not in headers.keys()
    assert headers.get('Accept') == 'application/json'
    assert headers.get('Content-Type') == 'application/json;charset=UTF-8'
    assert headers.get('User-Agent').startswith("selenium/%s (python " % __version__)
    assert headers.get('User-Agent').split(' ')[-1] in {'windows)', 'mac)', 'linux)'}


def test_get_remote_connection_headers_adds_auth_header_if_pass():
    url = 'http://user:pass@remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert headers.get('Authorization') == 'Basic dXNlcjpwYXNz'


def test_get_remote_connection_headers_adds_keep_alive_if_requested():
    url = 'http://remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url), keep_alive=True)
    assert headers.get('Connection') == 'keep-alive'


def test_get_proxy_url_http(mock_proxy_settings):
    proxy = 'http://http_proxy.com:8080'
    remote_connection = RemoteConnection('http://remote', keep_alive=False)
    proxy_url = remote_connection._get_proxy_url()
    assert proxy_url == proxy


def test_get_proxy_url_https(mock_proxy_settings):
    proxy = 'http://https_proxy.com:8080'
    remote_connection = RemoteConnection('https://remote', keep_alive=False)
    proxy_url = remote_connection._get_proxy_url()
    assert proxy_url == proxy


def test_get_proxy_url_none(mock_proxy_settings_missing):
    remote_connection = RemoteConnection('https://remote', keep_alive=False)
    proxy_url = remote_connection._get_proxy_url()
    assert proxy_url is None


def test_get_connection_manager_without_proxy(mock_proxy_settings_missing):
    remote_connection = RemoteConnection('http://remote', keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert type(conn) == urllib3.PoolManager


def test_get_connection_manager_for_certs_and_timeout():
    remote_connection = RemoteConnection('http://remote', keep_alive=False)
    remote_connection.set_timeout(10)
    conn = remote_connection._get_connection_manager()
    assert conn.connection_pool_kw['timeout'] == 10
    assert conn.connection_pool_kw['cert_reqs'] == 'CERT_REQUIRED'
    assert 'certifi/cacert.pem' in conn.connection_pool_kw['ca_certs']


def test_get_connection_manager_with_proxy(mock_proxy_settings):
    remote_connection = RemoteConnection('http://remote', keep_alive=False)
    conn = remote_connection._get_connection_manager()
    assert type(conn) == urllib3.ProxyManager
    assert conn.proxy.scheme == 'http'
    assert conn.proxy.host == 'http_proxy.com'
    assert conn.proxy.port == 8080
    remote_connection_https = RemoteConnection('https://remote', keep_alive=False)
    conn = remote_connection_https._get_connection_manager()
    assert type(conn) == urllib3.ProxyManager
    assert conn.proxy.scheme == 'http'
    assert conn.proxy.host == 'https_proxy.com'
    assert conn.proxy.port == 8080


def test_ignore_proxy_env_vars(mock_proxy_settings):
    remote_connection = RemoteConnection("http://remote", ignore_proxy=True)
    conn = remote_connection._get_connection_manager()
    assert type(conn) == urllib3.PoolManager


class MockResponse:
    code = 200
    headers = []

    def read(self):
        return b"{}"

    def close(self):
        pass

    def getheader(self, *args, **kwargs):
        pass


@pytest.fixture
def mock_proxy_settings_missing(monkeypatch):
    monkeypatch.delenv("HTTPS_PROXY", raising=False)
    monkeypatch.delenv("HTTP_PROXY", raising=False)
    monkeypatch.delenv("https_proxy", raising=False)
    monkeypatch.delenv("http_proxy", raising=False)


@pytest.fixture
def mock_proxy_settings(monkeypatch):
    http_proxy = 'http://http_proxy.com:8080'
    https_proxy = 'http://https_proxy.com:8080'
    monkeypatch.setenv("HTTPS_PROXY", https_proxy)
    monkeypatch.setenv("HTTP_PROXY", http_proxy)
    monkeypatch.setenv("https_proxy", https_proxy)
    monkeypatch.setenv("http_proxy", http_proxy)
