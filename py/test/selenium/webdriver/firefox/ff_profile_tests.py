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
import zipfile

try:
    from io import BytesIO
except ImportError:
    from cStringIO import StringIO as BytesIO

try:
    unicode
except NameError:
    unicode = str

from selenium import webdriver
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer


class TestFirefoxProfile:

    def setup_method(self, method):
        self.capabilities = {'marionette': False}
        self.driver = webdriver.Firefox(capabilities=self.capabilities)
        self.webserver = SimpleWebServer()
        self.webserver.start()

    def test_that_we_can_accept_a_profile(self):
        profile1 = webdriver.FirefoxProfile()
        profile1.set_preference("browser.startup.homepage_override.mstone", "")
        profile1.set_preference("startup.homepage_welcome_url", self.webserver.where_is('simpleTest.html'))
        profile1.update_preferences()

        profile2 = webdriver.FirefoxProfile(profile1.path)
        driver = webdriver.Firefox(
            capabilities=self.capabilities,
            firefox_profile=profile2)
        title = driver.title
        driver.quit()
        assert "Hello WebDriver" == title

    def test_that_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference("sample.preference", "hi there")
        profile.update_preferences()

        assert 'hi there' == profile.default_preferences["sample.preference"]

        encoded = profile.encoded
        decoded = base64.decodestring(encoded)
        fp = BytesIO(decoded)
        zip = zipfile.ZipFile(fp, "r")
        for entry in zip.namelist():
            if entry.endswith("user.js"):
                user_js = zip.read(entry)
                for line in user_js.splitlines():
                    if line.startswith(b'user_pref("sample.preference",'):
                        assert line.endswith(b'hi there");')
            # there should be only one user.js
            break
        fp.close()

    def test_that_unicode_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference('sample.preference.2', unicode('hi there'))
        profile.update_preferences()

        assert 'hi there' == profile.default_preferences["sample.preference.2"]

        encoded = profile.encoded
        decoded = base64.decodestring(encoded)
        fp = BytesIO(decoded)
        zip = zipfile.ZipFile(fp, "r")
        for entry in zip.namelist():
            if entry.endswith('user.js'):
                user_js = zip.read(entry)
                for line in user_js.splitlines():
                    if line.startswith(b'user_pref("sample.preference.2",'):
                        assert line.endswith(b'hi there");')
            # there should be only one user.js
            break
        fp.close()

    def test_that_integer_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference("sample.int.preference", 12345)
        profile.update_preferences()
        assert 12345 == profile.default_preferences["sample.int.preference"]

    def test_that_boolean_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference("sample.bool.preference", True)
        profile.update_preferences()
        assert profile.default_preferences["sample.bool.preference"] is True

    def test_that_we_delete_the_profile(self):
        path = self.driver.firefox_profile.path
        self.driver.quit()
        assert not os.path.exists(path)

    def test_profiles_do_not_share_preferences(self):
        self.profile1 = webdriver.FirefoxProfile()
        self.profile1.accept_untrusted_certs = False
        self.profile2 = webdriver.FirefoxProfile()
        # Default is true. Should remain so.
        assert self.profile2.default_preferences["webdriver_accept_untrusted_certs"] is True

    def test_none_proxy_is_set(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        self.profile = webdriver.FirefoxProfile()
        proxy = None

        try:
            self.profile.set_proxy(proxy)
            assert False, "exception after passing empty proxy is expected"
        except ValueError:
            pass

        assert "network.proxy.type" not in self.profile.default_preferences

    def test_unspecified_proxy_is_set(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        self.profile = webdriver.FirefoxProfile()
        proxy = Proxy()

        self.profile.set_proxy(proxy)

        assert "network.proxy.type" not in self.profile.default_preferences

    def test_manual_proxy_is_set_in_profile(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        self.profile = webdriver.FirefoxProfile()
        proxy = Proxy()
        proxy.no_proxy = 'localhost, foo.localhost'
        proxy.http_proxy = 'some.url:1234'
        proxy.ftp_proxy = None
        proxy.sslProxy = 'some2.url'

        self.profile.set_proxy(proxy)

        assert self.profile.default_preferences["network.proxy.type"] == ProxyType.MANUAL['ff_value']
        assert self.profile.default_preferences["network.proxy.no_proxies_on"] == 'localhost, foo.localhost'
        assert self.profile.default_preferences["network.proxy.http"] == 'some.url'
        assert self.profile.default_preferences["network.proxy.http_port"] == 1234
        assert self.profile.default_preferences["network.proxy.ssl"] == 'some2.url'
        assert "network.proxy.ssl_port" not in self.profile.default_preferences
        assert "network.proxy.ftp" not in self.profile.default_preferences

    def test_pac_proxy_is_set_in_profile(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        self.profile = webdriver.FirefoxProfile()
        proxy = Proxy()
        proxy.proxy_autoconfig_url = 'http://some.url:12345/path'

        self.profile.set_proxy(proxy)

        assert self.profile.default_preferences["network.proxy.type"] == ProxyType.PAC['ff_value']
        assert self.profile.default_preferences["network.proxy.autoconfig_url"] == 'http://some.url:12345/path'

    def test_autodetect_proxy_is_set_in_profile(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        self.profile = webdriver.FirefoxProfile()
        proxy = Proxy()
        proxy.auto_detect = True

        self.profile.set_proxy(proxy)

        assert self.profile.default_preferences["network.proxy.type"] == ProxyType.AUTODETECT['ff_value']

    def teardown_method(self, method):
        try:
            self.driver.quit()
        except:
            pass  # don't care since we may have killed the browser above
        self.webserver.stop()

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))


def teardown_module(module):
    try:
        TestFirefoxProfile.driver.quit()
    except:
        pass  # Don't Care since we may have killed the browser above
