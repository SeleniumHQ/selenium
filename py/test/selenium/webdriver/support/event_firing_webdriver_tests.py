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

try:
    from io import BytesIO
except ImportError:
    from cStringIO import StringIO as BytesIO

import pytest

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.events import EventFiringWebDriver, AbstractEventListener
from selenium.webdriver.support.ui import WebDriverWait


@pytest.fixture
def log():
    log = BytesIO()
    yield log
    log.close()


def test_should_fire_navigation_events(driver, log, pages):

    class EventListener(AbstractEventListener):

        def before_navigate_to(self, url, driver):
            log.write(("before_navigate_to %s" % url.split("/")[-1]).encode())

        def after_navigate_to(self, url, driver):
            log.write(("after_navigate_to %s" % url.split("/")[-1]).encode())

        def before_navigate_back(self, driver):
            log.write(b"before_navigate_back")

        def after_navigate_back(self, driver):
            log.write(b"after_navigate_back")

        def before_navigate_forward(self, driver):
            log.write(b"before_navigate_forward")

        def after_navigate_forward(self, driver):
            log.write(b"after_navigate_forward")

    ef_driver = EventFiringWebDriver(driver, EventListener())
    ef_driver.get(pages.url("formPage.html"))
    ef_driver.find_element(by=By.ID, value="imageButton").submit()
    WebDriverWait(ef_driver, 5).until(lambda d: d.title == "We Arrive Here")
    assert ef_driver.title == "We Arrive Here"

    ef_driver.back()
    assert ef_driver.title == "We Leave From Here"

    ef_driver.forward()
    assert ef_driver.title == "We Arrive Here"

    assert (b"before_navigate_to formPage.html"
            b"after_navigate_to formPage.html"
            b"before_navigate_back"
            b"after_navigate_back"
            b"before_navigate_forward"
            b"after_navigate_forward") == log.getvalue()


def test_should_fire_click_event(driver, log, pages):

    class EventListener(AbstractEventListener):

        def before_click(self, element, driver):
            log.write(b"before_click")

        def after_click(self, element, driver):
            log.write(b"after_click")

    ef_driver = EventFiringWebDriver(driver, EventListener())
    ef_driver.get(pages.url("clicks.html"))
    ef_driver.find_element(By.ID, "overflowLink").click()
    assert ef_driver.title == "XHTML Test Page"

    assert b"before_click" + b"after_click" == log.getvalue()


def test_should_fire_change_value_event(driver, log, pages):

    class EventListener(AbstractEventListener):

        def before_change_value_of(self, element, driver):
            log.write(b"before_change_value_of")

        def after_change_value_of(self, element, driver):
            log.write(b"after_change_value_of")

    ef_driver = EventFiringWebDriver(driver, EventListener())
    ef_driver.get(pages.url("readOnlyPage.html"))
    element = ef_driver.find_element_by_id("writableTextInput")
    element.clear()
    assert "" == element.get_attribute("value")

    ef_driver.get(pages.url("javascriptPage.html"))
    keyReporter = ef_driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("abc def")
    assert keyReporter.get_attribute("value") == "abc def"

    assert (b"before_change_value_of"
            b"after_change_value_of"
            b"before_change_value_of"
            b"after_change_value_of") == log.getvalue()


def test_should_fire_find_event(driver, log, pages):

    class EventListener(AbstractEventListener):

        def before_find(self, by, value, driver):
            log.write(("before_find by %s %s" % (by, value)).encode())

        def after_find(self, by, value, driver):
            log.write(("after_find by %s %s" % (by, value)).encode())

    ef_driver = EventFiringWebDriver(driver, EventListener())
    ef_driver.get(pages.url("simpleTest.html"))
    e = ef_driver.find_element_by_id("oneline")
    assert "A single line of text" == e.text

    e = ef_driver.find_element_by_xpath("/html/body/p[1]")
    assert "A single line of text" == e.text

    ef_driver.get(pages.url("frameset.html"))
    elements = ef_driver.find_elements_by_css_selector("frame#sixth")
    assert 1 == len(elements)
    assert "frame" == elements[0].tag_name.lower()
    assert "sixth" == elements[0].get_attribute("id")

    assert (b"before_find by id oneline"
            b"after_find by id oneline"
            b"before_find by xpath /html/body/p[1]"
            b"after_find by xpath /html/body/p[1]"
            b"before_find by css selector frame#sixth"
            b"after_find by css selector frame#sixth") == log.getvalue()


def test_should_call_listener_when_an_exception_is_thrown(driver, log, pages):

    class EventListener(AbstractEventListener):
        def on_exception(self, exception, driver):
            if isinstance(exception, NoSuchElementException):
                log.write(b"NoSuchElementException is thrown")

    ef_driver = EventFiringWebDriver(driver, EventListener())
    ef_driver.get(pages.url("simpleTest.html"))
    with pytest.raises(NoSuchElementException):
        ef_driver.find_element(By.ID, "foo")
    assert b"NoSuchElementException is thrown" == log.getvalue()


def test_should_unwrap_element_args_when_calling_scripts(driver, log, pages):
    ef_driver = EventFiringWebDriver(driver, AbstractEventListener())
    ef_driver.get(pages.url("javascriptPage.html"))
    button = ef_driver.find_element_by_id("plainButton")
    value = ef_driver.execute_script(
        "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']",
        button)
    assert "plainButton" == value


def test_should_unwrap_element_args_when_switching_frames(driver, log, pages):
    ef_driver = EventFiringWebDriver(driver, AbstractEventListener())
    ef_driver.get(pages.url("iframes.html"))
    frame = ef_driver.find_element_by_id("iframe1")
    ef_driver.switch_to.frame(frame)
    assert "click me!" == ef_driver.find_element_by_id("imageButton").get_attribute("alt")


def test_should_be_able_to_access_wrapped_instance_from_event_calls(driver):

    class EventListener(AbstractEventListener):
        def before_navigate_to(url, d):
            assert driver is d

    ef_driver = EventFiringWebDriver(driver, EventListener())
    wrapped_driver = ef_driver.wrapped_driver
    assert driver is wrapped_driver


def test_using_kwargs(driver, pages):
    ef_driver = EventFiringWebDriver(driver, AbstractEventListener())
    ef_driver.get(pages.url("javascriptPage.html"))
    ef_driver.get_cookie(name="cookie_name")
    element = ef_driver.find_element_by_id("plainButton")
    element.get_attribute(name="id")


def test_missing_attributes_raise_error(driver, pages):
    ef_driver = EventFiringWebDriver(driver, AbstractEventListener())

    with pytest.raises(AttributeError):
        ef_driver.attribute_should_not_exist

    ef_driver.get(pages.url("readOnlyPage.html"))
    element = ef_driver.find_element_by_id("writableTextInput")

    with pytest.raises(AttributeError):
        element.attribute_should_not_exist
