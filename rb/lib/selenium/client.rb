#
# Helper requiring the basic selenium-client API (no RSpec goodness)
#

require 'net/http'
require 'uri'
require 'cgi'
require "digest/md5"
require 'fileutils'
require 'tmpdir'
require File.expand_path(File.dirname(__FILE__) + '/../tcp_socket_extension')
require File.expand_path(File.dirname(__FILE__) + '/client/shell')
require File.expand_path(File.dirname(__FILE__) + '/client/errors')
require File.expand_path(File.dirname(__FILE__) + '/client/protocol')
require File.expand_path(File.dirname(__FILE__) + '/client/legacy_driver')
require File.expand_path(File.dirname(__FILE__) + '/client/javascript_expression_builder')
require File.expand_path(File.dirname(__FILE__) + '/client/javascript_frameworks/prototype')
require File.expand_path(File.dirname(__FILE__) + '/client/javascript_frameworks/jquery')
require File.expand_path(File.dirname(__FILE__) + '/client/extensions')
require File.expand_path(File.dirname(__FILE__) + '/client/idiomatic')
require File.expand_path(File.dirname(__FILE__) + '/client/base')
require File.expand_path(File.dirname(__FILE__) + '/client/driver')
require File.expand_path(File.dirname(__FILE__) + '/client/selenium_helper')
require File.expand_path(File.dirname(__FILE__) + '/client/server_control')
require File.expand_path(File.dirname(__FILE__) + '/rake/selenium_server_start_task')
require File.expand_path(File.dirname(__FILE__) + '/rake/selenium_server_stop_task')

# Backward compatibility

SeleniumHelper = Selenium::Client::SeleniumHelper
SeleniumCommandError = Selenium::Client::CommandError
Selenium::SeleniumDriver = Selenium::Client::Driver
