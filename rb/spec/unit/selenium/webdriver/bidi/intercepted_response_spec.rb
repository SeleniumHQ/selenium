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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/headers', __dir__)
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/credentials', __dir__)
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/intercepted_response', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe InterceptedResponse do
        let(:mock_network) { instance_double(Network) }
        let(:response_id) { 'resp-456' }
        let(:intercepted_response) { described_class.new(mock_network, {'request' => response_id}) }
        let(:mock_headers_data) { [{name: 'Content-Type', value: 'application/json'}] }
        let(:mock_cookies_data) { [{name: 'session', value: {type: 'string', value: 'abc'}}] }
        let(:mock_body_string) { '{"message": "Access Denied"}' }

        before do
          allow(intercepted_response).to receive(:id).and_return(response_id)
        end

        describe 'Initialization and Default State' do
          it 'has an empty hash as headers by default' do
            expect(intercepted_response.headers).to be_empty
          end

          it 'has an empty hash as cookies by default' do
            expect(intercepted_response.cookies).to be_empty
          end
        end

        describe '#continue' do
          before do
            allow(mock_network).to receive(:continue_response)
          end

          it 'sends nil headers and cookies when not explicitly set' do
            expected_payload = {id: response_id, cookies: nil, headers: nil, credentials: nil, reason: nil, status: nil}
            intercepted_response.continue

            expect(mock_network).to have_received(:continue_response).with(expected_payload)
          end

          it 'sends headers payload and uses default nil cookies/credentials' do
            intercepted_response.headers = mock_headers_data
            reason = 'Custom Reason'
            status = 201

            expected_payload = {
              id: response_id,
              cookies: nil,
              headers: Headers.new(mock_headers_data).as_json,
              credentials: nil,
              reason: reason,
              status: status
            }
            intercepted_response.reason = reason
            intercepted_response.status = status
            intercepted_response.continue

            expect(mock_network).to have_received(:continue_response).with(expected_payload)
          end

          it 'sends full custom payload when all fields are set' do
            credentials = Credentials.new(username: 'user', password: 'pass')

            intercepted_response.headers = mock_headers_data
            intercepted_response.cookies = mock_cookies_data
            intercepted_response.credentials(username: 'user', password: 'pass')
            intercepted_response.reason = 'Test Reason'
            intercepted_response.status = 404

            expected_payload = {
              id: response_id,
              cookies: Cookies.new(mock_cookies_data).as_json,
              headers: Headers.new(mock_headers_data).as_json,
              credentials: credentials.as_json,
              reason: 'Test Reason',
              status: 404
            }

            intercepted_response.continue

            expect(mock_network).to have_received(:continue_response).with(expected_payload)
          end
        end

        describe '#provide_response' do
          before do
            allow(mock_network).to receive(:provide_response)
          end

          it 'sends nil headers, cookies, and body when not explicitly set' do
            expected_payload = {id: response_id, cookies: nil, headers: nil, body: nil, reason: nil, status: nil}
            intercepted_response.provide_response

            expect(mock_network).to have_received(:provide_response).with(expected_payload)
          end

          it 'sends body payload and uses default [] cookies/headers' do
            intercepted_response.body = mock_body_string
            reason = 'Provided Success'
            status = 200

            expected_payload = {
              id: response_id,
              cookies: nil,
              headers: nil,
              body: {type: 'string', value: mock_body_string.to_json},
              reason: reason,
              status: status
            }
            intercepted_response.reason = reason
            intercepted_response.status = status
            intercepted_response.provide_response

            expect(mock_network).to have_received(:provide_response).with(expected_payload)
          end

          it 'sends full custom payload when all fields are set' do
            intercepted_response.headers = mock_headers_data
            intercepted_response.cookies = mock_cookies_data
            intercepted_response.body = mock_body_string
            intercepted_response.reason = 'Forbidden'
            intercepted_response.status = 403

            expected_payload = {
              id: response_id,
              cookies: Cookies.new(mock_cookies_data).as_json,
              headers: Headers.new(mock_headers_data).as_json,
              body: {type: 'string', value: mock_body_string.to_json},
              reason: 'Forbidden',
              status: 403
            }

            intercepted_response.provide_response

            expect(mock_network).to have_received(:provide_response).with(expected_payload)
          end
        end

        describe 'setters/getters' do
          it '#credentials' do
            credentials = intercepted_response.credentials(username: 'u', password: 'p')
            expect(credentials).to be_a(Credentials)
            expect(intercepted_response.credentials).to be(credentials)
          end

          it '#headers=' do
            intercepted_response.headers = mock_headers_data
            expect(intercepted_response.headers).to be_a(Headers)
          end

          it '#cookies=' do
            intercepted_response.cookies = mock_cookies_data
            first_cookies = intercepted_response.cookies
            intercepted_response.cookies = [{name: 'c2', value: 'v2'}]
            second_cookies = intercepted_response.cookies
            expect(first_cookies).to be(second_cookies)
          end

          it '#body=' do
            data = {key: 'value', number: 123}
            intercepted_response.body = data
            expected_body = {
              type: 'string',
              value: data.to_json
            }
            expect(intercepted_response.body).to eq(expected_body)
          end
        end
      end
    end
  end
end
