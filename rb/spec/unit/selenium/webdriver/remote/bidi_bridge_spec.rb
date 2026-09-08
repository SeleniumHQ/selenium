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

module Selenium
  module WebDriver
    module Remote
      describe BiDiBridge do
        let(:http) { WebDriver::Remote::Http::Default.new.tap { |client| client.server_url = 'http://localhost' } }
        let(:bridge) { described_class.new(http_client: http) }

        def stub_new_session(web_socket_url)
          capabilities = {'browserName' => 'safari', 'webSocketUrl' => web_socket_url}
          allow(http).to receive(:request)
            .and_return('value' => {'sessionId' => 'foo', 'capabilities' => capabilities})
        end

        describe '#create_session' do
          it 'raises a clear error when webSocketUrl is returned as a boolean' do
            stub_new_session(true)

            expect { bridge.create_session(Capabilities.new) }
              .to raise_error(Error::WebDriverError, /did not return a valid webSocketUrl/)
          end

          it 'raises a clear error when webSocketUrl is not a ws(s) url' do
            stub_new_session('http://localhost:1234/session/foo')

            expect { bridge.create_session(Capabilities.new) }
              .to raise_error(Error::WebDriverError, /did not return a valid webSocketUrl/)
          end

          it 'quits the remote session when the webSocketUrl is invalid' do
            stub_new_session(true)

            expect { bridge.create_session(Capabilities.new) }.to raise_error(Error::WebDriverError)
            expect(http).to have_received(:request).at_least(:twice)
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
