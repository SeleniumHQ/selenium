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

require File.expand_path('../spec_helper', __dir__)
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/headers', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe Headers do
        let(:headers) { described_class.new }

        it 'returns headers formatted as json' do
          headers['Accept'] = 'application/json'
          headers['User-Agent'] = 'MyAgent/1.0'

          formatted_headers = headers.as_json
          expect(formatted_headers).to be_an(Array)
          expect(formatted_headers.size).to eq(2)

          accept_item = formatted_headers.find { |h| h[:name] == 'Accept' }
          expect(accept_item).not_to be_nil
          expect(accept_item[:value]).to eq({type: 'string', value: 'application/json'})

          ua_item = formatted_headers.find { |h| h[:name] == 'User-Agent' }
          expect(ua_item).not_to be_nil
          expect(ua_item[:value]).to eq({type: 'string', value: 'MyAgent/1.0'})
        end
      end
    end
  end
end
