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


import pytest
import time
import unittest
from selenium.common.exceptions import NoSuchFrameException


def not_available_on_remote(func):
    def testMethod(self):
        print self.driver
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod

class FrameSwitchingTest(unittest.TestCase):

    def testShouldBeAbleToSwitchToAFrameByItsIndex(self):
      if self.driver.capabilities['browserName'] == 'firefox' and self.driver.capabilities['version'].startswith('3'):
        pytest.skip()
      self._loadPage("frameset")
      self.driver.switch_to_frame(2)
      element = self.driver.find_element_by_id("email")
      self.assertEquals("email", element.get_attribute("type"))

    def testShouldBeAbleToSwitchToAnIframeByItsIndex(self):
      self._loadPage("iframes")
      self.driver.switch_to_frame(0)
      element = self.driver.find_element_by_id("id-name1")
      self.assertEquals("id", element.get_attribute("value"))

    def testShouldBeAbleToSwitchToAFrameByItsName(self):
      self._loadPage("frameset")
      self.driver.switch_to_frame("fourth")
      element = self.driver.find_element_by_tag_name("frame")
      self.assertEquals("child1", element.get_attribute("name"))

    def testShouldBeAbleToSwitchToAnIframeByItsName(self):
      self._loadPage("iframes")
      self.driver.switch_to_frame("iframe1-name");
      element = self.driver.find_element_by_name("id-name1")
      self.assertEquals("name", element.get_attribute("value"))

    def testShouldBeAbleToSwitchToAFrameByItsID(self):
      self._loadPage("frameset")
      self.driver.switch_to_frame("fifth")
      element = self.driver.find_element_by_name("windowOne")
      self.assertEquals("Open new window", element.text)

    def testShouldBeAbleToSwitchToAnIframeByItsID(self):
      self._loadPage("iframes")
      self.driver.switch_to_frame("iframe1");
      element = self.driver.find_element_by_name("id-name1")
      self.assertEquals("name", element.get_attribute("value"))

    def testShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement(self):
      if self.driver.capabilities['browserName'] == 'firefox' and self.driver.capabilities['version'].startswith('3'):
        pytest.skip()
      self._loadPage("frameset")
      frame = self.driver.find_element_by_name("third")
      self.driver.switch_to_frame(frame)
      element = self.driver.find_element_by_id("email")
      self.assertEquals("email", element.get_attribute("type"))

    def testShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement(self):
      self._loadPage("iframes")
      frame = self.driver.find_element_by_tag_name("iframe")
      self.driver.switch_to_frame(frame)
      element = self.driver.find_element_by_name("id-name1")
      self.assertEquals("name", element.get_attribute("value"))

    def testShouldEnsureElementIsAFrameBeforeSwitching(self):
      self._loadPage("frameset")
      frame = self.driver.find_element_by_tag_name("frameset")
      try:
        self.driver.switch_to_frame(frame)
        self.fail()
      except NoSuchFrameException:
        pass

    def testFrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame(self):
      self._loadPage("frameset")
      self.driver.switch_to_frame("sixth")
      element = self.driver.find_element_by_id("iframe_page_heading")
      self.assertEquals("This is the heading", element.text)

      try:
        self.driver.switch_to_frame("third")
        self.fail()
      except NoSuchFrameException:
        pass

      self.driver.switch_to_default_content()
      self.driver.switch_to_frame("third")

      try:
        self.driver.switch_to_frame("third")
        self.fail()
      except NoSuchFrameException:
        pass

      # Now make sure we can go back.
      self.driver.switch_to_default_content()
      self.driver.switch_to_frame("sixth")
      element = self.driver.find_element_by_id("iframe_page_heading")
      self.assertEquals("This is the heading", element.text)

    def testShouldBeAbleToSelectChildFrames(self):
      self._loadPage("frameset")
      self.driver.switch_to_frame("sixth")
      self.driver.switch_to_frame(0)
      element = self.driver.find_element_by_id("id-name1")
      self.assertEquals("id", element.get_attribute("value"))

    def testShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames(self):
      self._loadPage("frameset")
      self.driver.switch_to_frame("fourth")

      try:
        self.driver.switch_to_frame("second")
        self.fail("Expected NoSuchFrameException")
      except NoSuchFrameException:
        pass

    def testShouldThrowAnExceptionWhenAFrameCannotBeFound(self):
      self._loadPage("xhtmlTest")
      try:
        self.driver.switch_to_frame("nothing here")
        self.fail("Should not have been able to switch")
      except NoSuchFrameException:
        pass

    def testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex(self):
      self._loadPage("xhtmlTest")
      try:
        self.driver.switch_to_frame(27)
        self.fail("Should not have been able to switch")
      except NoSuchFrameException:
        pass

    # disabled till we use the Java Webserver
    #def testThatWeStillReferToTheSameFrameOnceItHasBeenSelected(self):
    #    self._loadPage("frameset")
    #    self.driver.switch_to_frame(2)
    #    checkbox = self.driver.find_element_by_xpath("//input[@name='cheeky']")
    #    checkbox.toggle()
    #    checkbox.submit()
    #    self.assertEqual(self.driver.find_element_by_xpath("//p").text, "Success")

    # Disabled till we use the Java WebServer
    #def testThatWeShouldUseTheFirstFrameOnAPage(self):
    #    self._loadPage("frameset")
    #    time.sleep(1)
    #    pageNumber = self.driver.find_element_by_xpath('//span[@id="pageNumber"]')
    #    self.assertEqual(pageNumber.text.strip(), "1")

    #Disabled till we use the Java WebServer
    #def testThatWeFocusOnTheReplacementWhenAFrameFollowsALinkToATopTargettedPage(self):
    #    self._loadPage("frameset")
    #    time.sleep(1)
    #    self.driver.switch_to_frame(0)
    #    self.driver.find_element_by_link_text("top").click()
    #    time.sleep(1)
    #    self.assertEqual("XHTML Test Page", self.driver.title)
    #    self.assertEqual("XHTML Test Page", 
    #    self.driver.find_element_by_xpath("/html/head/title").text)

    def testThatWeShouldNotAutoSwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded(self):
        self._loadPage("iframes")
        time.sleep(0.5)
        self.driver.find_element_by_id("iframe_page_heading")

    def testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage(self):
        self._loadPage("iframes")
        self.driver.switch_to_frame(0)
        self.driver.switch_to_default_content()
        self.driver.find_element_by_id('iframe_page_heading')
        
    # Disabled till we use the Java WebServer
    #def testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt(self):
    #    self._loadPage("iframes")
    #    self.driver.switch_to_frame(0)
    #    submitButton = self.driver.find_element_by_id("greeting")
    #    submitButton.click()

    #    time.sleep(1)
    #    hello = self.driver.find_element_by_id('greeting')
    #    self.assertEqual(hello.text, "Success!")

    # Disalbled till we used the Java Webserver
    #def testShouldBeAbleToClickInAFrame(self):
    #    self._loadPage("frameset")
    #    self.driver.switch_to_frame("third")
    #    time.sleep(1)
    #    submitButton = self.driver.find_element_by_id("greeting")
    #    submitButton.click()

    #    time.sleep(0.5)
    #    hello = self.driver.find_element_by_id('greeting')
    #    self.assertEqual(hello.text, "Success!")
    #    self.driver.switch_to_default_content()

    def testShouldReturnFrameTitleNotWindowTitle(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame("third")
        self.assertEqual("Unique title", self.driver.title)

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
