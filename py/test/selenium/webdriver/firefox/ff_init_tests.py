import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import tempfile
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.extension_connection import ExtensionConnection

class FirefoxInitTests (unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        #monkey patch the RemoteWebDriver Init so we don't create a bunch of
        #browsers unnecessarily and we can verify we are sending the correct
        #arguments
        cls.desired_caps = {}
        cls.executor = None
        cls.profile = None
        cls.binary = None
        
        def captureDesiredCaps(self,command_executor=None, desired_capabilities=None, 
                               browser_profile=None, proxy=None):            
            cls.desired_caps = desired_capabilities
       
        def captureConnection(self, host, firefox_profile, firefox_binary=None,
                              timeout = 30):
            cls.profile = firefox_profile
            cls.binary = firefox_binary
            cls.timeout = timeout

        #stub out remote webdriver
        cls.old_init = webdriver.firefox.webdriver.RemoteWebDriver.__init__ 
        webdriver.firefox.webdriver.RemoteWebDriver.__init__ = captureDesiredCaps

        #stub out firefox extension connection
        cls.old_conn = ExtensionConnection.__init__
        ExtensionConnection.__init__ = captureConnection
        

    @classmethod
    def tearDownClass(cls):
        webdriver.firefox.webdriver.RemoteWebDriver.__init__ = cls.old_init
        ExtensionConnection.__init__ = cls.old_conn

    def test_defaults(self):
        driver = webdriver.Firefox()
        self.assertEqual(FirefoxProfile().encoded, driver.profile.encoded)
        self.assertEqual(FirefoxBinary()._start_cmd, driver.binary._start_cmd)
        self.assertEqual(DesiredCapabilities.FIREFOX, self.desired_caps)

    
    def test_overwrite_profile(self):
        
        def new_init(self, profile_directory=None):
            self.default_preferences = {}
            assert profile_directory == 'test'
        
        old_init = FirefoxProfile.__init__
        FirefoxProfile.__init__ = new_init

        caps = {"init.firefox_profile" : ["test"] }
        driver = webdriver.Firefox(desired_capabilities=caps)

        FirefoxProfile.__init__ = old_init

    def test_overwrite_binary(self):
        caps = {"init.firefox_binary" : {'firefox_path' : 'path',
                                         'log_file':'log'}}

        driver = webdriver.Firefox(desired_capabilities=caps)
        self.assertEquals("path", driver.binary._start_cmd)
        self.assertEquals("log", driver.binary._log_file)
   
    def test_overwrite_timeout(self):
        caps = {"init.timeout" : 99}
        driver = webdriver.Firefox(desired_capabilities=caps)
        self.assertEquals(99, self.timeout)
 
    def test_overwrite_proxy(self):
        caps = {"init.proxy" : [{'proxyType':'MANUAL','ftpProxy':'proxy'}]}
        driver = webdriver.Firefox(desired_capabilities=caps)
        self.assertEquals({'proxy': {'proxyType':'MANUAL','ftpProxy':'proxy'}}, self.desired_caps)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
