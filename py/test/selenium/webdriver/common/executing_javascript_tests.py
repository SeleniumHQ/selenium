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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

try:
    str = unicode
except NameError:
    pass


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.title")

    assert type(result) == str, "The type of the result is %s" % type(result)
    assert "XHTML Test Page" == result


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnInteger(driver, pages):
    pages.load("nestedElements.html")
    result = driver.execute_script("return document.getElementsByName('checky').length")

    assert type(result) == int
    assert int(result) > 1


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.getElementById('id1')")

    assert result is not None
    assert isinstance(result, WebElement)
    assert "a" == result.tag_name.lower()


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAListOfWebElements(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.querySelectorAll('div.navigation a')")

    assert result is not None
    assert isinstance(result, list)
    assert all(isinstance(item, WebElement) for item in result)
    assert all('a' == item.tag_name.lower() for item in result)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnWebElementsInsideAList(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return [document.body]")

    assert result is not None
    assert isinstance(result, list)
    assert isinstance(result[0], WebElement)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnWebElementsInsideANestedList(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return [document.body, [document.getElementById('id1')]]")

    assert result is not None
    assert isinstance(result, list)
    assert isinstance(result[0], WebElement)
    assert isinstance(result[1][0], WebElement)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnWebElementsInsideADict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: document.body}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get('el1'), WebElement)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnWebElementsInsideANestedDict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: document.body, "
                                   "nested: {el2: document.getElementById('id1')}}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get('el1'), WebElement)
    assert isinstance(result.get('nested').get('el2'), WebElement)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnWebElementsInsideAListInsideADict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: [document.body]}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get('el1'), list)
    assert isinstance(result.get('el1')[0], WebElement)


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return true")

    assert result is not None
    assert type(result) == bool
    assert bool(result)


def testShouldBeAbleToExecuteSimpleJavascriptAndAStringsArray(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = []
    expectedResult.append("zero")
    expectedResult.append("one")
    expectedResult.append("two")
    result = driver.execute_script(
        "return ['zero', 'one', 'two']")

    assert expectedResult == result


def testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = []
    expectedResult.append("zero")
    subList = []
    subList.append(True)
    subList.append(False)
    expectedResult.append(subList)
    result = driver.execute_script("return ['zero', [true, false]]")
    assert result is not None
    assert type(result) == list
    assert expectedResult == result


def testPassingAndReturningAnIntShouldReturnAWholeNumber(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = 1
    result = driver.execute_script("return arguments[0]", expectedResult)
    assert type(result) == int
    assert expectedResult == result


def testPassingAndReturningADoubleShouldReturnADecimal(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = 1.2
    result = driver.execute_script("return arguments[0]", expectedResult)
    assert type(result) == float
    assert expectedResult == result


def testShouldThrowAnExceptionWhenTheJavascriptIsBad(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(WebDriverException):
        driver.execute_script("return squiggle()")


def testShouldBeAbleToCallFunctionsDefinedOnThePage(driver, pages):
    pages.load("javascriptPage.html")
    driver.execute_script("displayMessage('I like cheese')")
    text = driver.find_element(By.ID, "result").text
    assert "I like cheese" == text.strip()


def testShouldBeAbleToPassAStringAnAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    value = driver.execute_script(
        "return arguments[0] == 'fish' ? 'fish' : 'not fish'", "fish")
    assert "fish" == value


def testShouldBeAbleToPassABooleanAnAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    value = bool(driver.execute_script("return arguments[0] == true", True))
    assert value


def testShouldBeAbleToPassANumberAnAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    value = bool(driver.execute_script("return arguments[0] == 1 ? true : false", 1))
    assert value


def testShouldBeAbleToPassAWebElementAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "plainButton")
    value = driver.execute_script(
        "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']",
        button)
    assert "plainButton" == value


def testShouldBeAbleToPassAnArrayAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    array = ["zero", 1, True, 3.14159]
    length = int(driver.execute_script("return arguments[0].length", array))
    assert len(array) == length


def testShouldBeAbleToPassACollectionAsArgument(driver, pages):
    pages.load("javascriptPage.html")
    collection = []
    collection.append("Cheddar")
    collection.append("Brie")
    collection.append(7)
    length = int(driver.execute_script("return arguments[0].length", collection))
    assert len(collection) == length

    collection = []
    collection.append("Gouda")
    collection.append("Stilton")
    collection.append("Stilton")
    collection.append(True)
    length = int(driver.execute_script("return arguments[0].length", collection))
    assert len(collection) == length


def testShouldThrowAnExceptionIfAnArgumentIsNotValid(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(Exception):
        driver.execute_script("return arguments[0]", driver)


def testShouldBeAbleToPassInMoreThanOneArgument(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.execute_script("return arguments[0] + arguments[1]", "one", "two")
    assert "onetwo" == result


def testJavascriptStringHandlingShouldWorkAsExpected(driver, pages):
    pages.load("javascriptPage.html")
    value = driver.execute_script("return ''")
    assert "" == value

    value = driver.execute_script("return undefined")
    assert value is None

    value = driver.execute_script("return ' '")
    assert " " == value


def testShouldBeAbleToCreateAPersistentValue(driver, pages):
    pages.load("formPage.html")
    driver.execute_script("document.alerts = []")
    driver.execute_script("document.alerts.push('hello world')")
    text = driver.execute_script("return document.alerts.shift()")
    assert "hello world" == text


def testCanPassADictionaryAsAParameter(driver, pages):
    pages.load("simpleTest.html")
    nums = [1, 2]
    args = {"bar": "test", "foo": nums}
    res = driver.execute_script("return arguments[0]['foo'][1]", args)
    assert 2 == res


def testCanPassANone(driver, pages):
    pages.load("simpleTest.html")
    res = driver.execute_script("return arguments[0] === null", None)
    assert res


def test_can_return_a_const(driver, pages):
    pages.load("simpleTest.html")
    res = driver.execute_script("const cheese='cheese'; return cheese")
    assert res == "cheese"


def test_can_return_a_const_in_a_page(driver, pages):
    pages.load("const_js.html")
    res = driver.execute_script("return makeMeA('sandwich');")
    assert res == "cheese sandwich"


@pytest.mark.xfail_remote
@pytest.mark.xfail_firefox
def test_can_return_global_const(driver, pages):
    pages.load("const_js.html")
    # cheese is a variable with "cheese" in it
    res = driver.execute_script("return cheese")
    assert res == "cheese"
