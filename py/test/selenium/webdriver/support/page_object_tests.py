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

# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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
import pytest
import time
import unittest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import InvalidSelectorException, TimeoutException,\
    WebDriverException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.page_objects import PageObject, FindAllBy, FindBy

class FormPage(PageObject):
    email = FindBy(By.ID, 'email')
    age = FindBy(By.ID, 'age')
    submit_button = FindBy(By.ID, 'submit')
    non_existent = FindBy(By.ID, 'bubblyBubble')

class ResultPage(PageObject):
    items = FindAllBy(By.CLASS_NAME, 'items')

class PageObjectTests(unittest.TestCase):
    def testInvalidPageObjectInitializationThrowWebDriverException(self):
        try:
            PageObject(None)
        except WebDriverException as e:
            self.assertEquals("A WebDriver instance must be supplied", e.msg)

    def testInvalidFindByInitializationThrowInvalidSelectorException(self):
        try:
            FindBy(None)
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testInvalidFindAllByInitializationThrowInvalidSelectorException(self):
        try:
            FindAllBy(None)
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testInvalidFindByByAttributeThrowInvalidSelectorException(self):
        try:
            FindBy('IDSIDS', 'submit')
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testInvalidFindByValueAttributeThrowInvalidSelectorException(self):
        try:
            FindBy(By.ID, 23)
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testInvalidFindAllByByAttributeThrowInvalidSelectorException(self):
        try:
            FindAllBy('IDSIDS', 'submit')
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testInvalidFindAllByValueAttributeThrowInvalidSelectorException(self):
        try:
            FindAllBy(By.ID, 23)
        except InvalidSelectorException as e:
            self.assertEquals("Invalid locator values passed in", e.msg)

    def testFindByWhenNotOnPageObjectThrowWebDriverException(self):
        try:
            FindBy(By.ID, 'submit')
        except WebDriverException as e:
            self.assertEquals("FindBy can only be used on a PageObject", e.msg)

    def testFindAllByWhenNotOnPageObjectThrowWebDriverException(self):
        try:
            FindAllBy(By.ID, 'list')
        except WebDriverException as e:
            self.assertEquals("FindAllBy can only be used on PageObject", e.msg)

    def testMultiplePageObjectsWithNoFind(self):
        self._loadFormPage()
        form_page = PageObject(self.driver)
        self.assertEquals('I like cheese', form_page.driver.find_element_by_id('cheeseLiker').text)
        form_page.driver.find_element_by_id('submitButton').click()
        result_page = PageObject(form_page)
        self.assertEquals('Success!', result_page.driver.find_element_by_id('greeting').text)

    def testMultiplePageObjectsWithFind(self):
        self._loadFormPage()
        form_page = FormPage(self.driver)
        form_page.email.send_keys('test@testy.com')
        form_page.age.send_keys('2')
        form_page.submit_button.click()
        result_page = ResultPage(form_page)
        self.assertEquals(2, result_page.items.count(WebElement))

    def testNonExistentFindThrowTimeoutException(self):
        self._loadFormPage()
        form_page = FormPage(self.driver)
        try:
            form_page.non_existent.click()
        except TimeoutException:
            pass

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadFormPage(self):
        self._loadPage("formPage")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
