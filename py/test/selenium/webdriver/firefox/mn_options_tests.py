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


from selenium import webdriver
from selenium.webdriver.firefox.options import Options

from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer


class TestOptions:

    def setup_method(self, method):
        self.webserver = SimpleWebServer()
        self.webserver.start()

    def test_we_can_pass_options(self):
        capabilities = {'marionette': True}
        options = Options()
        self.driver = webdriver.Firefox(
            capabilities=capabilities,
            firefox_options=options)
        self.driver.get(self.webserver.where_is('formPage.html'))
        self.driver.find_element_by_id("cheese")

    def teardown_method(self, method):
        try:
            self.driver.quit()
        except:
            pass  # Don't care since we may have killed the browser above
        self.webserver.stop()


def teardown_module(module):
    try:
        TestOptions.driver.quit()
    except:
        pass  # Don't Care since we may have killed the browser above
