import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

 
class IEInitTests (unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        #monkey patch the RemoteWebDriver Init so we don't create a bunch of
        #browsers unnecessarily and we can verify we are sending the correct
        #arguments
        cls.desired_caps = {}
        
        def captureDesiredCaps(self,command_executor=None,desired_capabilities=None):
            cls.desired_caps=desired_capabilities
        
        cls.old_init = webdriver.ie.webdriver.RemoteWebDriver.__init__ 
        webdriver.ie.webdriver.RemoteWebDriver.__init__ = captureDesiredCaps

        #lets also not create the Chrome Service
        cls.old_svc = webdriver.ie.service.Service.start
        webdriver.ie.service.Service.start = lambda(x) : None


    @classmethod
    def tearDownClass(cls):
        webdriver.ie.webdriver.RemoteWebDriver.__init__ = cls.old_init
        webdriver.ie.service.Service.start = cls.old_svc

    def test_executable_path(self):
        driver = webdriver.Ie(desired_capabilities =
                              {'init.executable_path':'test'})
        self.assertEquals('test', driver.iedriver.path)

    def test_port(self):
        caps = {'init.port' : 55}
        driver = webdriver.Ie(desired_capabilities = caps)
        self.assertEquals(55, driver.port)


    @unittest.skip("Timeout is not used why is it an init param?")
    def test_timeout(self):
        caps = {'init.timeout' : 55}
        driver = webdriver.Ie(desired_capabilities = caps)
        self.assertEquals(55, driver.timeout)

    def test_host(self):
        caps = {'init.host' : 'some.host.com'}
        driver = webdriver.Ie(desired_capabilities = caps)
        self.assertEquals('some.host.com', driver.host)

    def test_log_level(self):
        caps = {'init.log_level' : 'ERROR'}
        driver = webdriver.Ie(desired_capabilities = caps)
        self.assertEquals('ERROR', driver.log_level)
    
    
    def test_log_file(self):
        caps = {'init.log_file' : 'awesome_log_file'}
        driver = webdriver.Ie(desired_capabilities = caps)
        self.assertEquals('awesome_log_file', driver.log_file)

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
