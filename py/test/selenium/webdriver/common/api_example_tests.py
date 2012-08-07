#!/usr/bin/python

# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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


import pytest
import time
import unittest

from selenium.common.exceptions import NoSuchElementException


def not_available_on_remote(func):
    def testMethod(self):
        print self.driver
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod


class ApiExampleTest (unittest.TestCase):
    def testGetTitle(self):
        self._loadSimplePage()
        title = self.driver.title
        self.assertEquals("Hello WebDriver", title)

    def testGetCurrentUrl(self):
        self._loadSimplePage()
        url = self.driver.current_url
        self.assertEquals("http://localhost:%d/simpleTest.html" % self.webserver.port, url)

    def testFindElementsByXPath(self):
        self._loadSimplePage()
        elem = self.driver.find_element_by_xpath("//h1")
        self.assertEquals("Heading", elem.text)

    def testFindElementByXpathThrowNoSuchElementException(self):
        self._loadSimplePage()
        try:
            self.driver.find_element_by_xpath("//h4")
        except NoSuchElementException:
            pass

    def testFindElementsByXpath(self):
        self._loadPage("nestedElements")
        elems = self.driver.find_elements_by_xpath("//option")
        self.assertEquals(48, len(elems))
        self.assertEquals("One", elems[0].get_attribute("value"))

    def testFindElementsByName(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_name("windowOne")
        self.assertEquals("Open new window", elem.text)

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

    def testFindElementByXpathInElementContextNotFound(self):
        self._loadPage("nestedElements")
        elem = self.driver.find_element_by_name("form2")
        try:
            elem.find_element_by_xpath("div")
            self.fail()
        except NoSuchElementException:
            pass

    def testShouldBeAbleToEnterDataIntoFormFields(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
        elem.clear()
        elem.send_keys("some text")
        elem = self.driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
        self.assertEquals("some text", elem.get_attribute("value"))

    def testFindElementByTagName(self):
        self._loadPage("simpleTest")
        elems = self.driver.find_elements_by_tag_name("div")
        num_by_xpath = len(self.driver.find_elements_by_xpath("//div"))
        self.assertEquals(num_by_xpath, len(elems))
        elems = self.driver.find_elements_by_tag_name("iframe")
        self.assertEquals(0, len(elems))

    def testFindElementByTagNameWithinElement(self):
        self._loadPage("simpleTest")
        div = self.driver.find_element_by_id("multiline")
        elems = div.find_elements_by_tag_name("p")
        self.assertTrue(len(elems) == 1)

    def testSwitchToWindow(self):
        title_1 = "XHTML Test Page"
        title_2 = "We Arrive Here"
        self._loadPage("xhtmlTest")
        self.driver.find_element_by_link_text("Open new window").click()
        self.assertEquals(title_1, self.driver.title)
        try:
            self.driver.switch_to_window("result")
        except:
            # This may fail because the window is not loading fast enough, so try again
            time.sleep(1)
            self.driver.switch_to_window("result")
        self.assertEquals(title_2, self.driver.title)

    def testSwitchFrameByName(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame("third")
        checkbox = self.driver.find_element_by_id("checky")
        checkbox.click()
        checkbox.submit()

    def testIsEnabled(self):
        self._loadPage("formPage")
        elem = self.driver.find_element_by_xpath("//input[@id='working']")
        self.assertTrue(elem.is_enabled())
        elem = self.driver.find_element_by_xpath("//input[@id='notWorking']")
        self.assertFalse(elem.is_enabled())

    def testIsSelectedAndToggle(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")
        elem = self.driver.find_element_by_id("multi")
        option_elems = elem.find_elements_by_xpath("option")
        self.assertTrue(option_elems[0].is_selected())
        option_elems[0].click()
        self.assertFalse(option_elems[0].is_selected())
        option_elems[0].click()
        self.assertTrue(option_elems[0].is_selected())
        self.assertTrue(option_elems[2].is_selected())

    def testNavigate(self):
        self._loadPage("formPage")
        self.driver.find_element_by_id("imageButton").submit()
        self.assertEquals("We Arrive Here", self.driver.title)
        self.driver.back()
        self.assertEquals("We Leave From Here", self.driver.title)
        self.driver.forward()
        self.assertEquals("We Arrive Here", self.driver.title)

    def testGetAttribute(self):
        page = "xhtmlTest"
        self._loadPage(page)
        elem = self.driver.find_element_by_id("id1")
        attr = elem.get_attribute("href")
        self.assertEquals("http://localhost:%d/xhtmlTest.html#" % self.webserver.port, attr)

    def testGetImplicitAttribute(self):
        self._loadPage("nestedElements")
        elems = self.driver.find_elements_by_xpath("//option")
        self.assert_(len(elems) >= 3)
        for i, elem in enumerate(elems[:3]):
            self.assertEquals(i, int(elem.get_attribute("index")))

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

    def testExecuteScriptWithMultipleArgs(self):
        self._loadPage("xhtmlTest")
        result = self.driver.execute_script(
            "return arguments[0] + arguments[1]", 1, 2)
        self.assertEquals(3, result)

    def testExecuteScriptWithElementArgs(self):
        self._loadPage("javascriptPage")
        button = self.driver.find_element_by_id("plainButton")
        result = self.driver.execute_script("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button)
        self.assertEquals("plainButton", result)

    def testFindElementsByPartialLinkText(self):
        self._loadPage("xhtmlTest")
        elem = self.driver.find_element_by_partial_link_text("new window")
        elem.click()

    def testIsElementDisplayed(self):
        self._loadPage("javascriptPage")
        visible = self.driver.find_element_by_id("displayed").is_displayed()
        not_visible = self.driver.find_element_by_id("hidden").is_displayed()
        self.assertTrue(visible, "Should be visible")
        self.assertFalse(not_visible, "Should not be visible")

    def testMoveWindowPosition(self):
        self._loadPage("blank")
        loc = self.driver.get_window_position()
        # note can't test 0,0 since some OS's dont allow that location
        # because of system toolbars
        newLoc = [50,50]
        if loc['x'] == 50:
            newLoc[0] = 60
        if loc['y'] == 50:
            newLoc[1] = 60
        self.driver.set_window_position(newLoc[0], newLoc[1])
        loc = self.driver.get_window_position()
        self.assertEquals(loc['x'], newLoc[0])
        self.assertEquals(loc['y'], newLoc[1])

    def testChangeWindowSize(self):
        self._loadPage("blank")
        size = self.driver.get_window_size()
        newSize = [600,600]
        if size['width'] == 600:
            newSize[0] = 500
        if size['height'] == 600:
            newSize[1] = 500
        self.driver.set_window_size(newSize[0], newSize[1])
        size = self.driver.get_window_size()
        self.assertEquals(size['width'], newSize[0])
        self.assertEquals(size['height'], newSize[1])

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

