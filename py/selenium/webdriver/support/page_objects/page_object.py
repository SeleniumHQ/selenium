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
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.remote.webdriver import WebDriver

class PageObject(object):
    def __init__(self, driver):
        """
        Creates a new instance of a PageObject and takes a WebDriver instance upon initialisation.

        :Args:
         - driver : A WebDriver instance

        Example:

        .. code-block:: python

            from selenium.webdriver import Firefox
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.page_objects import PageObject, FindBy, FindAllBy

            class SeleniumHome(PageObject):
                uri = 'http://www.seleniumhq.org/'

                search_box = FindBy(By.ID, 'q')
                submit_button = FindBy(By.ID, 'submit')

                def __init__(self, driver):
                    super().__init__(driver) #  Python 3 __super__

                def navigate(self):
                    self.driver.get(self.uri)

                def search_for(self, text):
                    self.search_box.send_keys(text)
                    self.submit_button.click()

                    return SearchPage(self.driver)


            class SearchPage(PageObject):
                search_results = FindAllBy(By.CLASS_NAME, 'gs-title')

                def __init__(self, driver):
                    super().__init__(driver) #  Python 3 __super__

            wd = Firefox()
            wd.get('http://www.seleniumhq.org/')

            page = SeleniumHome(wd)
            results = page.search_for('Hello')
            results.search_results[2].click()
        """
        if not isinstance(driver, WebDriver):
            raise WebDriverException("A WebDriver instance must be supplied")

        self.driver = driver
