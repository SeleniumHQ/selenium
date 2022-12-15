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

        def expect_request(body: nil, endpoint: nil)
          body = (body || {capabilities: {alwaysMatch: {browserName: 'chrome', 'goog:chromeOptions': {}}}}).to_json
          endpoint ||= 'http://127.0.0.1:4444/wd/hub/session'
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

        it 'accepts Options as sole parameter' do
          opts = {args: ['-f']}
          expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', 'goog:chromeOptions': opts}}})

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
            expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', invalid: 'foobar'}}})

            expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Symbols' do
            capabilities = Remote::Capabilities.new(browserName: 'chrome', invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', invalid: 'foobar'}}})

            expect { described_class.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Strings' do
            capabilities = Remote::Capabilities.new('browserName' => 'chrome', 'invalid' => 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', invalid: 'foobar'}}})

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
              expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome',
                                                                 'goog:chromeOptions': {args: ['-f']}}}})

              expect { described_class.new(capabilities: [options]) }.not_to raise_exception
            end

            it 'with Capabilities instance' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', invalid: 'foobar'}}})

              expect { described_class.new(capabilities: [capabilities]) }.not_to raise_exception
            end

            it 'with Options instance and an instance of a custom object responding to #as_json' do
              expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome',
                                                                 'goog:chromeOptions': {},
                                                                 'company:key': 'value'}}})
              expect { described_class.new(capabilities: [Options.chrome, as_json_object.new]) }.not_to raise_exception
            end

            it 'with Options instance, Capabilities instance and instance of a custom object responding to #as_json' do
              capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
              options = Options.chrome(args: ['-f'])
              expect_request(body: {capabilities: {alwaysMatch: {browserName: 'chrome', invalid: 'foobar',
                                                                 'goog:chromeOptions': {args: ['-f']},
                                                                 'company:key': 'value'}}})

              expect {
                described_class.new(capabilities: [capabilities, options, as_json_object.new])
              }.not_to raise_exception
            end
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
