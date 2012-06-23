#!/usr/bin/python

# Copyright 2011 Software Freedom Conservancy.
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

import unittest
from cStringIO import StringIO

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.events import EventFiringWebDriver, \
                                                    AbstractEventListener
                                                    

class EventFiringWebDriverTests(unittest.TestCase):

    def setup_method(self, method):
        self.log = StringIO()
        
    def test_should_fire_navigation_events(self):
        log = self.log 
                
        class TestListener(AbstractEventListener):
            def before_navigate_to(self, url, driver):
                log.write("before_navigate_to %s" % url.split("/")[-1])                                
            def after_navigate_to(self, url, driver):
                log.write("after_navigate_to %s" % url.split("/")[-1])                
            def before_navigate_back(self, driver):
                log.write("before_navigate_back")            
            def after_navigate_back(self, driver):
                log.write("after_navigate_back")            
            def before_navigate_forward(self, driver):
                log.write("before_navigate_forward")            
            def after_navigate_forward(self, driver):
                log.write("after_navigate_forward")
            
        ef_driver = EventFiringWebDriver(self.driver, TestListener())            
        ef_driver.get(self._pageURL("formPage"))
        ef_driver.find_element(by=By.ID, value="imageButton").submit()
        self.assertEqual(ef_driver.title, "We Arrive Here")

        ef_driver.back()
        self.assertEqual(ef_driver.title, "We Leave From Here")

        ef_driver.forward()
        self.assertEqual(ef_driver.title, "We Arrive Here")        
       
        self.assertEqual("before_navigate_to formPage.html" \
                + "after_navigate_to formPage.html" \
                + "before_navigate_back" \
                + "after_navigate_back" \
                + "before_navigate_forward" \
                + "after_navigate_forward", log.getvalue())        

    def test_should_fire_click_event(self):
        log = self.log
        
        class TestListener(AbstractEventListener):            
            def before_click(self, element, driver):
                log.write("before_click")    
            def after_click(self, element, driver):
                log.write("after_click")
            
        ef_driver = EventFiringWebDriver(self.driver, TestListener())            
        ef_driver.get(self._pageURL("clicks"))        
        ef_driver.find_element(By.ID, "overflowLink").click() 
        self.assertEqual(ef_driver.title, "XHTML Test Page")
        
        self.assertEqual("before_click" + "after_click", log.getvalue())        
        
    def test_should_fire_change_value_event(self):
        log = self.log
        
        class TestListener(AbstractEventListener):            
            def before_change_value_of(self, element, driver):
                log.write("before_change_value_of")    
            def after_change_value_of(self, element, driver):
                log.write("after_change_value_of")
            
        ef_driver = EventFiringWebDriver(self.driver, TestListener())            
        ef_driver.get(self._pageURL("readOnlyPage"))                
        element = ef_driver.find_element_by_id("writableTextInput")
        element.clear()
        self.assertEqual("", element.get_attribute("value"))
        
        ef_driver.get(self._pageURL("javascriptPage"))
        keyReporter = ef_driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("abc def")
        self.assertEqual(keyReporter.get_attribute("value"), "abc def")
        
        self.assertEqual("before_change_value_of" \
                         + "after_change_value_of" \
                         + "before_change_value_of" \
                         + "after_change_value_of", log.getvalue())        

    def test_should_fire_find_event(self):
        log = self.log
        
        class TestListener(AbstractEventListener):            
            def before_find(self, by, value, driver):
                log.write("before_find by %s %s" % (by, value))    
            def after_find(self, by, value, driver):
                log.write("after_find by %s %s" % (by, value))    
            
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
              
        self.assertEqual("before_find by id oneline" \
                         + "after_find by id oneline" \
                         + "before_find by xpath /html/body/p[1]" \
                         + "after_find by xpath /html/body/p[1]" \
                         + "before_find by css selector frame#sixth" \
                         + "after_find by css selector frame#sixth" , log.getvalue())        
    
    def test_should_call_listener_when_an_exception_is_thrown(self):
        log = self.log
        
        class TestListener(AbstractEventListener):            
            def on_exception(self, exception, driver):
                if isinstance(exception, NoSuchElementException):
                    log.write("NoSuchElementException is thrown")
            
        ef_driver = EventFiringWebDriver(self.driver, TestListener())            
        ef_driver.get(self._pageURL("simpleTest"))        
        try:
            ef_driver.find_element(By.ID, "foo") 
            self.fail("Expected exception to be propagated")
        except NoSuchElementException:
            pass        
        self.assertEqual("NoSuchElementException is thrown", log.getvalue())        
        
    def test_should_unwrap_element_args_when_calling_scripts(self):              
        ef_driver = EventFiringWebDriver(self.driver, AbstractEventListener())            
        ef_driver.get(self._pageURL("javascriptPage"))        
        button = ef_driver.find_element_by_id("plainButton")
        value = ef_driver.execute_script(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble']",
            button)
        self.assertEqual("plainButton", value)
        
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
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
