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
import unittest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement


@pytest.mark.ignore_phantomjs
class ExecutingAsyncJavaScriptTests(unittest.TestCase):

    def testShouldNotTimeoutIfCallbackInvokedImmediately(self):
        self._loadPage("ajaxy_page")
        result = self.driver.execute_async_script("arguments[arguments.length - 1](123);")
        self.assertTrue(type(result) == int)
        self.assertEqual(123, result)

    def testShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNoneNorUndefined(self):
        self._loadPage("ajaxy_page")
        self.assertEqual(123, self.driver.execute_async_script(
            "arguments[arguments.length - 1](123);"))
        self.assertEqual("abc", self.driver.execute_async_script("arguments[arguments.length - 1]('abc');"))
        self.assertFalse(bool(self.driver.execute_async_script("arguments[arguments.length - 1](false);")))
        self.assertTrue(bool(self.driver.execute_async_script("arguments[arguments.length - 1](true);")))

    # @Ignore(value = SELENESE, reason = "SeleniumRC cannot return null values.")
    def testShouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined(self):
        self._loadPage("ajaxy_page")
        self.assertTrue(self.driver.execute_async_script("arguments[arguments.length - 1](null)") is None)
        self.assertTrue(self.driver.execute_async_script("arguments[arguments.length - 1]()") is None)

    # @Ignore(value = SELENESE, reason = "Selenium cannot return arrays")
    def testShouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript(self):
        self._loadPage("ajaxy_page")
        result = self.driver.execute_async_script("arguments[arguments.length - 1]([]);")
        self.assertTrue("Expected not to be null!", result is not None)
        self.assertTrue(type(result) == list)
        self.assertTrue(len(result) == 0)

    # @Ignore(value = SELENESE, reason = "Selenium cannot return arrays")
    def testShouldBeAbleToReturnAnArrayObjectFromAnAsyncScript(self):
        self._loadPage("ajaxy_page")

        result = self.driver.execute_async_script("arguments[arguments.length - 1](new Array());")
        self.assertTrue("Expected not to be null!", result is not None)
        self.assertTrue(type(result) == list)
        self.assertTrue(len(result) == 0)

    # @Ignore(value = ANDROID, SELENESE,
    #  reason = "Android does not properly handle arrays; Selenium cannot return arrays")
    def testShouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts(self):
        self._loadPage("ajaxy_page")

        result = self.driver.execute_async_script(
            "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);")

        self.assertTrue(result is not None)
        self.assertTrue(type(result) == list)
        self.assertFalse(bool(result.pop()))
        self.assertTrue(bool(result.pop()))
        self.assertEqual("abc", result.pop())
        self.assertEqual(123, result.pop())
        self.assertTrue(result.pop() is None)
        self.assertTrue(len(result) == 0)

    # @Ignore(value = SELENESE, reason = "Selenium cannot return elements from scripts")
    def testShouldBeAbleToReturnWebElementsFromAsyncScripts(self):
        self._loadPage("ajaxy_page")

        result = self.driver.execute_async_script("arguments[arguments.length - 1](document.body);")
        self.assertTrue(type(result) == WebElement)
        self.assertEqual("body", result.tag_name.lower())

    # @Ignore(value = ANDROID, SELENESE,
    #  reason = "Android does not properly handle arrays; Selenium cannot return elements")
    def testShouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts(self):
        self._loadPage("ajaxy_page")

        result = self.driver.execute_async_script(
            "arguments[arguments.length - 1]([document.body, document.body]);")
        self.assertTrue(result is not None)
        self.assertTrue(type(result) == list)

        list_ = result
        self.assertEqual(2, len(list_))
        self.assertTrue(type(list_[0]) == WebElement)
        self.assertTrue(type(list_[1]) == WebElement)
        self.assertEqual("body", list_[0].tag_name)
        # self.assertEqual(list_[0], list_[1])

    def testShouldTimeoutIfScriptDoesNotInvokeCallback(self):
        self._loadPage("ajaxy_page")
        try:
            # Script is expected to be async and explicitly callback, so this should timeout.
            self.driver.execute_async_script("return 1 + 2;")
            self.fail("Should have thrown a TimeOutException!")
        except TimeoutException:
            pass

    def testShouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout(self):
        self._loadPage("ajaxy_page")
        try:
            self.driver.execute_async_script("window.setTimeout(function() {}, 0);")
            self.fail("Should have thrown a TimeOutException!")
        except TimeoutException:
            pass

    def testShouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout(self):
        self._loadPage("ajaxy_page")
        self.driver.execute_async_script(
            """var callback = arguments[arguments.length - 1];
            window.setTimeout(function() { callback(123); }, 0)""")

    def testShouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout(self):
        self.driver.set_script_timeout(0.5)
        self._loadPage("ajaxy_page")
        try:
            self.driver.execute_async_script(
                """var callback = arguments[arguments.length - 1];
                window.setTimeout(callback, 1500);""")
            self.fail("Should have thrown a TimeOutException!")
        except TimeoutException:
            pass

    def testShouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError(self):
        self._loadPage("ajaxy_page")
        self.driver.set_script_timeout(0.1)
        try:
            self.driver.execute_async_script("window.location = '" + self._pageURL("dynamic") + "';")
            self.fail('Should have throw a WebDriverException')
        except WebDriverException:
            pass

    def testShouldCatchErrorsWhenExecutingInitialScript(self):
        self._loadPage("ajaxy_page")
        try:
            self.driver.execute_async_script("throw Error('you should catch this!');")
            self.fail("Should have thrown a WebDriverException")
        except WebDriverException:
            pass

    # @Ignore(value = ANDROID, CHROME,
    #  reason = "Android: Emulator is too slow and latency causes test to fall out of sync with app;"
    #      + "Chrome: Click is not working")
    def testShouldBeAbleToExecuteAsynchronousScripts(self):
        self._loadPage("ajaxy_page")

        typer = self.driver.find_element(by=By.NAME, value="typer")
        typer.send_keys("bob")
        self.assertEqual("bob", typer.get_attribute("value"))

        self.driver.find_element(by=By.ID, value="red").click()
        self.driver.find_element(by=By.NAME, value="submit").click()

        self.assertEqual(1, len(self.driver.find_elements(by=By.TAG_NAME, value='div')),
                         "There should only be 1 DIV at this point, which is used for the butter message")
        self.driver.set_script_timeout(10)
        text = self.driver.execute_async_script(
            """var callback = arguments[arguments.length - 1];
            window.registerListener(arguments[arguments.length - 1]);""")
        self.assertEqual("bob", text)
        self.assertEqual("", typer.get_attribute("value"))

        self.assertEqual(2, len(self.driver.find_elements(by=By.TAG_NAME, value='div')),
                         "There should be 1 DIV (for the butter message) + 1 DIV (for the new label)")

    def testShouldBeAbleToPassMultipleArgumentsToAsyncScripts(self):
        self._loadPage("ajaxy_page")
        result = self.driver.execute_async_script("""
            arguments[arguments.length - 1](arguments[0] + arguments[1]);""", 1, 2)
        self.assertEqual(3, result)

    # TODO DavidBurns Disabled till Java WebServer is used
    # def testShouldBeAbleToMakeXMLHttpRequestsAndWaitForTheResponse(self):
    #    script = """
    #        var url = arguments[0];
    #        var callback = arguments[arguments.length - 1];
    #        // Adapted from http://www.quirksmode.org/js/xmlhttp.html
    #        var XMLHttpFactories = [
    #          function () return new XMLHttpRequest(),
    #          function () return new ActiveXObject('Msxml2.XMLHTTP'),
    #          function () return new ActiveXObject('Msxml3.XMLHTTP'),
    #          function () return new ActiveXObject('Microsoft.XMLHTTP')
    #        ];
    #        var xhr = false;
    #        while (!xhr && XMLHttpFactories.length)
    #          try{
    #            xhr = XMLHttpFactories.shift().call();
    #           }catch (e)
    #
    #        if (!xhr) throw Error('unable to create XHR object');
    #        xhr.open('GET', url, true);
    #        xhr.onreadystatechange = function()
    #          if (xhr.readyState == 4) callback(xhr.responseText);
    #
    #        xhr.send('');""" # empty string to stop firefox 3 from choking
    #
    #    self._loadPage("ajaxy_page")
    #    self.driver.set_script_timeout(3)
    #    response = self.driver.execute_async_script(script, pages.sleepingPage + "?time=2")
    #    htm = "<html><head><title>Done</title></head><body>Slept for 2s</body></html>"
    #    self.assertTrue(response.strip() == htm)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
