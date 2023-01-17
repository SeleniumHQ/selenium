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

require File.expand_path('../webdriver/spec_helper', __dir__)
require 'selenium/devtools/support/cdp_client_generator'

module Selenium
  module DevTools
    module Support
      describe CDPClientGenerator do
        subject(:generator) { described_class.new }

        describe '#snake_case' do
          it 'converts from camel case' do
            expect(generator.snake_case('setDataSizeLimitsForTest')).to eq('set_data_size_limits_for_test')
          end

          it 'converts acronyms' do
            expect(generator.snake_case('setExtraHTTPHeaders')).to eq('set_extra_http_headers')
          end

          it 'converts pluralized acronyms' do
            expect(generator.snake_case('setBlockedURLs')).to eq('set_blocked_urls')
          end

          it 'makes an exception for JavaScript' do
            expect(generator.snake_case('forciblyPurgeJavaScriptMemory')).to eq('forcibly_purge_javascript_memory')
          end
        end
      end # CDPClientGenerator
    end # Support
  end # DevTools
end # Selenium
