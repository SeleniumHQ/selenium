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

from selenium.common.exceptions import NoSuchElementException
from results_page import ResultsPage
from page_loader import require_loaded


class GoogleOneBox(object):
    """This class models a page that has a google search bar."""

    def __init__(self, driver, url):
        self._driver = driver
        self._url = url

    def is_loaded(self):
        try:
            self._driver.find_element_by_name("q")
            return True
        except NoSuchElementException:
            return False

    def load(self):
        self._driver.get(self._url)

    @require_loaded
    def search_for(self, search_term):
        element = self._driver.find_element_by_name("q")
        element.send_keys(search_term)
        element.submit()
        return ResultsPage(self._driver)
