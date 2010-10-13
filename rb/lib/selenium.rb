# Original code by Aslak Hellesoy and Darren Hobbs

require File.expand_path(File.dirname(__FILE__) + '/selenium/client')

# Backward compatibility

SeleniumHelper = Selenium::Client::SeleniumHelper
SeleniumCommandError = Selenium::CommandError
Selenium::SeleniumDriver = Selenium::Client::Driver