#
# Helper requiring the basic selenium-client API (no RSpec goodness)
#

require 'net/http'
require 'uri'
require 'cgi'
require "digest/md5"
require 'fileutils'
require 'tmpdir'

require 'selenium/client/errors'
require 'selenium/client/protocol'
require 'selenium/client/legacy_driver'
require 'selenium/client/javascript_expression_builder'
require 'selenium/client/javascript_frameworks/prototype'
require 'selenium/client/javascript_frameworks/jquery'
require 'selenium/client/extensions'
require 'selenium/client/idiomatic'
require 'selenium/client/base'
require 'selenium/client/driver'
require 'selenium/client/selenium_helper'
require 'selenium/server'
require 'selenium/rake/server_task'

# Backward compatibility

SeleniumHelper = Selenium::Client::SeleniumHelper
SeleniumCommandError = Selenium::Client::CommandError
Selenium::SeleniumDriver = Selenium::Client::Driver
