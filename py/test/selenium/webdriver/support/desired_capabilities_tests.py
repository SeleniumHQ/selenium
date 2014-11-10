import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.desired_capabilities import AllowDesiredCapabilitiesOverrides
from datetime import date


class AllowDesiredCapbilitiesOverridesTests(unittest.TestCase):
    
    def test_decorator_keeps_doc_string(self):
        self.assertEquals(TestDriver.__init__.__doc__, 'this is the docstring')

    def test_decorator_keeps_name(self):
        self.assertEquals(TestDriver.__init__.__name__, "__init__")

    def test_gets_correct_list_of_function_arguments(self):
        decor = AllowDesiredCapabilitiesOverrides()
        args = decor._get_list_of_function_arguments(TestDriver.normal_init_)
        self.assertEquals(['executable_path','port','chrome_options',
                           'service_args','desired_capabilities','service_log_path']
                          , args)             

    def test_decorator_finds_desired_capabilites(self):
        decor = AllowDesiredCapabilitiesOverrides()
        idx = decor._get_desired_capabilities_index(['executable_path','port','chrome_options',
                           'service_args','desired_capabilities','service_log_path'])
        self.assertEquals(4,idx)

    def test_decorator_substitues_values_from_desired_capabilites(self):
        caps = {"init.port" : 25, "init.service_args":[1, 2, 3]}
        td = TestDriver("newpath",desired_capabilities=caps)
        self.assertEquals(td.executable_path, "newpath")
        self.assertEquals(td.port, 25)
        self.assertEquals(td.service_args, [1, 2, 3])

        #and we don't overwrite other default values
        self.assertIsNone(td.service_log_path)
        self.assertIsNone(td.chrome_options)
     
    def test_overwritting_passed_in_arg_value_throws_error(self):
        caps = {"init.executable_path" : "newpath"}
        self.assertRaises(TypeError,
                TestDriver, "some_path", desired_capabilities=caps)

    def test_overwritting_passed_in_keyword_value_throws_error(self):
        caps = {"init.executable_path" : "newpath"}
        self.assertRaises(TypeError,
                TestDriver, executable_path="some_path", desired_capabilities=caps)

    def test_custom_constructors_with_list_params(self):
        d = date(2007,12,5)
        caps = {'init.date_time': [2007,12,5]}
        td = TestDriver(desired_capabilities=caps)
        self.assertEquals(d, td.date_time)

    def test_custom_constructors_with_dictionary_params(self):
        d = date(2007,12,5)
        caps = {'init.date_time' : {'year' : 2007, 'month' : 12, 'day' : 5}}
        td = TestDriver(desired_capabilities=caps)
        self.assertEquals(d, td.date_time)


class TestDriver(object):

    @AllowDesiredCapabilitiesOverrides(constructors={'date_time': date})
    def __init__( self, executable_path="chromedriver", port=0,
             chrome_options=None, service_args=None,
             desired_capabilities=None, service_log_path=None, date_time=None):
        '''this is the docstring'''
        
        self.executable_path = executable_path
        self.port=port
        self.chrome_options=chrome_options
        self.service_args = service_args
        self.desired_capabiliities=desired_capabilities
        self.service_log_path=service_log_path
        self.date_time = date_time

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
