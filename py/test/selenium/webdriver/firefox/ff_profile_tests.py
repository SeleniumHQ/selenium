#!/usr/bin/python
#
# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import base64
import os
import unittest
import zipfile

from cStringIO import StringIO
from selenium import webdriver
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer


class TestFirefoxProfile:

    def setup_method(self, method):
        self.driver = webdriver.Firefox()
        self.webserver = SimpleWebServer()
        self.webserver.start()

    def test_that_we_can_accept_a_profile(self):
        # The setup gave us a browser but we dont need it since we are doing our own thing
        self.driver.quit()

        self.profile1 = webdriver.FirefoxProfile()
        self.profile1.set_preference("startup.homepage_welcome_url",
            "%s" % "http://localhost:%d/%s.html" % (self.webserver.port, "simpleTest"))
        self.profile1.update_preferences()

        self.profile2 = webdriver.FirefoxProfile(self.profile1.path)
        self.driver = webdriver.Firefox(firefox_profile=self.profile2)
        title = self.driver.title
        assert "Hello WebDriver" == title

    def test_that_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference("sample.preference", "hi there")
        profile.update_preferences()

        assert '"hi there"' == profile.default_preferences["sample.preference"]

        encoded = profile.encoded
        decoded = base64.decodestring(encoded)
        fp = StringIO(decoded)
        zip = zipfile.ZipFile(fp, "r")
        for entry in zip.namelist():
            if entry.endswith("user.js"):
                user_js = zip.read(entry)
                for line in user_js.splitlines():
                    if line.startswith('user_pref("sample.preference",'):
                        assert True == line.endswith('"hi there");')
            # there should be only one user.js
            break
        fp.close()

    def test_that_unicode_prefs_are_written_in_the_correct_format(self):
        # The setup gave us a browser but we dont need it
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        profile.set_preference("sample.preference.2", u"hi there")
        profile.update_preferences()

        assert '"hi there"' == profile.default_preferences["sample.preference.2"]

        encoded = profile.encoded
        decoded = base64.decodestring(encoded)
        fp = StringIO(decoded)
        zip = zipfile.ZipFile(fp, "r")
        for entry in zip.namelist():
            if entry.endswith("user.js"):
                user_js = zip.read(entry)
                for line in user_js.splitlines():
                    if line.startswith('user_pref("sample.preference.2",'):
                        assert True == line.endswith('"hi there");')
            # there should be only one user.js
            break
        fp.close()


    def test_that_we_delete_the_profile(self):
        path = self.driver.firefox_profile.path
        self.driver.quit()
        assert not os.path.exists(path)

    def test_profiles_do_not_share_preferences(self):
        self.profile1 = webdriver.FirefoxProfile()
        self.profile1.accept_untrusted_certs = False
        self.profile2 = webdriver.FirefoxProfile()
        # Default is true. Should remain so.
        assert self.profile2.default_preferences["webdriver_accept_untrusted_certs"] == 'true'

    def test_sets_http_proxy(self):
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        proxy = Proxy()
        proxy.http_proxy = 'http://test.hostname:1234'
        profile.set_proxy(proxy)
        assert profile.default_preferences["network.proxy.type"] == str(ProxyType.MANUAL['ff_value'])
        assert profile.default_preferences["network.proxy.http"] == '"test.hostname"'
        assert profile.default_preferences["network.proxy.http_port"] == '1234'

    def test_sets_ssl_proxy(self):
        self.driver.quit()

        profile = webdriver.FirefoxProfile()
        proxy = Proxy()
        proxy.ssl_proxy = 'https://test.hostname:1234'
        profile.set_proxy(proxy)
        assert profile.default_preferences["network.proxy.type"] == str(ProxyType.MANUAL['ff_value'])
        assert profile.default_preferences["network.proxy.ssl"] == '"test.hostname"'
        assert profile.default_preferences["network.proxy.ssl_port"] == '1234'

    def teardown_method(self, method):
        try:
            self.driver.quit()
        except:
            pass #don't care since we may have killed the browser above
        self.webserver.stop()

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

def teardown_module(module):
    try:
        TestFirefoxProfile.driver.quit()
    except:
        pass #Don't Care since we may have killed the browser above
