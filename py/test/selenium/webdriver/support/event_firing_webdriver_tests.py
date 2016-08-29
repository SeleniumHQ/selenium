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
try:
    from io import BytesIO
except ImportError:
    from cStringIO import StringIO as BytesIO

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.events import EventFiringWebDriver, AbstractEventListener


class EventFiringWebDriverTests(unittest.TestCase):

    def setup_method(self, method):
        self.log = BytesIO()

    def test_should_fire_navigation_events(self):
        log = self.log

        class TestListener(AbstractEventListener):

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

        ef_driver = EventFiringWebDriver(self.driver, TestListener())
        ef_driver.get(self._pageURL("formPage"))
        ef_driver.find_element(by=By.ID, value="imageButton").submit()
        self.assertEqual(ef_driver.title, "We Arrive Here")

        ef_driver.back()
        self.assertEqual(ef_driver.title, "We Leave From Here")

        ef_driver.forward()
        self.assertEqual(ef_driver.title, "We Arrive Here")

        self.assertEqual(
            b"before_navigate_to formPage.html"
            b"after_navigate_to formPage.html"
            b"before_navigate_back"
            b"after_navigate_back"
            b"before_navigate_forward"
            b"after_navigate_forward", log.getvalue())

    def test_should_fire_click_event(self):
        log = self.log

        class TestListener(AbstractEventListener):

            def before_click(self, element, driver):
                log.write(b"before_click")

            def after_click(self, element, driver):
                log.write(b"after_click")

        ef_driver = EventFiringWebDriver(self.driver, TestListener())
        ef_driver.get(self._pageURL("clicks"))
        ef_driver.find_element(By.ID, "overflowLink").click()
        self.assertEqual(ef_driver.title, "XHTML Test Page")

        self.assertEqual(b"before_click" + b"after_click", log.getvalue())

    def test_should_fire_change_value_event(self):
        log = self.log

        class TestListener(AbstractEventListener):

            def before_change_value_of(self, element, driver):
                log.write(b"before_change_value_of")

            def after_change_value_of(self, element, driver):
                log.write(b"after_change_value_of")

        ef_driver = EventFiringWebDriver(self.driver, TestListener())
        ef_driver.get(self._pageURL("readOnlyPage"))
        element = ef_driver.find_element_by_id("writableTextInput")
        element.clear()
        self.assertEqual("", element.get_attribute("value"))

        ef_driver.get(self._pageURL("javascriptPage"))
        keyReporter = ef_driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("abc def")
        self.assertEqual(keyReporter.get_attribute("value"), "abc def")

        self.assertEqual(
            b"before_change_value_of"
            b"after_change_value_of"
            b"before_change_value_of"
            b"after_change_value_of", log.getvalue())

    def test_should_fire_find_event(self):
        log = self.log

        class TestListener(AbstractEventListener):

            def before_find(self, by, value, driver):
                log.write(("before_find by %s %s" % (by, value)).encode())

            def after_find(self, by, value, driver):
                log.write(("after_find by %s %s" % (by, value)).encode())

        ef_driver = EventFiringWebDriver(self.driver, TestListener())
        ef_driver.get(self._pageURL("simpleTest"))
        e = ef_driver.find_element_by_id("oneline")
        self.assertEqual("A single line of text", e.text)

        e = ef_driver.find_element_by_xpath("/html/body/p[1]")
        self.assertEqual("A single line of text", e.text)

        ef_driver.get(self._pageURL("frameset"))
        elements = ef_driver.find_elements_by_css_selector("frame#sixth")
        self.assertEqual(1, len(elements))
        self.assertEqual("frame", elements[0].tag_name.lower())
        self.assertEqual("sixth", elements[0].get_attribute("id"))

        self.assertEqual(
            b"before_find by id oneline"
            b"after_find by id oneline"
            b"before_find by xpath /html/body/p[1]"
            b"after_find by xpath /html/body/p[1]"
            b"before_find by css selector frame#sixth"
            b"after_find by css selector frame#sixth", log.getvalue())

    def test_should_call_listener_when_an_exception_is_thrown(self):
        log = self.log

        class TestListener(AbstractEventListener):
            def on_exception(self, exception, driver):
                if isinstance(exception, NoSuchElementException):
                    log.write(b"NoSuchElementException is thrown")

        ef_driver = EventFiringWebDriver(self.driver, TestListener())
        ef_driver.get(self._pageURL("simpleTest"))
        try:
            ef_driver.find_element(By.ID, "foo")
            self.fail("Expected exception to be propagated")
        except NoSuchElementException:
            pass
        self.assertEqual(b"NoSuchElementException is thrown", log.getvalue())

    def test_should_unwrap_element_args_when_calling_scripts(self):
        ef_driver = EventFiringWebDriver(self.driver, AbstractEventListener())
        ef_driver.get(self._pageURL("javascriptPage"))
        button = ef_driver.find_element_by_id("plainButton")
        value = ef_driver.execute_script(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']",
            button)
        self.assertEqual("plainButton", value)

    def test_should_unwrap_element_args_when_switching_frames(self):
        ef_driver = EventFiringWebDriver(self.driver, AbstractEventListener())
        ef_driver.get(self._pageURL("iframes"))
        frame = ef_driver.find_element_by_id("iframe1")
        ef_driver.switch_to.frame(frame)
        self.assertEqual("click me!", ef_driver.find_element_by_id("imageButton").get_attribute("alt"))

    def test_should_be_able_to_access_wrapped_instance_from_event_calls(self):
        driver = self.driver

        class TestListener(AbstractEventListener):
            def before_navigate_to(self, url, d):
                assert driver is d

        ef_driver = EventFiringWebDriver(driver, TestListener())
        wrapped_driver = ef_driver.wrapped_driver
        assert driver is wrapped_driver

        ef_driver.get(self._pageURL("simpleTest"))

    def teardown_method(self, method):
            self.log.close()

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')
