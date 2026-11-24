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
      describe BiDiCommands do
        let(:http) { WebDriver::Remote::Http::Default.new.tap { |client| client.server_url = 'http://localhost' } }
        let(:socket) { instance_double(WebSocketConnection) }
        let(:bridge_class) do
          Class.new(Bridge) do
            include BiDiCommands

            attr_accessor :connection

            def create_session(capabilities)
              @session_id = 'foo'
              @capabilities = capabilities
            end
          end
        end
        let(:bridge) do
          bridge_class.new(http_client: http).tap do |bridge|
            bridge.create_session(Capabilities.new)
            bridge.connection = socket
          end
        end
        let(:window_url) { URI('http://localhost/session/foo/window') }

        before do
          allow(http).to receive(:request).and_return('value' => nil)
          allow(http).to receive(:request).with(:get, window_url, any_args).and_return('value' => 'window-1')
          allow(socket).to receive(:send_cmd).and_return('result' => {'navigation' => nil, 'url' => 'about:blank'})
        end

        describe '#current_window' do
          it 'reads the window on first use when the bridge did not assign it' do
            expect(http).not_to have_received(:request).with(:get, window_url, any_args)

            bridge.get('about:blank')
            bridge.refresh

            expect(bridge.current_window).to eq('window-1')
            expect(http).to have_received(:request).with(:get, window_url, any_args).once
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
