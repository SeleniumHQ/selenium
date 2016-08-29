# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require 'uri'

require 'selenium/webdriver/remote/capabilities'
require 'selenium/webdriver/remote/w3c_capabilities'
require 'selenium/webdriver/remote/bridge'
require 'selenium/webdriver/remote/w3c_bridge'
require 'selenium/webdriver/remote/server_error'
require 'selenium/webdriver/remote/response'
require 'selenium/webdriver/remote/commands'
require 'selenium/webdriver/remote/w3c_commands'
require 'selenium/webdriver/remote/http/common'
require 'selenium/webdriver/remote/http/default'

module Selenium
  module WebDriver
    # @api private
    module Remote
    end # Remote
  end # WebDriver
end # Selenium
