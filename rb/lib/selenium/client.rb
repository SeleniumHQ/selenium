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

require 'net/http'
require 'uri'
require 'cgi'
require 'digest/md5'
require 'base64'
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

module Selenium
  DEPRECATED_CONSTANTS = {
    :SeleniumDriver => Selenium::Client::Driver,
    :CommandError   => Selenium::Client::CommandError
  }

  def self.const_missing(name)
    if replacement = DEPRECATED_CONSTANTS[name.to_sym]
      warn "the Selenium::#{name} constant has been deprecated, please use #{replacement} instead"
      replacement
    else
      super
    end
  end

  autoload :Rake, 'selenium/rake/server_task'
end # Selenium
