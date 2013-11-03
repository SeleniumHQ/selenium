import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import tempfile
from selenium.webdriver.chrome.options import Options


class ChromeInitTests (unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        #monkey patch the RemoteWebDriver Init so we don't create a bunch of
        #browsers unnecessarily and we can verify we are sending the correct
        #arguments
        cls.desired_caps = {}
        
        def captureDesiredCaps(self,command_executor=None,desired_capabilities=None):
            cls.desired_caps=desired_capabilities
        
        cls.old_init = webdriver.chrome.webdriver.RemoteWebDriver.__init__ 
        webdriver.chrome.webdriver.RemoteWebDriver.__init__ = captureDesiredCaps

        #lets also not create the Chrome Service
        cls.old_svc = webdriver.chrome.service.Service.start
        webdriver.chrome.service.Service.start = lambda(x) : None

        #we still need temporary file as Chrome Options checks the file exists
        cls.log_file = tempfile.NamedTemporaryFile()

    @classmethod
    def tearDownClass(cls):
        webdriver.chrome.webdriver.RemoteWebDriver.__init__ = cls.old_init
        webdriver.chrome.service.Service.start = cls.old_svc

    def test_executable_path_argument(self):
        driver = webdriver.Chrome("path")
        self.assertEquals('path',driver.service.path)

    def test_executable_path_from_desired_caps(self):
        desired_caps = {"init.executable_path" : "path"}
        driver = webdriver.Chrome(desired_capabilities=desired_caps)
        self.assertEquals("path", driver.service.path)


    def test_service_log_path_argument(self):
        driver = webdriver.Chrome(service_log_path=self.log_file.name)
        self.assertIn('--log-path=' + self.log_file.name, driver.service.service_args)

    def test_service_log_path_from_desired_caps(self):
        desired_caps = {"init.service_log_path" : self.log_file.name}
        driver = webdriver.Chrome(desired_capabilities=desired_caps)
        self.assertIn('--log-path=' + self.log_file.name,
                      driver.service.service_args)

    def test_port_argument(self):
        driver = webdriver.Chrome(port=32333)
        self.assertEquals(32333, driver.service.port)

    def test_port_from_desired_caps(self):
        desired_caps = {"init.port" : 32333}
        driver = webdriver.Chrome(desired_capabilities=desired_caps)
        self.assertEquals(32333, driver.service.port)
        

    def test_chrome_options_from_desired_caps(self):
        test_options = Options()
        test_options._arguments = ['--debug-print','--disable-3d-apis']
        test_options._extensions = ['ext1','ext2']

        expected_dc = {'platform':'ANY','browserName':'chrome','version':'',
                       'javascriptEnabled' : True,
                       'chromeOptions' : {
                        'args' : ['--debug-print','--disable-3d-apis'],
                        'extensions' : ['ext1','ext2']}
                      }

        desired_caps = {"init.chrome_options" : test_options}
        driver = webdriver.Chrome(desired_capabilities=desired_caps)
        self.assertEquals(self.desired_caps, expected_dc)


    def test_chrome_options_argument(self):
        test_options = Options()
        test_options._arguments = ['--debug-print','--disable-3d-apis']
        test_options._extensions = ['ext1','ext2']

        expected_dc = {'platform':'ANY','browserName':'chrome','version':'',
                       'javascriptEnabled' : True,
                       'chromeOptions' : {
                        'args' : ['--debug-print','--disable-3d-apis'],
                        'extensions' : ['ext1','ext2']}
                      }

        driver = webdriver.Chrome(chrome_options=test_options)
        self.assertEquals(self.desired_caps, expected_dc)

    def test_service_args(self):
        driver = webdriver.Chrome(service_args=[1,2,3])
        self.assertEquals(driver.service.service_args, [1,2,3])

    def test_service_args_from_desired_caps(self):
        desired_caps = {"init.service_args" : [1,2,3]}
        driver = webdriver.Chrome(desired_capabilities=desired_caps)
        self.assertEquals(driver.service.service_args,[1,2,3])



if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
