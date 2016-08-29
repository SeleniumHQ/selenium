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

from selenium.common.exceptions import InvalidElementStateException


@pytest.mark.ignore_chrome
class ClearTests(unittest.TestCase):

    def testWritableTextInputShouldClear(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("writableTextInput")
        element.clear()
        self.assertEqual("", element.get_attribute("value"))

    def testTextInputShouldNotClearWhenDisabled(self):
        self._loadPage("readOnlyPage")
        try:
            element = self.driver.find_element_by_id("textInputnotenabled")
            self.assertFalse(element.is_enabled())
            element.clear()
            self.fail("Should not have been able to clear")
        except InvalidElementStateException:
            pass

    def testTextInputShouldNotClearWhenReadOnly(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("readOnlyTextInput")
        try:
            element.clear()
            self.fail("Should not have been able to clear")
        except InvalidElementStateException:
            pass

    def testWritableTextAreaShouldClear(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("writableTextArea")
        element.clear()
        self.assertEqual("", element.get_attribute("value"))

    def testTextAreaShouldNotClearWhenDisabled(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("textAreaNotenabled")
        try:
            element.clear()
            self.fail("Should not have been able to clear")
        except InvalidElementStateException:
            pass

    def testTextAreaShouldNotClearWhenReadOnly(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("textAreaReadOnly")
        try:
            element.clear()
            self.fail("Should not have been able to clear")
        except InvalidElementStateException:
            pass

    def testContentEditableAreaShouldClear(self):
        self._loadPage("readOnlyPage")
        element = self.driver.find_element_by_id("content-editable")
        element.clear()
        self.assertEqual("", element.text)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
