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

        describe 'listener errors' do
          let(:connection) { instance_double(WebSocketConnection, before_send: []) }
          let(:session_url) { URI('http://localhost/session/foo') }

          before do
            stub_new_session('ws://localhost/session/foo')
            allow(http).to receive(:request).with(:get, URI("#{session_url}/window"), any_args)
                                            .and_return('value' => 'window-1')
            allow(http).to receive(:request).with(:get, URI("#{session_url}/title"), any_args)
                                            .and_return('value' => 'title')
            allow(BiDi).to receive(:new).and_return(instance_double(BiDi, ws: connection, close: nil))
            bridge.create_session(Capabilities.new)
            bridge.listener_errors.add(ArgumentError.new('boom'))
          end

          it 'raises a stored error at the next classic command, without sending it' do
            expect { bridge.title }.to raise_error(ArgumentError, 'boom')
            expect(http).not_to have_received(:request).with(:get, URI("#{session_url}/title"), any_args)
            expect(bridge.title).to eq('title')
          end

          it 'raises a stored error before the next BiDi command is sent' do
            expect { connection.before_send.each { |callable| callable.call(method: 'foo') } }
              .to raise_error(ArgumentError, 'boom')
          end

          it 'ends the session on quit before raising a stored error' do
            allow(http).to receive(:close)

            expect { bridge.quit }.to raise_error(ArgumentError, 'boom')
            expect(http).to have_received(:request).with(:delete, session_url, any_args)
            expect(http).to have_received(:close)
          end
        end

        describe 'navigation' do
          let(:connection) { instance_double(WebSocketConnection, before_send: []) }
          let(:window_url) { URI('http://localhost/session/foo/window') }

          before do
            stub_new_session('ws://localhost/session/foo')
            allow(http).to receive(:request).with(:get, window_url, any_args).and_return('value' => 'window-1')
            allow(http).to receive(:request).with(:post, window_url, any_args).and_return('value' => nil)
            allow(BiDi).to receive(:new).and_return(instance_double(BiDi, ws: connection))
            navigate_result = {'navigation' => nil, 'url' => 'about:blank'}
            allow(connection).to receive_messages(event_receiver: BiDi::Dispatcher.new,
                                                  send_cmd: {'result' => navigate_result})
            allow(connection).to receive(:send_cmd).with(hash_including(method: 'session.subscribe'))
                                                   .and_return('result' => {'subscription' => 'sub-1'})
            allow(connection).to receive(:send_cmd).with(hash_including(method: 'browsingContext.getTree'))
                                                   .and_return('result' => {'contexts' => []})
            bridge.create_session(Capabilities.new)
          end

          it 'navigates the window it switched to' do
            bridge.switch_to_window('window-2')
            bridge.get('about:blank')

            expect(connection).to have_received(:send_cmd)
              .with(method: 'browsingContext.navigate', params: hash_including('context' => 'window-2'))
          end

          it 'requests the window handle only when the session starts' do
            bridge.get('about:blank')
            bridge.refresh

            expect(http).to have_received(:request).with(:get, window_url, any_args).once
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
