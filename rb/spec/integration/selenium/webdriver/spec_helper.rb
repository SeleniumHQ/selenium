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

require 'rubygems'
require 'time'
require 'rspec'
require 'ci/reporter/rspec'

require 'selenium-webdriver'
require_relative 'spec_support'

include Selenium

GlobalTestEnv = WebDriver::SpecSupport::TestEnvironment.new

class Object
  include WebDriver::SpecSupport::Guards
end

RSpec.configure do |c|
  c.include(WebDriver::SpecSupport::Helpers)
  c.before(:suite) do
    $DEBUG ||= ENV['DEBUG'] == 'true'
    GlobalTestEnv.remote_server.start if GlobalTestEnv.driver == :remote
  end

  c.after(:suite) do
    GlobalTestEnv.quit_driver
  end

  c.filter_run focus: true if ENV['focus']
end

WebDriver::Platform.exit_hook { GlobalTestEnv.quit }

$stdout.sync = true
GlobalTestEnv.unguarded = ENV['noguards'] == 'true'
WebDriver::SpecSupport::Guards.print_env
