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


from selenium.webdriver.common.by import By


class ResultsPage:
    """This class models a google search result page."""

    def __init__(self, driver):
        self._driver = driver

    def is_loaded(self):
        return "/search" in self._driver.get_current_url()

    def load(self):
        raise Exception("This page shouldn't be loaded directly")

    def link_contains_match_for(self, term):
        result_section = self._driver.find_element(By.ID, "res")
        elements = result_section.find_elements(By.XPATH, ".//*[@class='l']")
        for e in elements:
            if term in e.get_text():
                return True
        return False
