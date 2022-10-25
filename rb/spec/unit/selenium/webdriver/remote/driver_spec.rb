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
           body: {value: {sessionId: 0, capabilities: Remote::Capabilities.chrome}}.to_json,
           headers: {content_type: "application/json"}}
        end

        def expect_request(body: nil, endpoint: nil)
          body = (body || {capabilities: {alwaysMatch: {browserName: "chrome"}}}).to_json
          endpoint ||= "http://127.0.0.1:4444/wd/hub/session"
          stub_request(:post, endpoint).with(body: body).to_return(valid_response)
        end

        it 'requires parameters' do
          # Note that this is not a valid Session package, so expecting this request means we expect it to fail
          expect_request(body: {capabilities: {alwaysMatch: {}}})

          expect { Driver.new }.not_to raise_exception
        end

        it 'uses provided URL' do
          server = "https://example.com:4646/wd/hub"
          expect_request(endpoint: "#{server}/session")

          expect { Driver.new(capabilities: :chrome, url: server) }.not_to raise_exception
        end

        it 'uses provided HTTP Client' do
          client = Remote::Http::Default.new
          expect_request

          driver = Driver.new(capabilities: :chrome, http_client: client)
          expect(driver.send(:bridge).http).to eq client
        end

        it 'accepts Options as sole parameter' do
          opts = {args: ['-f']}
          expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', 'goog:chromeOptions': opts}}})

          expect { Driver.new(options: Chrome::Options.new(**opts)) }.not_to raise_exception
        end

        context 'with :capabilities' do
          it 'accepts value as a Symbol' do
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome"}}})
            expect { Driver.new(capabilities: :chrome) }.not_to raise_exception
          end

          it 'accepts generated Capabilities instance' do
            capabilities = Remote::Capabilities.chrome(invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Snake Case as Symbols' do
            capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Symbols' do
            capabilities = Remote::Capabilities.new(browserName: 'chrome', invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Strings' do
            capabilities = Remote::Capabilities.new('browserName' => 'chrome', 'invalid' => 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
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
              options = Chrome::Options.new(args: ['-f'])
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome",
                                                                 'goog:chromeOptions': {args: ['-f']}}}})

              expect { Driver.new(capabilities: [options]) }.not_to raise_exception
            end

            it 'with Capabilities instance' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar'}}})

              expect { Driver.new(capabilities: [capabilities]) }.not_to raise_exception
            end

            it 'with Options instance and an instance of a custom object responding to #as_json' do
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome",
                                                                 'goog:chromeOptions': {},
                                                                 'company:key': 'value'}}})
              expect { Driver.new(capabilities: [Chrome::Options.new, as_json_object.new]) }.not_to raise_exception
            end

            it 'with Options instance, Capabilities instance and instance of a custom object responding to #as_json' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              options = Chrome::Options.new(args: ['-f'])
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "chrome", invalid: 'foobar',
                                                                 'goog:chromeOptions': {args: ['-f']},
                                                                 'company:key': 'value'}}})

              expect { Driver.new(capabilities: [capabilities, options, as_json_object.new]) }.not_to raise_exception
            end
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
