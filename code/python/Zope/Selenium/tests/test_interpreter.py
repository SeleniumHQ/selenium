import sys
import unittest

if __name__ == '__main__':
    sys.path.insert(0, '..')

from Products.Selenium.Interpreter import SeleniumInterpreter, translate

class REQUEST:
    """ a mock HTTP request object """
    form = {}


class TranslateTests(unittest.TestCase):
    def test_translate(self):
        expected_result = '|open|http://localhost||'
        retrieved_result = translate('open','http://localhost')
        self.assertEquals(expected_result, retrieved_result)

class InterpreterTests(unittest.TestCase):

    def test_interpretCommand(self):
        selenium = SeleniumInterpreter('selenium_driver')
        self.fail('test not written yet')
        
                          
if __name__ == '__main__':
    unittest.main()
