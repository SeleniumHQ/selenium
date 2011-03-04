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


import os
import re
import tempfile
import time
import shutil
import unittest
from selenium.common.exceptions import NoSuchElementException
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

    def testThatWeCanSwitchToFrameByIndex(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame(2)
        checkbox = self.driver.find_element_by_id("checky")
        checkbox.toggle()
        checkbox.submit()

    def testThatWeCanSwitchFrameByName(self):
        self._loadPage("frameset")
        self.driver.switch_to_frame("third")
        checkbox = self.driver.find_element_by_id("checky")
        checkbox.toggle()
        checkbox.submit()
    
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

    def testShouldThrowAnExceptinWhenAFrameCannotBeFound(self):
        self._loadPage("xhtmlTest")
        try:
            self.driver.switch_to_frame("nothing here")
            self.fail("Expected a NoSuchFrameException to have been thrown")
        except NoSuchFrameException, nsfe:
            pass
        except Exception, e:
            self.fail("Expected NoSuchFrameException but got " + str(type(e)))

    def testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex(self):
        self._loadPage("xhtmlTest")
        try:
            self.driver.switch_to_frame(27)
            self.fail("Expected a NoSuchFrameException to have been thrown")
        except NoSuchFrameException, nsfe:
            pass
        except Exception, e:
            self.fail("Expected NoSuchFrameException but got " + str(type(e)))

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
