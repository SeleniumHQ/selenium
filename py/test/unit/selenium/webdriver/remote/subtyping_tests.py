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


from selenium.webdriver.remote.webdriver import WebElement
from selenium.webdriver.remote.webdriver import WebDriver


def test_web_element_not_subclassed():
    """A registered subtype of WebElement should work with isinstance checks."""
    class MyWebElement:
        def __init__(self, parent, id, _w3c=True):
            self.parent = parent
            self.id = id
            self._w3c = _w3c

    # Test that non registered class instance is not instance of Remote WebElement
    my_web_element = MyWebElement('parent', '1')
    assert not isinstance(my_web_element, WebElement)

    # Register the class as a subtype of WebElement
    WebElement.register(MyWebElement)
    my_registered_web_element = MyWebElement('parent', '2')

    assert isinstance(my_registered_web_element, WebElement)


def test_webdriver_not_subclassed():
    """A registered subtype of WebDriver should work with isinstance checks."""
    class MyWebDriver:
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

    # Test that non registered class instance is not instance of Remote WebDriver
    my_driver = MyWebDriver()
    assert not isinstance(my_driver, WebDriver)

    # Register the class as a subtype of WebDriver
    WebDriver.register(MyWebDriver)
    my_registered_driver = MyWebDriver()

    assert isinstance(my_registered_driver, MyWebDriver)
