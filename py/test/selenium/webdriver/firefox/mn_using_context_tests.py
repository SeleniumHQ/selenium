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


class TestUsingContext:

    def setup_method(self, method):

        capabilities = {'marionette': True}
        self.driver = webdriver.Firefox(capabilities=capabilities)

        self.CHROME = 'chrome'
        self.CONTENT = 'content'

    def test_using_context_sets_correct_context_and_returns(self):
        def get_context():
            return self.driver.execute('GET_CONTEXT').pop('value')

        assert get_context() == self.CONTENT
        with self.driver.using_context(self.CHROME):
            assert get_context() == self.CHROME
        assert get_context() == self.CONTENT

    def teardown_method(self, method):
        try:
            self.driver.quit()
        except:
            pass
