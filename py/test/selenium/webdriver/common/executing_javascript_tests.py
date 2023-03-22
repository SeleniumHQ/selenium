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


def test_should_be_able_to_execute_simple_javascript_and_return_astring(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.title")

    assert isinstance(result, str), "The type of the result is %s" % type(result)
    assert "XHTML Test Page" == result


def test_should_be_able_to_execute_simple_javascript_and_return_an_integer(driver, pages):
    pages.load("nestedElements.html")
    result = driver.execute_script("return document.getElementsByName('checky').length")

    assert isinstance(result, int)
    assert int(result) > 1


def test_should_be_able_to_execute_simple_javascript_and_return_aweb_element(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.getElementById('id1')")

    assert result is not None
    assert isinstance(result, WebElement)
    assert "a" == result.tag_name.lower()


def test_should_be_able_to_execute_simple_javascript_and_return_alist_of_web_elements(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return document.querySelectorAll('div.navigation a')")

    assert result is not None
    assert isinstance(result, list)
    assert all(isinstance(item, WebElement) for item in result)
    assert all("a" == item.tag_name.lower() for item in result)


def test_should_be_able_to_execute_simple_javascript_and_return_web_elements_inside_alist(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return [document.body]")

    assert result is not None
    assert isinstance(result, list)
    assert isinstance(result[0], WebElement)


def test_should_be_able_to_execute_simple_javascript_and_return_web_elements_inside_anested_list(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return [document.body, [document.getElementById('id1')]]")

    assert result is not None
    assert isinstance(result, list)
    assert isinstance(result[0], WebElement)
    assert isinstance(result[1][0], WebElement)


def test_should_be_able_to_execute_simple_javascript_and_return_web_elements_inside_adict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: document.body}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get("el1"), WebElement)


def test_should_be_able_to_execute_simple_javascript_and_return_web_elements_inside_anested_dict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: document.body, " "nested: {el2: document.getElementById('id1')}}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get("el1"), WebElement)
    assert isinstance(result.get("nested").get("el2"), WebElement)


def test_should_be_able_to_execute_simple_javascript_and_return_web_elements_inside_alist_inside_adict(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return {el1: [document.body]}")

    assert result is not None
    assert isinstance(result, dict)
    assert isinstance(result.get("el1"), list)
    assert isinstance(result.get("el1")[0], WebElement)


def test_should_be_able_to_execute_simple_javascript_and_return_aboolean(driver, pages):
    pages.load("xhtmlTest.html")

    result = driver.execute_script("return true")

    assert result is not None
    assert isinstance(result, bool)
    assert bool(result)


def test_should_be_able_to_execute_simple_javascript_and_astrings_array(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = []
    expectedResult.append("zero")
    expectedResult.append("one")
    expectedResult.append("two")
    result = driver.execute_script("return ['zero', 'one', 'two']")

    assert expectedResult == result


def test_should_be_able_to_execute_simple_javascript_and_return_an_array(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = []
    expectedResult.append("zero")
    subList = []
    subList.append(True)
    subList.append(False)
    expectedResult.append(subList)
    result = driver.execute_script("return ['zero', [true, false]]")
    assert result is not None
    assert isinstance(result, list)
    assert expectedResult == result


def test_passing_and_returning_an_int_should_return_awhole_number(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = 1
    result = driver.execute_script("return arguments[0]", expectedResult)
    assert isinstance(result, int)
    assert expectedResult == result


def test_passing_and_returning_adouble_should_return_adecimal(driver, pages):
    pages.load("javascriptPage.html")
    expectedResult = 1.2
    result = driver.execute_script("return arguments[0]", expectedResult)
    assert isinstance(result, float)
    assert expectedResult == result


def test_should_throw_an_exception_when_the_javascript_is_bad(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(WebDriverException):
        driver.execute_script("return squiggle()")


def test_should_be_able_to_call_functions_defined_on_the_page(driver, pages):
    pages.load("javascriptPage.html")
    driver.execute_script("displayMessage('I like cheese')")
    text = driver.find_element(By.ID, "result").text
    assert "I like cheese" == text.strip()


def test_should_be_able_to_pass_astring_an_as_argument(driver, pages):
    pages.load("javascriptPage.html")
    value = driver.execute_script("return arguments[0] == 'fish' ? 'fish' : 'not fish'", "fish")
    assert "fish" == value


def test_should_be_able_to_pass_aboolean_an_as_argument(driver, pages):
    pages.load("javascriptPage.html")
    value = bool(driver.execute_script("return arguments[0] == true", True))
    assert value


def test_should_be_able_to_pass_anumber_an_as_argument(driver, pages):
    pages.load("javascriptPage.html")
    value = bool(driver.execute_script("return arguments[0] == 1 ? true : false", 1))
    assert value


def test_should_be_able_to_pass_aweb_element_as_argument(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "plainButton")
    value = driver.execute_script(
        "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']", button
    )
    assert "plainButton" == value


def test_should_be_able_to_pass_an_array_as_argument(driver, pages):
    pages.load("javascriptPage.html")
    array = ["zero", 1, True, 3.14159]
    length = int(driver.execute_script("return arguments[0].length", array))
    assert len(array) == length


def test_should_be_able_to_pass_acollection_as_argument(driver, pages):
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


def test_should_throw_an_exception_if_an_argument_is_not_valid(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(Exception):
        driver.execute_script("return arguments[0]", driver)


def test_should_be_able_to_pass_in_more_than_one_argument(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.execute_script("return arguments[0] + arguments[1]", "one", "two")
    assert "onetwo" == result


def test_javascript_string_handling_should_work_as_expected(driver, pages):
    pages.load("javascriptPage.html")
    value = driver.execute_script("return ''")
    assert "" == value

    value = driver.execute_script("return undefined")
    assert value is None

    value = driver.execute_script("return ' '")
    assert " " == value


def test_should_be_able_to_create_apersistent_value(driver, pages):
    pages.load("formPage.html")
    driver.execute_script("document.alerts = []")
    driver.execute_script("document.alerts.push('hello world')")
    text = driver.execute_script("return document.alerts.shift()")
    assert "hello world" == text


def test_can_pass_adictionary_as_aparameter(driver, pages):
    pages.load("simpleTest.html")
    nums = [1, 2]
    args = {"bar": "test", "foo": nums}
    res = driver.execute_script("return arguments[0]['foo'][1]", args)
    assert 2 == res


def test_can_pass_anone(driver, pages):
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
