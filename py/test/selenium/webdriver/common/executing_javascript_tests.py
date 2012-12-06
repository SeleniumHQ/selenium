#!/usr/bin/python

# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License")
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


import unittest
from selenium.webdriver.remote.webelement import WebElement


class ExecutingJavaScriptTests(unittest.TestCase):

    def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString(self): 
        self._loadPage("xhtmlTest")

        result = self.driver.execute_script("return document.title")

        self.assertTrue(type(result) == unicode or type(result) == str,
            "The type of the result is " + str(type(result)))
        self.assertEqual("XHTML Test Page", result)
  

    def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnInteger(self): 
        self._loadPage("nestedElements")
        result = self.driver.execute_script("return document.getElementsByName('checky').length")

        self.assertTrue(type(result) == int)
        self.assertTrue(long(result) > 1)
  

    #@Ignore(SELENESE)
    def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement(self): 
        self._loadPage("xhtmlTest")

        result = self.driver.execute_script("return document.getElementById('id1')")

        self.assertTrue(result is not None)
        self.assertTrue(type(result) == WebElement)
        self.assertEqual("a", result.tag_name.lower())
  

    def testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean(self): 
        self._loadPage("xhtmlTest")

        result = self.driver.execute_script("return true")

        self.assertTrue(result is not None)
        self.assertTrue(type(result) == bool)
        self.assertTrue(bool(result))
  

    #@Ignore(SELENESE, IPHONE)
    def testShouldBeAbleToExecuteSimpleJavascriptAndAStringsArray(self): 
        self._loadPage("javascriptPage")
        expectedResult = []
        expectedResult.append("zero")
        expectedResult.append("one")
        expectedResult.append("two")
        result = self.driver.execute_script(
            "return ['zero', 'one', 'two']")

        self.assertEqual(expectedResult, result)
  
    #@Ignore(SELENESE, IPHONE)
    def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray(self): 
        self._loadPage("javascriptPage")
        expectedResult = []
        expectedResult.append("zero")
        subList = []
        subList.append(True)
        subList.append(False)
        expectedResult.append(subList)
        result = self.driver.execute_script("return ['zero', [true, false]]")
        self.assertTrue(result is not None)
        self.assertTrue(type(result) == list)
        self.assertTrue(expectedResult, result)
  
    def testPassingAndReturningALongShouldReturnAWholeNumber(self): 
        self._loadPage("javascriptPage")
        expectedResult = 1L
        result = self.driver.execute_script("return arguments[0]", expectedResult)
        self.assertTrue((type(result) == int or type(result) == long))
        self.assertEqual(expectedResult, result)
  

    def testPassingAndReturningADoubleShouldReturnADecimal(self): 
        self._loadPage("javascriptPage")
        expectedResult = 1.2
        result = self.driver.execute_script("return arguments[0]", expectedResult)
        self.assertTrue( type(result) == float)
        self.assertEqual(expectedResult, result)
  
    def testShouldThrowAnExceptionWhenTheJavascriptIsBad(self): 
        self._loadPage("xhtmlTest")

        try:
            self.driver.execute_script("return squiggle()")
            self.fail("Expected an exception")
        except Exception, e: 
            pass 
  

    def testShouldBeAbleToCallFunctionsDefinedOnThePage(self): 
        self._loadPage("javascriptPage")
        self.driver.execute_script("displayMessage('I like cheese')")
        text = self.driver.find_element_by_id("result").text

        self.assertEqual("I like cheese", text.strip())
  
    def testShouldBeAbleToPassAStringAnAsArgument(self): 
        self._loadPage("javascriptPage")
        value = self.driver.execute_script(
            "return arguments[0] == 'fish' ? 'fish' : 'not fish'", "fish")

        self.assertEqual("fish", value)
  

    def testShouldBeAbleToPassABooleanAnAsArgument(self): 
        self._loadPage("javascriptPage")
        value = bool(self.driver.execute_script("return arguments[0] == true", True))

        self.assertTrue(value)
  
    def testShouldBeAbleToPassANumberAnAsArgument(self): 
        self._loadPage("javascriptPage")
        value = bool(self.driver.execute_script("return arguments[0] == 1 ? true : false", 1))

        self.assertTrue(value)
  
    def testShouldBeAbleToPassAWebElementAsArgument(self): 
        self._loadPage("javascriptPage")
        button = self.driver.find_element_by_id("plainButton")
        value = self.driver.execute_script(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']",
            button)

        self.assertEqual("plainButton", value)
  
    def testShouldBeAbleToPassAnArrayAsArgument(self): 
        self._loadPage("javascriptPage")
        array = ["zero", 1, True, 3.14159]
        length = long(self.driver.execute_script("return arguments[0].length", array))
        self.assertEqual(len(array), length)
  

    def testShouldBeAbleToPassACollectionAsArgument(self): 
        self._loadPage("javascriptPage")
        collection = []
        collection.append("Cheddar")
        collection.append("Brie")
        collection.append(7)
        length = long(self.driver.execute_script("return arguments[0].length", collection))
        self.assertEqual(len(collection), length)

        collection = []
        collection.append("Gouda")
        collection.append("Stilton")
        collection.append("Stilton")
        collection.append(True)
        length = long(self.driver.execute_script("return arguments[0].length", collection))
        self.assertEqual(len(collection), length)
  
    def testShouldThrowAnExceptionIfAnArgumentIsNotValid(self): 
        self._loadPage("javascriptPage")
        try:
            self.driver.execute_script("return arguments[0]", driver)
            self.fail("Exception should have been thrown")
        except Exception, e: 
            pass 
  
    def testShouldBeAbleToPassInMoreThanOneArgument(self): 
        self._loadPage("javascriptPage")
        result = self.driver.execute_script("return arguments[0] + arguments[1]", "one", "two")

        self.assertEqual("onetwo", result)
  
    def testJavascriptStringHandlingShouldWorkAsExpected(self): 
        self._loadPage("javascriptPage")

        value = self.driver.execute_script("return ''")
        self.assertEqual("", value)

        value = self.driver.execute_script("return undefined")
        self.assertTrue(value is None)

        value = self.driver.execute_script("return ' '")
        self.assertEqual(" ", value)

    def testShouldBeAbleToCreateAPersistentValue(self): 
        self._loadPage("formPage")

        self.driver.execute_script("document.alerts = []")
        self.driver.execute_script("document.alerts.push('hello world')")
        text = self.driver.execute_script("return document.alerts.shift()")

        self.assertEqual("hello world", text)

    def testCanPassADictionaryAsAParameter(self):
        self._loadSimplePage() 
        nums = [1, 2]
        args = {"bar": "test", "foo": nums}


        res = self.driver.execute_script("return arguments[0]['foo'][1]", args);

        self.assertEqual(2, res)
    
    def testCanPassANone(self):
        self._loadSimplePage() 
        res = self.driver.execute_script("return arguments[0] === null", None)
        self.assertTrue(res)

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
