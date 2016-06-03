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
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary


class TestMarionetteBinary:

    def test_invalid_binary_str(self):
        capabilities = {'marionette': True}
        with pytest.raises(WebDriverException) as excinfo:
            self.driver = webdriver.Firefox(
                capabilities=capabilities,
                firefox_binary='foo')
        assert 'entity not found' in str(excinfo.value)

    def test_invalid_binary_obj(self):
        capabilities = {'marionette': True}
        with pytest.raises(WebDriverException) as excinfo:
            self.driver = webdriver.Firefox(
                capabilities=capabilities,
                firefox_binary=FirefoxBinary(firefox_path='foo'))
        assert 'entity not found' in str(excinfo.value)

    def teardown_method(self, method):
        try:
            self.driver.quit()
        except:
            pass
