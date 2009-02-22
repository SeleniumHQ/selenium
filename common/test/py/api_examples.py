#!/usr/bin/python

import logging
import re
import time
import sys
import unittest
from webdriver_common.exceptions import *
from webdriver_common.webserver import SimpleWebServer

driver = None

class ApiExampleTest (unittest.TestCase):

    def setUp(self):
        self.driver = driver

    def tearDown(self):
        pass

    def testGetTitle(self):
        self._loadSimplePage()
        title = self.driver.get_title()
        self.assertEquals("Hello WebDriver", title)

    def testGetCurrentUrl(self):
        self._loadSimplePage()
        url = self.driver.get_current_url()
        self.assertEquals("http://localhost:8000/simpleTest.html", url)

    def testFindElementsByXPath(self):
        self._loadSimplePage()
        elem = self.driver.find_element_by_xpath("//h1")
        self.assertEquals("Heading", elem.get_text())
        
    def testFindElementByXpathThrowNoSuchElementException(self):
        self._loadSimplePage()
        try:
            elem = self.driver.find_element_by_xpath("//h4")
        except NoSuchElementException, e:
            pass

    def testFindElementByXpathThrowErrorInResponseExceptionForInvalidXPath(self):
        self._loadSimplePage()
        try:
            elem = self.driver.find_element_by_xpath("//")
        except NoSuchElementException, e:
            self.fail()
        except ErrorInResponseException, e1:
            pass

    def testFindElementsByXpath(self):
        self._loadPage("nestedElements")
        elems = self.driver.find_elements_by_xpath("//option")
        self.assertEquals(48, len(elems))
        self.assertEquals("One", elems[0].get_value())

    def testFindElementsByName(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_name("windowOne")
        self.assertEquals("Open new window", elem.get_text())

    def testFindElementsByNameInElementContext(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("form2")
        sub_elem = elem.find_element_by_name("selectomatic")
        self.assertEquals("2", sub_elem.get_attribute("id"))

    def testFindElementsByLinkTextInElementContext(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("div1")
        sub_elem = elem.find_element_by_link_text("hello world")
        self.assertEquals("link1", sub_elem.get_attribute("name"))

    def testFindElementByIdInElementContext(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("form2")
        sub_elem = elem.find_element_by_id("2")
        self.assertEquals("selectomatic", sub_elem.get_attribute("name"))

    def testFindElementByXpathInElementContext(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("form2")
        sub_elem = elem.find_element_by_xpath("select")
        self.assertEquals("2", sub_elem.get_attribute("id"))

    def testFindElementByXpathInElementContext(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("form2")
        try:
            sub_elem = elem.find_element_by_xpath("div")
            self.fail()
        except NoSuchElementException:
            pass

    def testShouldBeAbleToEnterDataIntoFormFields(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
        elem.clear()
        elem.send_keys("some text")
        elem = self.driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
        self.assertEquals("some text", elem.get_value())

    def testSwitchToWindow(self):
        title_1 = "XHTML Test Page"
        title_2 = "We Arrive Here"
        self._loadPage("xhtmlTest")
        self.driver.find_element_by_link_text("Open new window").click()
        self.assertEquals(title_1, self.driver.get_title())
        try:
            self.driver.SwitchToWindow("result")
        except:
            # This may fail because the window is not loading fast enough, so try again
            time.sleep(1)
            self.driver.switch_to_window("result")
        self.assertEquals(title_2, self.driver.get_title())

    def testSwitchToFrameByIndex(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame(2)
        self.driver.switch_to_frame(0)
        self.driver.switch_to_frame(2)
        checkbox = self.driver.find_element_by_id("checky")
        checkbox.toggle()
        checkbox.submit()
  
    def testSwitchFrameByName(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame("third");
        checkbox = self.driver.find_element_by_id("checky")
        checkbox.toggle()
        checkbox.submit()

    def testGetPageSource(self):
        self._loadSimplePage()
        source = self.driver.get_page_source()
        self.assertTrue(len(re.findall(r'<html>.*</html>', source, re.DOTALL)) > 0)

    def testIsEnabled(self):
        self._loadPage("formPage")
        elem = self.driver.find_element_by_xpath("//input[@id='working']")
        self.assertTrue(elem.is_enabled())
        elem = self.driver.find_element_by_xpath("//input[@id='notWorking']")
        self.assertFalse(elem.is_enabled())

    def testIsSelectedAndToggle(self):
        self._loadPage("formPage")
        elem = self.driver.find_element_by_id("multi")
        option_elems = elem.find_elements_by_xpath("option")
        self.assertTrue(option_elems[0].is_selected())
        option_elems[0].toggle()
        self.assertFalse(option_elems[0].is_selected())
        option_elems[0].toggle()
        self.assertTrue(option_elems[0].is_selected())
        self.assertTrue(option_elems[2].is_selected())

    def testNavigate(self):
        self._loadPage("formPage")
        self.driver.find_element_by_id("imageButton").submit()
        self.assertEquals("We Arrive Here", self.driver.get_title())
        self.driver.back()
        self.assertEquals("We Leave From Here", self.driver.get_title())
        self.driver.forward()
        self.assertEquals("We Arrive Here", self.driver.get_title())

    def testGetAttribute(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_id("id1")
        self.assertEquals("#", elem.get_attribute("href"))

    def testGetImplicitAttribute(self):
        self._loadPage("nestedElements")
        elems = self.driver.find_elements_by_xpath("//option")
        for i in range(3):
            self.assertEquals(i, int(elems[i].get_attribute("index")))

    def testExecuteSimpleScript(self):
        self._loadPage("xhtmlTest")
        title = self.driver.execute_script("return document.title;")
        self.assertEquals("XHTML Test Page", title)

    def testExecuteScriptAndReturnElement(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.execute_script("return document.getElementById('id1');")
        self.assertTrue("WebElement" in str(type(elem)))

    def testExecuteScriptWithArgs(self):
        self._loadPage("xhtmlTest")
        result = self.driver.execute_script("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish")
        self.assertEquals("fish", result)

    def testExecuteScriptWithElementArgs(self):
        self._loadPage("javascriptPage")
        button = self.driver.find_element_by_id("plainButton")
        result = self.driver.execute_script("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button)
        self.assertEquals("plainButton", result)

        
    def _loadSimplePage(self):
        self.driver.get("http://localhost:8000/simpleTest.html")

    def _loadPage(self, name):
        self.driver.get("http://localhost:8000/%s.html" % name)

def run_tests(_driver):
    global driver
    driver = _driver
    logging.basicConfig(level=logging.INFO)
    webserver = SimpleWebServer()
    webserver.start()
    try:
        testLoader = unittest.TestLoader()
        testRunner = unittest.TextTestRunner()
        testRunner.run(testLoader.loadTestsFromTestCase(ApiExampleTest))
        driver.quit()
    finally:
        webserver.stop()
