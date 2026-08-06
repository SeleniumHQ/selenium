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

import pytest

from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.remote.client_config import ClientConfig

PROXY = "http://proxy.internal:3128"


@pytest.fixture
def config():
    return ClientConfig(remote_server_addr="http://localhost:4444")


@pytest.fixture
def system_proxy_env(monkeypatch):
    """Clear every proxy variable, then set only ``http_proxy``."""

    def setup(no_proxy=None):
        for name in ("http_proxy", "HTTP_PROXY", "https_proxy", "HTTPS_PROXY", "no_proxy", "NO_PROXY"):
            monkeypatch.delenv(name, raising=False)
        monkeypatch.setenv("http_proxy", PROXY)
        if no_proxy is not None:
            monkeypatch.setenv("no_proxy", no_proxy)

    return setup


def system_config(remote_server_addr="http://localhost:4444"):
    return ClientConfig(remote_server_addr=remote_server_addr, proxy=Proxy(raw={"proxyType": ProxyType.SYSTEM}))


def test_websocket_max_message_size_defaults_to_none(config):
    assert config.websocket_max_message_size is None


def test_websocket_max_message_size_can_be_set(config):
    config.websocket_max_message_size = 2**26
    assert config.websocket_max_message_size == 2**26


def test_websocket_max_message_size_via_constructor():
    cfg = ClientConfig(remote_server_addr="http://localhost:4444", websocket_max_message_size=2**26)
    assert cfg.websocket_max_message_size == 2**26


@pytest.mark.parametrize(
    "no_proxy",
    [
        "example.com,",
        ",example.com",
        "example.com,,other.com",
        "example.com, ,other.com",
        ",",
        "",
    ],
    ids=[
        "trailing-comma",
        "leading-comma",
        "doubled-comma",
        "whitespace-only-entry",
        "bare-comma",
        "empty-value",
    ],
)
def test_empty_no_proxy_entries_do_not_bypass_the_proxy(system_proxy_env, no_proxy):
    """An empty entry must be ignored, not treated as matching every host."""
    system_proxy_env(no_proxy)
    assert system_config().get_proxy_url() == PROXY


@pytest.mark.parametrize(
    ("no_proxy", "server"),
    [
        ("foo.com", "http://myfoo.com.example.org:4444"),
        ("example.com", "http://notexample.common.org:4444"),
        ("localhost", "http://localhosting.org:4444"),
    ],
)
def test_no_proxy_entry_does_not_match_on_a_bare_substring(system_proxy_env, no_proxy, server):
    """A bypass entry must match a whole host or a dot-delimited suffix of it."""
    system_proxy_env(no_proxy)
    assert system_config(server).get_proxy_url() == PROXY


@pytest.mark.parametrize(
    ("no_proxy", "server"),
    [
        ("example.com", "http://example.com:4444"),
        ("example.com", "http://sub.example.com:4444"),
        (".example.com", "http://sub.example.com:4444"),
        ("localhost", "http://localhost:4444"),
        ("other.com,example.com", "http://example.com:4444"),
        ("other.com, example.com", "http://example.com:4444"),
        ("example.com,", "http://example.com:4444"),
        ("EXAMPLE.COM", "http://example.com:4444"),
        ("127.0.0.1", "http://127.0.0.1:4444"),
    ],
)
def test_matching_no_proxy_entry_bypasses_the_proxy(system_proxy_env, no_proxy, server):
    system_proxy_env(no_proxy)
    assert system_config(server).get_proxy_url() is None


def test_no_proxy_wildcard_bypasses_every_host(system_proxy_env):
    system_proxy_env("*")
    assert system_config().get_proxy_url() is None


def test_no_proxy_entry_written_as_a_url_matches_only_its_host(system_proxy_env):
    system_proxy_env("http://example.com")
    assert system_config("http://example.com:4444").get_proxy_url() is None
    assert system_config("http://localhost:4444").get_proxy_url() == PROXY


def test_proxy_is_used_when_no_proxy_is_unset(system_proxy_env):
    system_proxy_env()
    assert system_config().get_proxy_url() == PROXY
