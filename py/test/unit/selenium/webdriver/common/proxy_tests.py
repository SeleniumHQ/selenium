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


class TestProxyType:
    """Tests for ProxyType constants and load()."""

    def test_direct_type(self):
        assert ProxyType.DIRECT["string"] == "DIRECT"

    def test_manual_type(self):
        assert ProxyType.MANUAL["string"] == "MANUAL"

    def test_pac_type(self):
        assert ProxyType.PAC["string"] == "PAC"

    def test_autodetect_type(self):
        assert ProxyType.AUTODETECT["string"] == "AUTODETECT"

    def test_system_type(self):
        assert ProxyType.SYSTEM["string"] == "SYSTEM"

    def test_unspecified_type(self):
        assert ProxyType.UNSPECIFIED["string"] == "UNSPECIFIED"

    def test_load_by_string(self):
        result = ProxyType.load("MANUAL")
        assert result == ProxyType.MANUAL

    def test_load_by_dict(self):
        result = ProxyType.load({"string": "DIRECT"})
        assert result == ProxyType.DIRECT

    def test_load_case_insensitive(self):
        result = ProxyType.load("manual")
        assert result == ProxyType.MANUAL

    def test_load_raises_for_unknown(self):
        with pytest.raises(Exception, match="No proxy type is found"):
            ProxyType.load("UNKNOWN")


class TestProxyInit:
    """Tests for Proxy initialization from raw dict."""

    def test_default_init(self):
        proxy = Proxy()
        assert proxy.proxy_type == ProxyType.UNSPECIFIED
        assert proxy.autodetect is False
        assert proxy.httpProxy == ""
        assert proxy.sslProxy == ""

    def test_init_with_manual_proxy(self):
        raw = {
            "proxyType": "MANUAL",
            "httpProxy": "localhost:8080",
            "sslProxy": "localhost:8443",
            "noProxy": "localhost,127.0.0.1",
        }
        proxy = Proxy(raw)
        assert proxy.proxy_type == ProxyType.MANUAL
        assert proxy.httpProxy == "localhost:8080"
        assert proxy.sslProxy == "localhost:8443"
        assert proxy.noProxy == "localhost,127.0.0.1"

    def test_init_with_pac(self):
        raw = {"proxyType": "PAC", "proxyAutoconfigUrl": "http://example.com/proxy.pac"}
        proxy = Proxy(raw)
        assert proxy.proxy_type == ProxyType.PAC
        assert proxy.proxyAutoconfigUrl == "http://example.com/proxy.pac"

    def test_init_with_autodetect(self):
        raw = {"proxyType": "AUTODETECT", "autodetect": True}
        proxy = Proxy(raw)
        assert proxy.proxy_type == ProxyType.AUTODETECT
        assert proxy.autodetect is True

    def test_init_with_socks(self):
        raw = {
            "proxyType": "MANUAL",
            "socksProxy": "localhost:1080",
            "socksUsername": "user",
            "socksPassword": "pass",
            "socksVersion": 5,
        }
        proxy = Proxy(raw)
        assert proxy.socksProxy == "localhost:1080"
        assert proxy.socksUsername == "user"
        assert proxy.socksPassword == "pass"
        assert proxy.socksVersion == 5

    def test_init_raises_for_non_dict(self):
        with pytest.raises(TypeError, match="`raw` must be a dict"):
            Proxy("not a dict")

    def test_init_with_none_is_default(self):
        proxy = Proxy(None)
        assert proxy.proxy_type == ProxyType.UNSPECIFIED


class TestProxyDescriptor:
    """Tests for _ProxyTypeDescriptor behavior."""

    def test_auto_detect_sets_proxy_type(self):
        proxy = Proxy()
        proxy.auto_detect = True
        assert proxy.proxy_type == ProxyType.AUTODETECT
        assert proxy.autodetect is True

    def test_auto_detect_raises_for_non_bool(self):
        proxy = Proxy()
        with pytest.raises(ValueError, match="Autodetect proxy value needs to be a boolean"):
            proxy.auto_detect = "yes"

    def test_http_proxy_sets_proxy_type(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        assert proxy.proxy_type == ProxyType.MANUAL
        assert proxy.httpProxy == "localhost:8080"

    def test_ssl_proxy_sets_proxy_type(self):
        proxy = Proxy()
        proxy.ssl_proxy = "localhost:8443"
        assert proxy.proxy_type == ProxyType.MANUAL

    def test_proxy_autoconfig_url_sets_pac_type(self):
        proxy = Proxy()
        proxy.proxy_autoconfig_url = "http://example.com/proxy.pac"
        assert proxy.proxy_type == ProxyType.PAC

    def test_socks_proxy_sets_manual_type(self):
        proxy = Proxy()
        proxy.socks_proxy = "localhost:1080"
        assert proxy.proxy_type == ProxyType.MANUAL

    def test_incompatible_proxy_type_raises(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        with pytest.raises(ValueError, match="not compatible"):
            proxy.auto_detect = True


class TestProxyToCapabilities:
    """Tests for Proxy.to_capabilities()."""

    def test_unspecified_proxy(self):
        proxy = Proxy()
        caps = proxy.to_capabilities()
        assert caps["proxyType"] == "unspecified"

    def test_manual_proxy_with_fields(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        proxy.ssl_proxy = "localhost:8443"
        caps = proxy.to_capabilities()
        assert caps["proxyType"] == "manual"
        assert caps["httpProxy"] == "localhost:8080"
        assert caps["sslProxy"] == "localhost:8443"

    def test_pac_proxy_with_url(self):
        proxy = Proxy()
        proxy.proxy_autoconfig_url = "http://example.com/proxy.pac"
        caps = proxy.to_capabilities()
        assert caps["proxyType"] == "pac"
        assert caps["proxyAutoconfigUrl"] == "http://example.com/proxy.pac"

    def test_empty_fields_omitted(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        caps = proxy.to_capabilities()
        assert "sslProxy" not in caps
        assert "socksProxy" not in caps


class TestProxyToBidiDict:
    """Tests for Proxy.to_bidi_dict()."""

    def test_unspecified(self):
        proxy = Proxy()
        result = proxy.to_bidi_dict()
        assert result == {"proxyType": "unspecified"}

    def test_manual_proxy(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        proxy.ssl_proxy = "localhost:8443"
        proxy.socks_proxy = "localhost:1080"
        proxy.socks_version = 5
        result = proxy.to_bidi_dict()
        assert result["proxyType"] == "manual"
        assert result["httpProxy"] == "localhost:8080"
        assert result["sslProxy"] == "localhost:8443"
        assert result["socksProxy"] == "localhost:1080"
        assert result["socksVersion"] == 5

    def test_manual_proxy_no_proxy_as_string(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        proxy.no_proxy = "localhost, 127.0.0.1"
        result = proxy.to_bidi_dict()
        assert result["noProxy"] == ["localhost", "127.0.0.1"]

    def test_manual_proxy_no_proxy_as_list(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        proxy.no_proxy = ["localhost", "127.0.0.1"]
        result = proxy.to_bidi_dict()
        assert result["noProxy"] == ["localhost", "127.0.0.1"]

    def test_manual_proxy_no_proxy_invalid_type_raises(self):
        proxy = Proxy()
        proxy.http_proxy = "localhost:8080"
        proxy.no_proxy = 12345
        with pytest.raises(TypeError, match="no_proxy must be"):
            proxy.to_bidi_dict()

    def test_pac_proxy(self):
        proxy = Proxy()
        proxy.proxy_autoconfig_url = "http://example.com/proxy.pac"
        result = proxy.to_bidi_dict()
        assert result["proxyType"] == "pac"
        assert result["proxyAutoconfigUrl"] == "http://example.com/proxy.pac"

    def test_direct_proxy(self):
        proxy = Proxy()
        proxy.proxy_type = ProxyType.DIRECT
        result = proxy.to_bidi_dict()
        assert result == {"proxyType": "direct"}
