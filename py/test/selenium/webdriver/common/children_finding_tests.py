#!/usr/bin/python

# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
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
from selenium.common.exceptions import NoSuchElementException


class ChildrenFindingTests(unittest.TestCase):

    def testShouldFindElementByXPath(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        child = element.find_element_by_xpath("select")
        self.assertEqual(child.get_attribute("id"), "2")

    def testShouldNotFindElementByXPath(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        try:
            element.find_element_by_xpath("select/x")
            self.fail("Expected NoSuchElementException to have been thrown")
        except NoSuchElementException, e:
            pass
        except Exception, e:
            self.fail("Expected NoSuchElementException to have been thrown but got " + str(e))

    def testFindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements(self):
        self._loadSimplePage()
        parent = self.driver.find_element_by_id("multiline")
        children = parent.find_elements_by_xpath("./p")
        self.assertEqual(1, len(children))
        self.assertEqual("A div containing", children[0].text)

    def testShouldFindElementsByXpath(self): 
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        children = element.find_elements_by_xpath("select/option")
        self.assertEqual(len(children), 8);
        self.assertEqual(children[0].text, "One")
        self.assertEqual(children[1].text, "Two")

    def testShouldNotFindElementsByXpath(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        children = element.find_elements_by_xpath("select/x")
        self.assertEqual(len(children), 0)

    def testFindingElementsOnElementByXPathShouldFindTopLevelElements(self):
        self._loadSimplePage()
        parent = self.driver.find_element_by_id("multiline")
        allParaElements = self.driver.find_elements_by_xpath("//p")
        children = parent.find_elements_by_xpath("//p")
        self.assertEqual(len(allParaElements), len(children))

    def testShouldFindElementByName(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        child = element.find_element_by_name("selectomatic")
        self.assertEqual(child.get_attribute("id"), "2")

    def testShouldFindElementsByName(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        children = element.find_elements_by_name("selectomatic")
        self.assertEqual(len(children), 2)

    def testShouldFindElementById(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        child = element.find_element_by_id("2")
        self.assertEqual(child.get_attribute("name"), "selectomatic")

    def testShouldFindElementsById(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("form2")
        child = element.find_elements_by_id("2")
        self.assertEqual(len(child), 2)

    def testShouldFindElementByIdWhenMultipleMatchesExist(self):
        self._loadPage("nestedElements")    
        element = self.driver.find_element_by_id("test_id_div")
        child = element.find_element_by_id("test_id")
        self.assertEqual(child.text, "inside")
    
    def testShouldFindElementByIdWhenNoMatchInContext(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_id("test_id_div")
        try:
            element.find_element_by_id("test_id_out")
            self.Fail("Expected NoSuchElementException to have been thrown")
        except NoSuchElementException, e:
            pass
        except Exception, e:
            self.Fail("Expected NoSuchElementException to have been thrown but got " + str(e))

    def testShouldFindElementByLinkText(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("div1")
        child = element.find_element_by_link_text("hello world")
        self.assertEqual(child.get_attribute("name"), "link1")
    
    def testShouldFindElementsByLinkText(self):
        self._loadPage("nestedElements")
        element = self.driver.find_element_by_name("div1")
        children = element.find_elements_by_link_text("hello world")
        self.assertEqual(len(children), 2)
        self.assertEqual("link1", children[0].get_attribute("name"))
        self.assertEqual("link2", children[1].get_attribute("name"))

    def testShouldFindElementByClassName(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("classes")
        element = parent.find_element_by_class_name("one")
        self.assertEqual("Find me", element.text)

    def testShouldFindElementsByClassName(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("classes")
        elements = parent.find_elements_by_class_name("one")
        self.assertEqual(2, len(elements))

    def testShouldFindElementByTagName(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("div1")
        element = parent.find_element_by_tag_name("a")
        self.assertEqual("link1", element.get_attribute("name"))

    def testShouldFindElementsByTagName(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("div1")
        elements = parent.find_elements_by_tag_name("a")
        self.assertEqual(2, len(elements))

    def testShouldBeAbleToFindAnElementByCssSelector(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("form2")
        element = parent.find_element_by_css_selector('*[name="selectomatic"]')
        self.assertEqual("2", element.get_attribute("id"))

    def testShouldBeAbleToFindMultipleElementsByCssSelector(self):
        self._loadPage("nestedElements")
        parent = self.driver.find_element_by_name("form2")
        elements = parent.find_elements_by_css_selector(
            '*[name="selectomatic"]')
        self.assertEqual(2, len(elements))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
 
    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
