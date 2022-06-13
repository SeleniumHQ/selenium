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

from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement


@pytest.fixture(autouse=True)
def reset_timeouts(driver):
    driver.set_script_timeout(5)
    yield
    driver.set_script_timeout(30)


def test_should_not_timeout_if_callback_invoked_immediately(driver, pages):
    pages.load("ajaxy_page.html")
    result = driver.execute_async_script("arguments[arguments.length - 1](123);")
    assert type(result) == int
    assert 123 == result


def test_should_be_able_to_return_javascript_primitives_from_async_scripts_neither_none_nor_undefined(driver, pages):
    pages.load("ajaxy_page.html")
    assert 123 == driver.execute_async_script("arguments[arguments.length - 1](123);")
    assert "abc" == driver.execute_async_script("arguments[arguments.length - 1]('abc');")
    assert not bool(driver.execute_async_script("arguments[arguments.length - 1](false);"))
    assert bool(driver.execute_async_script("arguments[arguments.length - 1](true);"))


def test_should_be_able_to_return_javascript_primitives_from_async_scripts_null_and_undefined(driver, pages):
    pages.load("ajaxy_page.html")
    assert driver.execute_async_script("arguments[arguments.length - 1](null)") is None
    assert driver.execute_async_script("arguments[arguments.length - 1]()") is None


def test_should_be_able_to_return_an_array_literal_from_an_async_script(driver, pages):
    pages.load("ajaxy_page.html")
    result = driver.execute_async_script("arguments[arguments.length - 1]([]);")
    assert "Expected not to be null!", result is not None
    assert type(result) == list
    assert len(result) == 0


def test_should_be_able_to_return_an_array_object_from_an_async_script(driver, pages):
    pages.load("ajaxy_page.html")
    result = driver.execute_async_script("arguments[arguments.length - 1](new Array());")
    assert "Expected not to be null!", result is not None
    assert type(result) == list
    assert len(result) == 0


def test_should_be_able_to_return_arrays_of_primitives_from_async_scripts(driver, pages):
    pages.load("ajaxy_page.html")

    result = driver.execute_async_script(
        "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);")

    assert result is not None
    assert type(result) == list
    assert not bool(result.pop())
    assert bool(result.pop())
    assert "abc" == result.pop()
    assert 123 == result.pop()
    assert result.pop() is None
    assert len(result) == 0


def test_should_be_able_to_return_web_elements_from_async_scripts(driver, pages):
    pages.load("ajaxy_page.html")

    result = driver.execute_async_script("arguments[arguments.length - 1](document.body);")
    assert isinstance(result, WebElement)
    assert "body" == result.tag_name.lower()


@pytest.mark.xfail_safari
def test_should_be_able_to_return_arrays_of_web_elements_from_async_scripts(driver, pages):
    pages.load("ajaxy_page.html")

    result = driver.execute_async_script(
        "arguments[arguments.length - 1]([document.body, document.body]);")
    assert result is not None
    assert type(result) == list

    list_ = result
    assert 2 == len(list_)
    assert isinstance(list_[0], WebElement)
    assert isinstance(list_[1], WebElement)
    assert "body" == list_[0].tag_name
    # assert list_[0] == list_[1]


def test_should_timeout_if_script_does_not_invoke_callback(driver, pages):
    pages.load("ajaxy_page.html")
    with pytest.raises(TimeoutException):
        # Script is expected to be async and explicitly callback, so this should timeout.
        driver.execute_async_script("return 1 + 2;")


def test_should_timeout_if_script_does_not_invoke_callback_with_azero_timeout(driver, pages):
    pages.load("ajaxy_page.html")
    with pytest.raises(TimeoutException):
        driver.execute_async_script("window.setTimeout(function() {}, 0);")


def test_should_not_timeout_if_script_callsback_inside_azero_timeout(driver, pages):
    pages.load("ajaxy_page.html")
    driver.execute_async_script(
        """var callback = arguments[arguments.length - 1];
        window.setTimeout(function() { callback(123); }, 0)""")


def test_should_timeout_if_script_does_not_invoke_callback_with_long_timeout(driver, pages):
    driver.set_script_timeout(0.5)
    pages.load("ajaxy_page.html")
    with pytest.raises(TimeoutException):
        driver.execute_async_script(
            """var callback = arguments[arguments.length - 1];
            window.setTimeout(callback, 1500);""")


def test_should_detect_page_loads_while_waiting_on_an_async_script_and_return_an_error(driver, pages):
    pages.load("ajaxy_page.html")
    driver.set_script_timeout(0.1)
    with pytest.raises(WebDriverException):
        url = pages.url("dynamic.html")
        driver.execute_async_script(f"window.location = '{url}';")


def test_should_catch_errors_when_executing_initial_script(driver, pages):
    pages.load("ajaxy_page.html")
    with pytest.raises(WebDriverException):
        driver.execute_async_script("throw Error('you should catch this!');")


def test_should_be_able_to_execute_asynchronous_scripts(driver, pages):
    pages.load("ajaxy_page.html")

    typer = driver.find_element(by=By.NAME, value="typer")
    typer.send_keys("bob")
    assert "bob" == typer.get_attribute("value")

    driver.find_element(by=By.ID, value="red").click()
    driver.find_element(by=By.NAME, value="submit").click()

    assert 1 == len(driver.find_elements(by=By.TAG_NAME, value='div')), \
        "There should only be 1 DIV at this point, which is used for the butter message"
    driver.set_script_timeout(10)
    text = driver.execute_async_script(
        """var callback = arguments[arguments.length - 1];
        window.registerListener(arguments[arguments.length - 1]);""")
    assert "bob" == text
    assert "" == typer.get_attribute("value")

    assert 2 == len(driver.find_elements(by=By.TAG_NAME, value='div')), \
        "There should be 1 DIV (for the butter message) + 1 DIV (for the new label)"


def test_should_be_able_to_pass_multiple_arguments_to_async_scripts(driver, pages):
    pages.load("ajaxy_page.html")
    result = driver.execute_async_script("""
        arguments[arguments.length - 1](arguments[0] + arguments[1]);""", 1, 2)
    assert 3 == result

# TODO DavidBurns Disabled till Java WebServer is used
# def test_should_be_able_to_make_xmlhttp_requests_and_wait_for_the_response(driver, pages):
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
#    pages.load("ajaxy_page.html")
#    driver.set_script_timeout(3)
#    response = driver.execute_async_script(script, pages.sleepingPage + "?time=2")
#    htm = "<html><head><title>Done</title></head><body>Slept for 2s</body></html>"
#    assert response.strip() == htm
