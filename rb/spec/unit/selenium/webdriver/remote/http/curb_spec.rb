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

require File.expand_path('../../spec_helper', __dir__)
return if Selenium::WebDriver::Platform.jruby? || Selenium::WebDriver::Platform.truffleruby?

require 'selenium/webdriver/remote/http/curb'
require 'curb'

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Curb do
          subject(:curb) { described_class.new }
          it 'assigns default timeout to 0.0' do
            http = curb.send :client

            expect(http.timeout).to eq 0.0
          end

          it 'sets the timeout' do
            curb.timeout = 20
            expect(curb.timeout).to eq 20
          end

          describe '#initialize' do
            let(:curb) { described_class.new(timeout: 10) }

            it 'is initialized with timeout' do
              expect(curb.timeout).to eq 10
            end
          end
        end
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
