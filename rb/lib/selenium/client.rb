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
require File.expand_path(File.dirname(__FILE__) + '/../nautilus/shell')
require File.expand_path(File.dirname(__FILE__) + '/command_error')
require File.expand_path(File.dirname(__FILE__) + '/protocol_error')
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
require File.expand_path(File.dirname(__FILE__) + '/remote_control/remote_control')
require File.expand_path(File.dirname(__FILE__) + '/rake/remote_control_start_task')
require File.expand_path(File.dirname(__FILE__) + '/rake/remote_control_stop_task')
