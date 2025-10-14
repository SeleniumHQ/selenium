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
        it 'returns the cookies as json' do
          cookies = described_class.new
          cookies['key4'] = 'value4'
          cookies['session_id'] = 'xyz123'

          formatted_cookies = cookies.as_json
          expect(formatted_cookies).to be_an(Array)
          expect(formatted_cookies.first['key4']).to eq('value4')
          expect(formatted_cookies.first['session_id']).to eq('xyz123')
        end

        it 'serializes the cookies needed for request' do
          cookies =
            described_class.new(
              {
                name: 'test',
                value: 'value4',
                domain: 'example.com',
                path: '/path',
                size: 1234,
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                expiry: 1234
              }
            )

          formatted_cookies = cookies.as_json
          expect(formatted_cookies).to be_an(Array)
          expect(formatted_cookies.size).to eq(1)

          request_cookies = formatted_cookies.first
          expect(request_cookies[:name]).to eq('test')
          expect(request_cookies[:value][:type]).to eq('string')
          expect(request_cookies[:value][:value]).to eq('value4')
          expect(request_cookies[:domain]).to eq('example.com')
          expect(request_cookies[:path]).to eq('/path')
          expect(request_cookies[:expiry]).to eq(1234)
          expect(request_cookies[:httpOnly]).to be(true)
          expect(request_cookies[:secure]).to be(true)
          expect(request_cookies[:sameSite]).to eq('Strict')
          expect(request_cookies[:size]).to eq(1234)
        end

        it 'serializes the cookies needed for response' do
          cookies = described_class.new({
                                          name: 'test',
                                          value: 'bar',
                                          domain: 'localhost',
                                          httpOnly: true,
                                          expiry: '1_000_000',
                                          maxAge: 1_000,
                                          path: '/',
                                          sameSite: 'lax',
                                          secure: false
                                        })

          formatted_cookies = cookies.as_json
          expect(formatted_cookies).to be_an(Array)
          expect(formatted_cookies.size).to eq(1)
          response_cookies = formatted_cookies.first
          expect(response_cookies[:value][:type]).to eq('string')
          expect(response_cookies[:value][:value]).to eq('bar')
          expect(response_cookies[:domain]).to eq('localhost')
          expect(response_cookies[:path]).to eq('/')
          expect(response_cookies[:expiry]).to eq('1_000_000')
          expect(response_cookies[:httpOnly]).to be(true)
          expect(response_cookies[:secure]).to be(false)
          expect(response_cookies[:sameSite]).to eq('lax')
          expect(response_cookies[:maxAge]).to eq(1_000)
        end
      end
    end
  end
end
