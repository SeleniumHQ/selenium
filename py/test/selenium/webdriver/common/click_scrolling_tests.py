import unittest
import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import MoveTargetOutOfBoundsException


class ClickScrollingTest(unittest.TestCase):

    def testClickingOnAnchorScrollsPage(self):
        scrollScript = "var pageY;\
                  if (typeof(window.pageYOffset) == 'number') {\
                    pageY = window.pageYOffset;\
                  } else {\
                    pageY = document.documentElement.scrollTop;\
                  }\
                  return pageY;"

        self._loadPage("macbeth") 
        self.driver.find_element(By.PARTIAL_LINK_TEXT,"last speech").click()
        yOffset = self.driver.execute_script(scrollScript)

        # Focusing on to click, but not actually following,
        # the link will scroll it in to view, which is a few
        # pixels further than 0
        self.assertTrue(yOffset > 300)

    def testShouldScrollToClickOnAnElementHiddenByOverflow(self):
        self._loadPage("click_out_of_bounds_overflow")
        link = self.driver.find_element(By.ID, "link")
        try:
            link.click()
        except MoveTargetOutOfBoundsException:
            self.fail("Should not be out of bounds")

    @pytest.mark.ignore_chrome
    def testShouldBeAbleToClickOnAnElementHiddenByOverflow(self):
        self._loadPage("scroll")
        link = self.driver.find_element(By.ID, "line8")
        link.click()
        self.assertEqual("line8", self.driver.find_element(By.ID, "clicked").text)

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_opera
    def testShouldNotScrollOverflowElementsWhichAreVisible(self):
        self._loadPage("scroll2")
        list = self.driver.find_element(By.TAG_NAME, "ul")
        item = list.find_element(By.ID, "desired")
        item.click()
        yOffset = self.driver.execute_script("return arguments[0].scrollTop;", list)
        self.assertEqual(0, yOffset)

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_safari
    def testShouldNotScrollIfAlreadyScrolledAndElementIsInView(self):
        self._loadPage("scroll3")
        self.driver.find_element(By.ID, "button1").click()
        scrollTop = self.driver.execute_script("return document.body.scrollTop;")
        self.driver.find_element(By.ID, "button2").click()
        self.assertEqual(scrollTop, self.driver.execute_script("return document.body.scrollTop;"))

    def testShouldBeAbleToClickRadioButtonScrolledIntoView(self):
        self._loadPage("scroll4")
        self.driver.find_element(By.ID, "radio").click()
        # If we dont throw we are good
        
    @pytest.mark.ignore_ie
    def testShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView(self):
        self._loadPage("scroll5")
        self.driver.find_element(By.ID, "inner").click()
        self.assertEqual("clicked", self.driver.find_element(By.ID, "clicked").text)

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
