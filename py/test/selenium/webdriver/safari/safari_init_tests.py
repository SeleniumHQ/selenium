import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

 
class SafariInitTests (unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        #monkey patch the RemoteWebDriver Init so we don't create a bunch of
        #browsers unnecessarily and we can verify we are sending the correct
        #arguments
        cls.desired_caps = {}
        
        def captureDesiredCaps(self,command_executor=None,desired_capabilities=None):
            cls.desired_caps = desired_capabilities
        
        cls.old_init = webdriver.safari.webdriver.RemoteWebDriver.__init__ 
        webdriver.safari.webdriver.RemoteWebDriver.__init__ = captureDesiredCaps

        #lets also not create the Chrome Service
        cls.old_svc = webdriver.safari.service.Service.start
        webdriver.safari.service.Service.start = lambda(x) : None


    @classmethod
    def tearDownClass(cls):
        webdriver.safari.webdriver.RemoteWebDriver.__init__ = cls.old_init
        webdriver.safari.service.Service.start = cls.old_svc

    def test_executable_path(self):
        driver = webdriver.Safari(desired_capabilities =
                              {'init.executable_path':'test'})
        self.assertEquals('test', driver.service.path)
    
    def test_port(self):
        caps = {'init.port' : 55}
        driver = webdriver.Safari('test',desired_capabilities = caps)
        self.assertEquals(55, driver.service.port)

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
