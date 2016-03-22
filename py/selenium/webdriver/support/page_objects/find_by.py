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
from selenium.common.exceptions import InvalidSelectorException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.page_objects.page_object import PageObject
from selenium.webdriver.support.wait import WebDriverWait

try:
    basestring
except NameError:
    basestring = str

class FindBy(object):
    def __init__(self, by=By.ID, value=None, timeout=30):
        """
        Creates a new instance of FindBy. FindBy is used explicitly on PageObjects.
        Takes a locator value and upon __get__ returns any matching element from the DOM
        Will wait 30 seconds by default for it to be visible and raise a TimeoutException if not
        found.

        :Args:
         - driver : A WebDriver instance
         - by : A locator type (By.ID, By.CLASS_NAME)
         - value : A locator value
         - timeout : The time to wait for an object before raising a timeout exception

        Example:

        .. code-block:: python

            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.page_objects import PageObject, FindBy, FindAllBy

            class Home(PageObject):
                # Must be used on a PageObject
                element = FindBy(By.ID, 'q', 20)
                another_element = FindBy(By.CLASS_NAME, 'thing', 60)

        throws TimeoutException if nothing can be found via the specified locator values.

        :rtype: WebElement
        """
        if not By.is_valid(by) or not isinstance(value, basestring):
            raise InvalidSelectorException("Invalid locator values passed in")

        self.by = by
        self.value = value
        self.timeout = timeout

    def __get__(self, obj, *args):
        if not isinstance(obj, PageObject):
            raise WebDriverException("FindBy can only be used on a PageObject")
        self.element = WebDriverWait(obj.driver, self.timeout).until(
            lambda e: e.find_element(by=self.by, value=self.value))
        return self.element
