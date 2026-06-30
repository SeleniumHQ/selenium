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
        let(:http) do
          WebDriver::Remote::Http::Default.new.tap { |client| client.server_url = 'http://localhost' }
        end
        let(:bridge) { described_class.new(http_client: http) }

        describe '.add_command' do
          before do
            allow(http).to receive(:request)
              .with(any_args)
              .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})

            bridge.create_session({})
          end

          after do
            described_class.extra_commands.clear
          end

          it 'adds new command' do
            described_class.add_command(:highlight, :get, 'session/:session_id/highlight/:id') do |element|
              execute :highlight, id: element
            end

            bridge.highlight('bar')
            expect(http).to have_received(:request)
              .with(:get, URI('http://localhost/session/foo/highlight/bar'), any_args)
          end
        end

        describe '#initialize' do
          it 'uses the provided http client' do
            custom_http = Remote::Http::Default.new
            bridge = described_class.new(http_client: custom_http)
            expect(bridge.http).to eq(custom_http)
          end
        end

        describe '#create_session' do
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
              bridge.extend(WebDriver::Remote::Features)
              bridge.upload('NotAFile')
            }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#quit' do
          it 'respects quit_errors' do
            allow(bridge).to receive(:execute).with(:delete_session).and_raise(IOError)
            expect { bridge.quit }.not_to raise_error
          end
        end

        describe 'finding elements' do
          before do
            allow(http).to receive(:request)
              .with(:post, URI('http://localhost/session'), any_args)
              .and_return('status' => 200, 'value' => {'sessionId' => 'foo', 'capabilities' => {}})
            bridge.create_session({})
          end

          describe '#find_element_by' do
            before do
              allow(http).to receive(:request)
                .with(:post, URI('http://localhost/session/foo/element'), any_args)
                .and_return('status' => 200, 'value' => {Element::ELEMENT_KEY => 'bar'})
            end

            it 'returns an element' do
              expect(bridge.find_element_by(:id, 'test', nil)).to be_an_instance_of(Element)
            end

            context 'when custom element class is used' do
              before do
                stub_const('MyCustomElement', Class.new(Selenium::WebDriver::Element))
                described_class.element_class = MyCustomElement
              end

              after do
                described_class.element_class = nil
              end

              it 'returns a custom element' do
                expect(bridge.find_element_by(:id, 'test', nil)).to be_an_instance_of(MyCustomElement)
              end
            end
          end

          describe '#find_elements_by' do
            before do
              allow(http).to receive(:request)
                .with(:post, URI('http://localhost/session/foo/elements'), any_args)
                .and_return('status' => 200, 'value' => [{Element::ELEMENT_KEY => 'bar'}])
            end

            it 'returns an element' do
              expect(bridge.find_elements_by(:id, 'test', nil)).to all(be_an_instance_of(Element))
            end

            context 'when custom element class is used' do
              before do
                stub_const('MyCustomElement', Class.new(Selenium::WebDriver::Element))
                described_class.element_class = MyCustomElement
              end

              after do
                described_class.element_class = nil
              end

              it 'returns a custom element' do
                expect(bridge.find_elements_by(:id, 'test', nil)).to all(be_an_instance_of(MyCustomElement))
              end
            end
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
