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
      describe Driver do
        let(:valid_response) do
          {status: 200,
           body: {value: {sessionId: 0, capabilities: {browserName: 'chrome'}}}.to_json,
           headers: {content_type: 'application/json'}}
        end

        def expect_request(capabilities: nil, endpoint: nil)
          endpoint ||= 'http://127.0.0.1:4444/wd/hub/session'
          capabilities ||= {browserName: 'chrome', 'goog:chromeOptions': {}}
          capabilities = capabilities.merge('se:remoteUrl': endpoint.delete_suffix('/session'))
          body = {capabilities: {firstMatch: [capabilities]}}
          stub_request(:post, endpoint).with(body: body).to_return(valid_response)
        end

        it 'requires parameters' do
          expect { described_class.new }
            .to raise_exception(ArgumentError, 'Selenium::WebDriver::Remote::Driver needs :options to be set')
        end

        it 'uses provided URL' do
          server = 'https://example.com:4646/wd/hub'
          expect_request(endpoint: "#{server}/session")

          expect { described_class.new(options: Options.chrome, url: server) }.not_to raise_exception
        end

        it 'uses provided HTTP Client' do
          client = Remote::Http::Default.new
          expect_request

          driver = described_class.new(options: Options.chrome, http_client: client)
          expect(driver.send(:bridge).http).to eq client
        end

        it 'builds an HTTP client from the provided client_config' do
          server = 'https://example.com:4646/wd/hub'
          expect_request(endpoint: "#{server}/session")
          config = ClientConfig.new(server_url: server, read_timeout: 25)

          driver = described_class.new(options: Options.chrome, client_config: config)
          expect(driver.send(:bridge).http.read_timeout).to eq(25)
        end

        it 'records the resolved server URL on the client_config' do
          server = 'https://example.com:4646/wd/hub'
          expect_request(endpoint: "#{server}/session")
          config = ClientConfig.new(read_timeout: 25)

          described_class.new(options: Options.chrome, url: server, client_config: config)
          expect(config.server_url).to eq(URI.parse("#{server}/"))
        end

        it 'errors when both http_client and client_config are provided' do
          config = ClientConfig.new(server_url: 'http://localhost')
          expect {
            described_class.new(options: Options.chrome, http_client: Remote::Http::Default.new, client_config: config)
          }.to raise_error(ArgumentError, /cannot use both/i)
        end

        it 'errors when both url and a client_config server_url are provided' do
          config = ClientConfig.new(server_url: 'http://config-host:4444/wd/hub')
          expect {
            described_class.new(options: Options.chrome, url: 'http://url-host:4444/wd/hub', client_config: config)
          }.to raise_error(ArgumentError, /Cannot use both :url and a ClientConfig#server_url/)
        end

        it 'sets a default file detector' do
          expect_request

          driver = described_class.new(options: Options.chrome)
          detector = driver.send(:bridge).file_detector

          expect(detector.call([__FILE__])).to eq(__FILE__)
          expect(detector.call(['not a file'])).to be(false)
        end

        it 'accepts Options as sole parameter' do
          opts = {args: ['-f']}
          expect_request(capabilities: {browserName: 'chrome', 'goog:chromeOptions': opts})

          expect { described_class.new(options: Options.chrome(**opts)) }.not_to raise_exception
        end

        it 'does not allow both Options and Capabilities' do
          msg = "Don't use both :options and :capabilities when initializing Selenium::WebDriver::Remote::Driver, " \
                'prefer :options'
          expect {
            described_class.new(options: Options.chrome, capabilities: Remote::Capabilities.new(browser_name: 'chrome'))
          }.to raise_exception(ArgumentError, msg)
        end

        context 'with :capabilities' do
          it 'accepts value as a Symbol' do
            expect_request
            expect { described_class.new(capabilities: :chrome) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Snake Case as Symbols' do
            capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
            expect_request(capabilities: {browserName: 'chrome', invalid: 'foobar'})

            expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Symbols' do
            capabilities = Remote::Capabilities.new(browserName: 'chrome', invalid: 'foobar')
            expect_request(capabilities: {browserName: 'chrome', invalid: 'foobar'})

            expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Strings' do
            capabilities = Remote::Capabilities.new('browserName' => 'chrome', 'invalid' => 'foobar')
            expect_request(capabilities: {browserName: 'chrome', invalid: 'foobar'})

            expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
          end

          context 'when value is an Array' do
            let(:as_json_object) do
              Class.new do
                def as_json(*)
                  {'company:key': 'value'}
                end
              end
            end

            it 'with Options instance' do
              options = Options.chrome(args: ['-f'])
              expect_request(capabilities: {browserName: 'chrome',
                                            'goog:chromeOptions': {args: ['-f']}})

              expect { described_class.new(capabilities: [options]) }.not_to raise_exception
            end

            it 'with Capabilities instance' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              expect_request(capabilities: {browserName: 'chrome', invalid: 'foobar'})

              expect { described_class.new(capabilities: [capabilities]) }.not_to raise_exception
            end

            it 'with Options instance and an instance of a custom object responding to #as_json' do
              expect_request(capabilities: {browserName: 'chrome',
                                            'goog:chromeOptions': {},
                                            'company:key': 'value'})
              expect { described_class.new(capabilities: [Options.chrome, as_json_object.new]) }.not_to raise_exception
            end

            it 'with Options instance, Capabilities instance and instance of a custom object responding to #as_json' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              options = Options.chrome(args: ['-f'])
              expect_request(capabilities: {browserName: 'chrome', invalid: 'foobar',
                                            'goog:chromeOptions': {args: ['-f']},
                                            'company:key': 'value'})

              expect {
                described_class.new(capabilities: [capabilities, options, as_json_object.new])
              }.not_to raise_exception
            end
          end
        end

        it 'sends se:remoteUrl inside the firstMatch entry for an alwaysMatch request' do
          expect_request(capabilities: {browserName: 'chrome'})

          capabilities = Remote::Capabilities.always_match(browser_name: 'chrome')
          expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
        end

        describe 'bridge selection' do
          let(:session_url) { 'http://127.0.0.1:4444/wd/hub/session' }
          let(:returned_capabilities) { {browserName: 'chrome', webSocketUrl: true} }

          before do
            headers = {content_type: 'application/json'}
            new_session = {value: {sessionId: 'foo', capabilities: returned_capabilities}}
            stub_request(:post, session_url).to_return(status: 200, body: new_session.to_json, headers: headers)
            stub_request(:delete, "#{session_url}/foo").to_return(status: 200, body: {value: nil}.to_json,
                                                                  headers: headers)
          end

          def bridge_for(capabilities)
            described_class.new(capabilities: capabilities).send(:bridge)
          end

          it 'uses BiDi when an alwaysMatch request gets a webSocketUrl back' do
            capabilities = Remote::Capabilities.always_match(browser_name: 'chrome', web_socket_url: true)

            expect { bridge_for(capabilities) }.to raise_error(Error::WebDriverError, /did not return a valid/)
          end

          it 'uses BiDi when a firstMatch request gets a webSocketUrl back' do
            capabilities = Remote::Capabilities.first_match({browser_name: 'chrome', web_socket_url: true},
                                                            {browser_name: 'firefox'})

            expect { bridge_for(capabilities) }.to raise_error(Error::WebDriverError, /did not return a valid/)
          end

          context 'when the response has no webSocketUrl' do
            let(:returned_capabilities) { {browserName: 'chrome'} }

            it 'does not use BiDi when another firstMatch candidate does not ask for it' do
              capabilities = Remote::Capabilities.first_match({browser_name: 'chrome'},
                                                              {browser_name: 'firefox', web_socket_url: true})

              expect(bridge_for(capabilities)).not_to be_a(BiDiConnection)
            end

            it 'raises when every candidate asks for BiDi, since the remote end was told to ignore prompts' do
              capabilities = Remote::Capabilities.always_match(browser_name: 'chrome', web_socket_url: true)

              expect { bridge_for(capabilities) }.to raise_error(Error::WebDriverError, /did not return a valid/)
            end
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
