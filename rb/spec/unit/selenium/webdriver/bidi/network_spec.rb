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
# Adjust the require path as necessary for your project structure
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe Network do
        let(:mock_bidi) { instance_double(BiDi, 'Bidi') }
        let(:network) { described_class.new(mock_bidi) }
        let(:request_id) { '12345-request-id' }

        before { allow(mock_bidi).to receive(:send_cmd).and_return({}) }

        describe '#continue_request' do
          it 'sends only the mandatory request ID when all optional args are nil' do
            expected_payload = {request: request_id}

            network.continue_request(id: request_id)

            expect(mock_bidi).to have_received(:send_cmd).with('network.continueRequest', expected_payload)
          end

          it 'sends only provided optional args' do
            expected_payload = {
              request: request_id,
              body: {type: 'string', value: 'new body'},
              method: 'POST'
            }

            network.continue_request(
              id: request_id,
              body: {type: 'string', value: 'new body'},
              cookies: nil,
              headers: nil,
              method: 'POST'
            )

            expect(mock_bidi).to have_received(:send_cmd).with('network.continueRequest', expected_payload)
          end
        end

        describe '#continue_response' do
          it 'sends only the mandatory request ID when all optional args are nil' do
            expected_payload = {request: request_id}

            network.continue_response(id: request_id)

            expect(mock_bidi).to have_received(:send_cmd).with('network.continueResponse', expected_payload)
          end

          it 'sends only provided optional args' do
            expected_headers = [{name: 'Auth', value: {type: 'string', value: 'Token'}}]
            expected_payload = {
              request: request_id,
              headers: expected_headers,
              statusCode: 202
            }

            network.continue_response(
              id: request_id,
              cookies: nil,
              credentials: nil,
              headers: expected_headers,
              reason: nil,
              status: 202
            )

            expect(mock_bidi).to have_received(:send_cmd).with('network.continueResponse', expected_payload)
          end
        end

        describe '#provide_response' do
          it 'sends only the mandatory request ID when all optional args are nil' do
            expected_payload = {request: request_id}

            network.provide_response(id: request_id)

            expect(mock_bidi).to have_received(:send_cmd).with('network.provideResponse', expected_payload)
          end

          it 'sends only provided optional args' do
            expected_payload = {
              request: request_id,
              body: {type: 'string', value: 'Hello'},
              reasonPhrase: 'OK-Custom'
            }

            network.provide_response(
              id: request_id,
              body: {type: 'string', value: 'Hello'},
              cookies: nil,
              headers: nil,
              reason: 'OK-Custom',
              status: nil
            )

            expect(mock_bidi).to have_received(:send_cmd).with('network.provideResponse', expected_payload)
          end
        end
      end
    end
  end
end
