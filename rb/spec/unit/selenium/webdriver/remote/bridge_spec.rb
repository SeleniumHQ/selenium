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
        describe '.add_command' do
          let(:http) { WebDriver::Remote::Http::Default.new }
          let(:bridge) { described_class.new(http_client: http, url: 'http://localhost') }

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
          it 'creates default http client' do
            bridge = described_class.new(url: 'http://localhost')
            expect(bridge.http).to be_an_instance_of(WebDriver::Remote::Http::Default)
          end

          it 'uses provided implementation of http client' do
            url = 'http://localhost'
            custom_http = instance_double(Remote::Http::Default, server_url?: false, 'server_url=': url)
            bridge = described_class.new(http_client: custom_http, url: url)
            expect(bridge.http).to eq(custom_http)
          end

          it 'errors if http client and client config are both provided' do
            custom_http = instance_double(Remote::Http::Default)
            client_config = ClientConfig.new(server_url: 'http://localhost')
            expect {
              described_class.new(http_client: custom_http, client_config: client_config)
            }.to raise_error(Error::WebDriverError, /cannot specify both/i)
          end

          it 'errors if neither http client nor client config are provided' do
            expect {
              described_class.new
            }.to raise_error(Error::WebDriverError, /no server url provided/i)
          end

          it 'errors if url specified in keyword and client config' do
            client_config = ClientConfig.new(server_url: 'http://localhost')
            expect {
              described_class.new(url: 'http://localhost', client_config: client_config)
            }.to raise_error(Error::WebDriverError, /Cannot specify url in both/i)
          end

          it 'creates http client from client_config' do
            proxy = instance_double(Proxy)
            extra_headers = {'X-Custom-Header' => 'custom_value'}
            custom_user_agent = 'Custom User Agent'
            client_config = ClientConfig.new(
              open_timeout: 15,
              read_timeout: 25,
              proxy: proxy,
              extra_headers: extra_headers,
              user_agent: custom_user_agent,
              server_url: 'http://localhost'
            )
            original_user_agent = WebDriver::Remote::Http::Common.user_agent
            bridge = described_class.new(client_config: client_config)

            expect(bridge.http).to be_an_instance_of(WebDriver::Remote::Http::Default)
            expect(bridge.http.open_timeout).to eq(15)
            expect(bridge.http.read_timeout).to eq(25)
            expect(bridge.http.instance_variable_get(:@proxy)).to eq(proxy)
            expect(WebDriver::Remote::Http::Common.extra_headers).to eq(extra_headers)
            expect(WebDriver::Remote::Http::Common.user_agent).to eq(custom_user_agent)
          ensure
            WebDriver::Remote::Http::Common.extra_headers = nil
            WebDriver::Remote::Http::Common.user_agent = original_user_agent
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

        describe 'finding elements' do
          let(:http) { WebDriver::Remote::Http::Default.new }
          let(:bridge) { described_class.new(http_client: http, url: 'http://localhost') }

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
