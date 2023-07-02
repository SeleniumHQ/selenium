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

begin
  require 'debug/session'
  DEBUGGER__::CONFIG[:fork_mode] = :parent
  DEBUGGER__.open(nonstop: true)
rescue LoadError
  # not supported on JRuby and TruffleRuby
end

require 'rubygems'
require 'time'
require 'rspec'
require 'webmock/rspec'
require 'selenium-webdriver'
require 'securerandom'
require 'pathname'
require_relative '../../../rspec_matchers'

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
  c.define_derived_metadata do |meta|
    meta[:aggregate_failures] = true
  end
  Selenium::WebDriver.logger(ignored: :logger_info)

  root = Pathname.new('../../../../../../').realpath(__FILE__)
  $LOAD_PATH.insert(0, root.join('bazel-bin/rb/lib').to_s) if File.exist?(root.join('bazel-bin/rb/lib'))

  c.include Selenium::WebDriver::UnitSpecHelper

  c.filter_run focus: true if ENV['focus']

  c.before do
    # https://github.com/ruby/debug/issues/797
    allow(File).to receive(:exist?).and_call_original
  end
end
