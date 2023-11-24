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

from selenium.webdriver.common.options import ArgOptions
from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.common.proxy import ProxyType

MANUAL_PROXY = {
    "httpProxy": "some.url:1234",
    "ftpProxy": "ftp.proxy",
    "noProxy": "localhost, foo.localhost",
    "sslProxy": "ssl.proxy:1234",
    "socksProxy": "socks.proxy:65555",
    "socksUsername": "test",
    "socksPassword": "test",
    "socksVersion": 5,
}

PAC_PROXY = {
    "proxyAutoconfigUrl": "http://pac.url:1234",
}

AUTODETECT_PROXY = {
    "autodetect": True,
}


def test_can_add_manual_proxy_to_options():
    proxy = Proxy()
    proxy.http_proxy = MANUAL_PROXY["httpProxy"]
    proxy.ftp_proxy = MANUAL_PROXY["ftpProxy"]
    proxy.no_proxy = MANUAL_PROXY["noProxy"]
    proxy.sslProxy = MANUAL_PROXY["sslProxy"]
    proxy.socksProxy = MANUAL_PROXY["socksProxy"]
    proxy.socksUsername = MANUAL_PROXY["socksUsername"]
    proxy.socksPassword = MANUAL_PROXY["socksPassword"]
    proxy.socksVersion = MANUAL_PROXY["socksVersion"]

    options = ArgOptions()
    options.proxy = proxy

    proxy_capabilities = MANUAL_PROXY.copy()
    proxy_capabilities["proxyType"] = "manual"
    assert proxy_capabilities == options.to_capabilities().get("proxy")


def test_can_add_autodetect_proxy_to_options():
    proxy = Proxy()
    proxy.auto_detect = AUTODETECT_PROXY["autodetect"]

    options = ArgOptions()
    options.proxy = proxy

    proxy_capabilities = AUTODETECT_PROXY.copy()
    proxy_capabilities["proxyType"] = "autodetect"
    assert proxy_capabilities == options.to_capabilities().get("proxy")


def test_can_add_pacproxy_to_options():
    proxy = Proxy()
    proxy.proxy_autoconfig_url = PAC_PROXY["proxyAutoconfigUrl"]

    options = ArgOptions()
    options.proxy = proxy

    proxy_capabilities = PAC_PROXY.copy()
    proxy_capabilities["proxyType"] = "pac"
    assert proxy_capabilities == options.to_capabilities().get("proxy")


def test_can_not_change_initialized_proxy_type():
    proxy = Proxy(raw={"proxyType": "direct"})
    with pytest.raises(Exception):
        proxy.proxy_type = ProxyType.SYSTEM

    proxy = Proxy(raw={"proxyType": ProxyType.DIRECT})
    with pytest.raises(Exception):
        proxy.proxy_type = ProxyType.SYSTEM


def test_can_init_manual_proxy():
    proxy = Proxy(raw=MANUAL_PROXY)

    assert ProxyType.MANUAL == proxy.proxy_type
    assert MANUAL_PROXY["httpProxy"] == proxy.http_proxy
    assert MANUAL_PROXY["ftpProxy"] == proxy.ftp_proxy
    assert MANUAL_PROXY["noProxy"] == proxy.no_proxy
    assert MANUAL_PROXY["sslProxy"] == proxy.sslProxy
    assert MANUAL_PROXY["socksProxy"] == proxy.socksProxy
    assert MANUAL_PROXY["socksUsername"] == proxy.socksUsername
    assert MANUAL_PROXY["socksPassword"] == proxy.socksPassword
    assert MANUAL_PROXY["socksVersion"] == proxy.socksVersion


def test_can_init_autodetect_proxy():
    proxy = Proxy(raw=AUTODETECT_PROXY)
    assert ProxyType.AUTODETECT == proxy.proxy_type
    assert AUTODETECT_PROXY["autodetect"] == proxy.auto_detect


def test_can_init_pacproxy():
    proxy = Proxy(raw=PAC_PROXY)
    assert ProxyType.PAC == proxy.proxy_type
    assert PAC_PROXY["proxyAutoconfigUrl"] == proxy.proxy_autoconfig_url


def test_can_init_empty_proxy():
    proxy = Proxy()
    assert ProxyType.UNSPECIFIED == proxy.proxy_type
    assert "" == proxy.http_proxy
    assert "" == proxy.ftp_proxy
    assert "" == proxy.no_proxy
    assert "" == proxy.sslProxy
    assert "" == proxy.socksProxy
    assert "" == proxy.socksUsername
    assert "" == proxy.socksPassword
    assert proxy.auto_detect is False
    assert "" == proxy.proxy_autoconfig_url
    assert proxy.socks_version is None

    options = ArgOptions()
    options.proxy = proxy

    proxy_capabilities = {}
    proxy_capabilities["proxyType"] = "unspecified"
    assert proxy_capabilities == options.to_capabilities().get("proxy")
