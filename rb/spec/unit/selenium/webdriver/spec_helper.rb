# frozen_string_literal: true

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

require 'rubygems'
require 'time'
require 'rspec'
require 'webmock/rspec'
require 'selenium-webdriver'
require 'securerandom'
require 'pathname'

module Selenium
  module WebDriver
    module UnitSpecHelper
      def with_env(hash)
        hash.each { |k, v| ENV[k.to_s] = v.to_s }
        yield
      ensure
        hash.each_key { |k| ENV.delete(k) }
      end
    end
  end
end

RSpec.configure do |c|
  c.include Selenium::WebDriver::UnitSpecHelper

  c.filter_run focus: true if ENV['focus']
end
