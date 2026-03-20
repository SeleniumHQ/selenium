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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/intercepted_request', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe InterceptedRequest do
        let(:mock_network) { instance_double(Network) }
        let(:mock_request) { {'request' => 'req-123'} }
        let(:request_id) { 'req-123' }
        let(:intercepted_request) { described_class.new(mock_network, mock_request) }
        let(:mock_headers) { [{name: 'Auth', value: 'token'}] }
        let(:mock_cookies) { [{name: 'session', value: {type: 'string', value: '123'}}] }

        describe '#continue' do
          before do
            allow(mock_network).to receive(:continue_request)
          end

          it 'sends only the mandatory ID when no optional fields are set' do
            expected_payload = {id: request_id, body: nil, cookies: nil, headers: nil, method: nil, url: nil}
            intercepted_request.continue

            expect(mock_network).to have_received(:continue_request).with(expected_payload)
          end

          it 'sends headers payload when headers are explicitly set' do
            intercepted_request.headers = mock_headers

            expected_payload = {
              id: request_id,
              body: nil,
              cookies: nil,
              headers: Headers.new(mock_headers).as_json,
              method: nil,
              url: nil
            }

            intercepted_request.continue

            expect(mock_network).to have_received(:continue_request).with(expected_payload)
          end

          it 'sends cookies payload when cookies are explicitly set' do
            intercepted_request.cookies = mock_cookies

            expected_payload = {
              id: request_id,
              body: nil,
              cookies: Cookies.new(mock_cookies).as_json,
              headers: nil,
              method: nil,
              url: nil
            }

            intercepted_request.continue

            expect(mock_network).to have_received(:continue_request).with(expected_payload)
          end

          it 'sends full custom payload when all fields are set' do
            intercepted_request.headers = mock_headers
            intercepted_request.cookies = mock_cookies
            intercepted_request.method = 'POST'

            expected_payload = {
              id: request_id,
              body: nil,
              cookies: Cookies.new(mock_cookies).as_json,
              headers: Headers.new(mock_headers).as_json,
              method: 'POST',
              url: nil
            }

            intercepted_request.continue

            expect(mock_network).to have_received(:continue_request).with(expected_payload)
          end
        end
      end
    end
  end
end
