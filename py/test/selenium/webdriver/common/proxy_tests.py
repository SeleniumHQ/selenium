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

import unittest
from selenium.webdriver.common.proxy import Proxy, ProxyType


class ProxyTests(unittest.TestCase):

    MANUAL_PROXY = {
        'httpProxy': 'some.url:1234',
        'ftpProxy': 'ftp.proxy',
        'noProxy': 'localhost, foo.localhost',
        'sslProxy': 'ssl.proxy:1234',
        'socksProxy': 'socks.proxy:65555',
        'socksUsername': 'test',
        'socksPassword': 'test',
    }

    PAC_PROXY = {
        'proxyAutoconfigUrl': 'http://pac.url:1234',
    }

    AUTODETECT_PROXY = {
        'autodetect': True,
    }

    def testCanAddManualProxyToDesiredCapabilities(self):
        proxy = Proxy()
        proxy.http_proxy = self.MANUAL_PROXY['httpProxy']
        proxy.ftp_proxy = self.MANUAL_PROXY['ftpProxy']
        proxy.no_proxy = self.MANUAL_PROXY['noProxy']
        proxy.sslProxy = self.MANUAL_PROXY['sslProxy']
        proxy.socksProxy = self.MANUAL_PROXY['socksProxy']
        proxy.socksUsername = self.MANUAL_PROXY['socksUsername']
        proxy.socksPassword = self.MANUAL_PROXY['socksPassword']

        desired_capabilities = {}
        proxy.add_to_capabilities(desired_capabilities)

        proxy_capabilities = self.MANUAL_PROXY.copy()
        proxy_capabilities['proxyType'] = 'MANUAL'
        expected_capabilities = {'proxy': proxy_capabilities}
        self.assertEqual(expected_capabilities, desired_capabilities)

    def testCanAddAutodetectProxyToDesiredCapabilities(self):
        proxy = Proxy()
        proxy.auto_detect = self.AUTODETECT_PROXY['autodetect']

        desired_capabilities = {}
        proxy.add_to_capabilities(desired_capabilities)

        proxy_capabilities = self.AUTODETECT_PROXY.copy()
        proxy_capabilities['proxyType'] = 'AUTODETECT'
        expected_capabilities = {'proxy': proxy_capabilities}
        self.assertEqual(expected_capabilities, desired_capabilities)

    def testCanAddPACProxyToDesiredCapabilities(self):
        proxy = Proxy()
        proxy.proxy_autoconfig_url = self.PAC_PROXY['proxyAutoconfigUrl']

        desired_capabilities = {}
        proxy.add_to_capabilities(desired_capabilities)

        proxy_capabilities = self.PAC_PROXY.copy()
        proxy_capabilities['proxyType'] = 'PAC'
        expected_capabilities = {'proxy': proxy_capabilities}
        self.assertEqual(expected_capabilities, desired_capabilities)

    def testCanNotChangeInitializedProxyType(self):
        proxy = Proxy(raw={'proxyType': 'direct'})
        try:
            proxy.proxy_type = ProxyType.SYSTEM
            raise Exception("Change of already initialized proxy type should raise exception")
        except Exception:
            pass

        proxy = Proxy(raw={'proxyType': ProxyType.DIRECT})
        try:
            proxy.proxy_type = ProxyType.SYSTEM
            raise Exception("Change of already initialized proxy type should raise exception")
        except Exception:
            pass

    def testCanInitManualProxy(self):
        proxy = Proxy(raw=self.MANUAL_PROXY)

        self.assertEqual(ProxyType.MANUAL, proxy.proxy_type)
        self.assertEqual(self.MANUAL_PROXY['httpProxy'], proxy.http_proxy)
        self.assertEqual(self.MANUAL_PROXY['ftpProxy'], proxy.ftp_proxy)
        self.assertEqual(self.MANUAL_PROXY['noProxy'], proxy.no_proxy)
        self.assertEqual(self.MANUAL_PROXY['sslProxy'], proxy.sslProxy)
        self.assertEqual(self.MANUAL_PROXY['socksProxy'], proxy.socksProxy)
        self.assertEqual(self.MANUAL_PROXY['socksUsername'], proxy.socksUsername)
        self.assertEqual(self.MANUAL_PROXY['socksPassword'], proxy.socksPassword)

    def testCanInitAutodetectProxy(self):
        proxy = Proxy(raw=self.AUTODETECT_PROXY)

        self.assertEqual(ProxyType.AUTODETECT, proxy.proxy_type)
        self.assertEqual(self.AUTODETECT_PROXY['autodetect'], proxy.auto_detect)

    def testCanInitPACProxy(self):
        proxy = Proxy(raw=self.PAC_PROXY)

        self.assertEqual(ProxyType.PAC, proxy.proxy_type)
        self.assertEqual(self.PAC_PROXY['proxyAutoconfigUrl'], proxy.proxy_autoconfig_url)

    def testCanInitEmptyProxy(self):
        proxy = Proxy()

        self.assertEqual(ProxyType.UNSPECIFIED, proxy.proxy_type)
        self.assertEqual('', proxy.http_proxy)
        self.assertEqual('', proxy.ftp_proxy)
        self.assertEqual('', proxy.no_proxy)
        self.assertEqual('', proxy.sslProxy)
        self.assertEqual('', proxy.socksProxy)
        self.assertEqual('', proxy.socksUsername)
        self.assertEqual('', proxy.socksPassword)
        self.assertEqual(False, proxy.auto_detect)
        self.assertEqual('', proxy.proxy_autoconfig_url)

        desired_capabilities = {}
        proxy.add_to_capabilities(desired_capabilities)

        proxy_capabilities = {}
        proxy_capabilities['proxyType'] = 'UNSPECIFIED'
        expected_capabilities = {'proxy': proxy_capabilities}
        self.assertEqual(expected_capabilities, desired_capabilities)
