import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

 
class PhantomJSInitTests (unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        #monkey patch the RemoteWebDriver Init so we don't create a bunch of
        #browsers unnecessarily and we can verify we are sending the correct
        #arguments
        cls.desired_caps = {}
        
        def captureDesiredCaps(self,command_executor=None,desired_capabilities=None):
            cls.desired_caps = desired_capabilities
        
        cls.old_init = webdriver.phantomjs.webdriver.RemoteWebDriver.__init__ 
        webdriver.phantomjs.webdriver.RemoteWebDriver.__init__ = captureDesiredCaps

        #lets also not create the Chrome Service
        cls.old_svc = webdriver.phantomjs.service.Service.start
        webdriver.phantomjs.service.Service.start = lambda(x) : None


    @classmethod
    def tearDownClass(cls):
        webdriver.phantomjs.webdriver.RemoteWebDriver.__init__ = cls.old_init
        webdriver.phantomjs.service.Service.start = cls.old_svc

    def test_executable_path(self):
        driver = webdriver.PhantomJS(desired_capabilities =
                              {'init.executable_path':'test'})
        self.assertEquals('test', driver.service.path)
    
    def test_port(self):
        caps = {'init.port' : 55}
        driver = webdriver.PhantomJS('test', desired_capabilities = caps)
        self.assertEquals(55, driver.service.port)

    def test_service_args(self):
        caps = {'init.service_args' : ['arg1', 'arg2'], 'init.port':55}
        driver = webdriver.PhantomJS(desired_capabilities = caps)
        expected = ['phantomjs', 'arg1', 'arg2', '--webdriver=55']
        self.assertEquals(expected, driver.service.service_args)
    
    def test_service_log_path(self):
        import tempfile
        log = tempfile.NamedTemporaryFile()
        caps = {'init.service_log_path' : log.name}
        driver = webdriver.PhantomJS(desired_capabilities = caps)
        self.assertEquals(log.name, driver.service._log.name)

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
