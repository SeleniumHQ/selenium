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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/cookies', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe Cookies do
        let(:cookies) { described_class.new }

        it 'returns cookies formatted as json' do
          cookies['session_id'] = 'xyz123'
          cookies['user_pref'] = 'dark_mode'

          formatted_cookies = cookies.as_json
          expect(formatted_cookies).to be_an(Array)
          expect(formatted_cookies.size).to eq(2)

          session_cookie = formatted_cookies.find { |c| c[:name] == 'session_id' }
          expect(session_cookie).not_to be_nil
          expect(session_cookie[:value]).to eq({type: 'string', value: 'xyz123'})

          pref_cookie = formatted_cookies.find { |c| c[:name] == 'user_pref' }
          expect(pref_cookie).not_to be_nil
          expect(pref_cookie[:value]).to eq({type: 'string', value: 'dark_mode'})
        end
      end
    end
  end
end
