# Copyright 2006 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

# -----------------
# Original code by Aslak Hellesoy and Darren Hobbs
# This file has been automatically generated via XSL
# -----------------

require 'net/http'
require 'uri'
require 'cgi'
require "digest/md5"
require "fileutils"
require File.expand_path(File.dirname(__FILE__) + '/tcp_socket_extension')
require File.expand_path(File.dirname(__FILE__) + '/nautilus/shell')
require File.expand_path(File.dirname(__FILE__) + '/selenium/command_error')
require File.expand_path(File.dirname(__FILE__) + '/selenium/protocol_error')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/selenese_client')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/generated_driver')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/idiomatic')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/base')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/driver')
require File.expand_path(File.dirname(__FILE__) + '/selenium/client/selenium_helper')
require File.expand_path(File.dirname(__FILE__) + '/selenium/remote_control/remote_control')
require File.expand_path(File.dirname(__FILE__) + '/selenium/rake/remote_control_start_task')
require File.expand_path(File.dirname(__FILE__) + '/selenium/rake/remote_control_stop_task')

# Backward compatibility

SeleniumHelper = Selenium::Client::SeleniumHelper
SeleniumCommandError = Selenium::CommandError
Selenium::SeleniumDriver = Selenium::Client::Driver