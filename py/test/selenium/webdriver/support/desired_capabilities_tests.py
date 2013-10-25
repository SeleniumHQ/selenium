import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.desired_capabilities import AllowDesiredCapabilitesOverrides


class AllowDesiredCapbilitiesOverridesTests(unittest.TestCase):
    
    def test_decorator_keeps_doc_string(self):
        self.assertEquals(TestDriver.__init__.__doc__, 'this is the docstring')

    def test_decorator_keeps_name(self):
        self.assertEquals(TestDriver.__init__.__name__, "__init__")

    def test_gets_correct_list_of_function_arguments(self):
        decor = AllowDesiredCapabilitesOverrides()
        args = decor._get_list_of_function_arguments(TestDriver.normal_init_)
        self.assertEquals(['executable_path','port','chrome_options',
                           'service_args','desired_capabilities','service_log_path']
                          , args)             

    def test_decorator_finds_desired_capabilites(self):
        decor = AllowDesiredCapabilitesOverrides()
        idx = decor._get_desired_capabilities_index(['executable_path','port','chrome_options',
                           'service_args','desired_capabilities','service_log_path'])
        self.assertEquals(4,idx)

    def test_decorator_substitues_values_from_desired_capabilites(self):
        caps = {"port" : 25, "service_args":[1, 2, 3]}
        td = TestDriver("newpath",desired_capabilities=caps)
        self.assertEquals(td.executable_path, "newpath")
        self.assertEquals(td.port, 25)
        self.assertEquals(td.service_args, [1, 2, 3])

        #and we don't overwrite other default values
        self.assertIsNone(td.service_log_path)
        self.assertIsNone(td.chrome_options)
     
    def test_overwritting_passed_in_arg_value_throws_error(self):
        caps = {"executable_path" : "newpath"}
        self.assertRaises(TypeError,
                TestDriver, "some_path", desired_capabilities=caps)

    def test_overwritting_passed_in_keyword_value_throws_error(self):
        caps = {"executable_path" : "newpath"}
        self.assertRaises(TypeError,
                TestDriver, executable_path="some_path", desired_capabilities=caps)



class TestDriver(object):

    @AllowDesiredCapabilitesOverrides()
    def __init__( self, executable_path="chromedriver", port=0,
             chrome_options=None, service_args=None,
             desired_capabilities=None, service_log_path=None):
        '''this is the docstring'''
        
        self.executable_path = executable_path
        self.port=port
        self.chrome_options=chrome_options
        self.service_args = service_args
        self.desired_capabiliities=desired_capabilities
        self.service_log_path=service_log_path

    def normal_init_( self, executable_path="chromedriver", port=0,
             chrome_options=None, service_args=None,
             desired_capabilities=None, service_log_path=None):
        '''this is the docstring'''
        
        self.executable_path = executable_path
        self.port=port
        self.chrome_options=chrome_options
        self.service_args = service_args
        self.desired_capabiliities=desired_capabilities
        self.service_log_path=service_log_path


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main() 
