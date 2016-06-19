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

import pytest
from selenium.webdriver.common.html5.application_cache import ApplicationCache


class AppCacheTests(unittest.TestCase):

    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_marionette
    def testWeCanGetTheStatusOfTheAppCache(self):
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not implement appcache")
        self._loadPage('html5Page')
        self.driver.implicitly_wait(2)
        app_cache = self.driver.application_cache

        status = app_cache.status
        while status == ApplicationCache.DOWNLOADING:
            status = app_cache.status

        self.assertEquals(ApplicationCache.UNCACHED, app_cache.status)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
