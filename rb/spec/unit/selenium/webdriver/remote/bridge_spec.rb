# encoding: utf-8
#
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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Remote
      describe Bridge do
        describe '.handshake' do
          let(:http) { WebDriver::Remote::Http::Default.new }

          it 'sends merged capabilities' do
            payload = JSON.generate(
              desiredCapabilities: {
                browserName: 'internet explorer',
                version: '',
                platform: 'WINDOWS',
                javascriptEnabled: false,
                cssSelectorsEnabled: true,
                takesScreenshot: true,
                nativeEvents: true,
                rotatable: false
              },
              capabilities: {
                firstMatch: [{
                  browserName: 'internet explorer',
                  platformName: 'windows'
                }]
              }
            )

            expect(http).to receive(:request)
              .with(any_args, payload)
              .and_return('status' => 200, 'sessionId' => 'foo', 'value' => {})

            Bridge.handshake(http_client: http, desired_capabilities: Capabilities.ie)
          end

          it 'uses OSS bridge when necessary' do
            allow(http).to receive(:request)
              .and_return('status' => 200, 'sessionId' => 'foo', 'value' => {})

            bridge = Bridge.handshake(http_client: http, desired_capabilities: Capabilities.new)
            expect(bridge).to be_a(OSS::Bridge)
            expect(bridge.session_id).to eq('foo')
          end

          it 'uses W3C bridge when necessary' do
            allow(http).to receive(:request)
              .and_return('value' => {'sessionId' => 'foo', 'value' => {}})

            bridge = Bridge.handshake(http_client: http, desired_capabilities: Capabilities.new)
            expect(bridge).to be_a(W3C::Bridge)
            expect(bridge.session_id).to eq('foo')
          end

          it 'supports responses with "value" capabilities' do
            allow(http).to receive(:request)
              .and_return({'status' => 200, 'sessionId' => '', 'value' => {'browserName' => 'firefox'}})

            bridge = Bridge.handshake(http_client: http, desired_capabilities: Capabilities.new)
            expect(bridge.capabilities[:browser_name]).to eq('firefox')
          end

          it 'supports responses with "value" -> "value" capabilities' do
            allow(http).to receive(:request)
              .and_return('value' => {'sessionId' => '', 'value' => {'browserName' => 'firefox'}})

            bridge = Bridge.handshake(http_client: http, desired_capabilities: Capabilities.new)
            expect(bridge.capabilities[:browser_name]).to eq('firefox')
          end

          it 'supports responses with "value" -> "capabilities" capabilities' do
            allow(http).to receive(:request)
              .and_return('value' => {'sessionId' => '', 'capabilities' => {'browserName' => 'firefox'}})

            bridge = Bridge.handshake(http_client: http, desired_capabilities: Capabilities.new)
            expect(bridge.capabilities[:browser_name]).to eq('firefox')
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
