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
      describe Features do
        let(:http) { WebDriver::Remote::Http::Default.new }
        let(:bridge) { Bridge.new(http_client: http, url: 'http://localhost') }

        before do
          allow(http).to receive(:request)
            .with(any_args)
            .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})

          bridge.create_session({})
          bridge.extend(Features)
          bridge.add_commands(Features::REMOTE_COMMANDS)
        end

        describe '#fire_session_event' do
          it 'fires event with payload' do
            allow(http).to receive(:request)
              .with(:post, URI('http://localhost/session/foo/se/event'), any_args)
              .and_return('value' => {'success' => true, 'eventType' => 'test:failed'})

            result = bridge.fire_session_event('test:failed', {testName: 'LoginTest', error: 'Element not found'})

            expect(http).to have_received(:request)
              .with(:post, URI('http://localhost/session/foo/se/event'), any_args)
            expect(result['success']).to be true
            expect(result['eventType']).to eq 'test:failed'
          end

          it 'fires event without payload' do
            allow(http).to receive(:request)
              .with(:post, URI('http://localhost/session/foo/se/event'), any_args)
              .and_return('value' => {'success' => true, 'eventType' => 'log:collect'})

            result = bridge.fire_session_event('log:collect')

            expect(http).to have_received(:request)
              .with(:post, URI('http://localhost/session/foo/se/event'), any_args)
            expect(result['success']).to be true
            expect(result['eventType']).to eq 'log:collect'
          end
        end

        describe 'REMOTE_COMMANDS' do
          it 'includes fire_session_event command' do
            expect(Features::REMOTE_COMMANDS).to include(:fire_session_event)
            expect(Features::REMOTE_COMMANDS[:fire_session_event]).to eq [:post, 'session/:session_id/se/event']
          end
        end
      end
    end
  end
end