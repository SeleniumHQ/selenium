import unittest
import seletest
import selenium

seleniumHost = 'localhost'
seleniumPort = str(4444)
#browserStartCommand = "c:\\program files\\internet explorer\\iexplore.exe"
browserStartCommand = "*firefox"
browserURL = "http://www.irian.at"

def chooseSeleniumServer(host, port, browserCommand, browserURL):
	seletest_class.seleniumHost = host
	seletest_class.seleniumPort = str(port)
	seletest_class.browserStartCommand = browserCommand
	seletest_class.browserURL = browserURL


class seletest_class(unittest.TestCase):

	def setUp(self):
		print "Using selenium server at " + seletest.seleniumHost + ":" + seletest.seleniumPort
		self.seleniumField = selenium.selenium_class(seleniumHost, seleniumPort)
		self.seleniumField.start(browserStartCommand, browserURL)

	def tearDown(self):
		self.seleniumField.stop()
