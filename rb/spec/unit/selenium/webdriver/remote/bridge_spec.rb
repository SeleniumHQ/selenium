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
      describe Bridge do
        describe '#initialize' do
          it 'raises ArgumentError if passed invalid options' do
            expect { described_class.new(foo: 'bar') }.to raise_error(ArgumentError)
          end
        end

        describe '#create_session' do
          let(:http) { WebDriver::Remote::Http::Default.new }
          let(:bridge) { described_class.new(http_client: http, url: 'http://localhost') }

          it 'accepts Hash' do
            payload = JSON.generate(
              capabilities: {
                alwaysMatch: {
                  browserName: 'internet explorer'
                }
              }
            )

            allow(http).to receive(:request)
              .with(any_args, payload)
              .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})

            bridge.create_session(browserName: 'internet explorer')
            expect(http).to have_received(:request).with(any_args, payload)
          end

          it 'uses alwaysMatch when passed' do
            payload = JSON.generate(
              capabilities: {
                alwaysMatch: {
                  browserName: 'chrome'
                }
              }
            )

            allow(http).to receive(:request)
              .with(any_args, payload)
              .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})

            bridge.create_session('alwaysMatch' => {'browserName' => 'chrome'})
            expect(http).to have_received(:request).with(any_args, payload)
          end

          it 'uses firstMatch when passed' do
            payload = JSON.generate(
              capabilities: {
                firstMatch: [
                  {browserName: 'chrome'},
                  {browserName: 'firefox'}
                ]
              }
            )

            allow(http).to receive(:request)
              .with(any_args, payload)
              .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})

            bridge.create_session('firstMatch' => [
                                    {'browserName' => 'chrome'},
                                    {'browserName' => 'firefox'}
                                  ])
            expect(http).to have_received(:request).with(any_args, payload)
          end

          it 'supports responses with "value" -> "capabilities" capabilities' do
            allow(http).to receive(:request)
              .and_return('value' => {'sessionId' => '', 'capabilities' => {'browserName' => 'firefox'}})

            bridge.create_session(Capabilities.new)
            expect(bridge.capabilities[:browser_name]).to eq('firefox')
          end
        end

        describe '#upload' do
          it 'raises WebDriverError if uploading non-files' do
            expect {
              bridge = described_class.new(url: 'http://localhost')
              bridge.extend(WebDriver::Remote::Features)
              bridge.upload('NotAFile')
            }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#quit' do
          it 'respects quit_errors' do
            bridge = described_class.new(url: 'http://localhost')
            allow(bridge).to receive(:execute).with(:delete_session).and_raise(IOError)
            expect { bridge.quit }.not_to raise_error
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
