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
    module IE
      describe Driver do
        let(:service) { instance_double(Service, launch: service_manager) }
        let(:service_manager) { instance_double(ServiceManager, uri: 'http://example.com') }
        let(:valid_response) do
          {status: 200,
           body: {value: {sessionId: 0, capabilities: Remote::Capabilities.ie}}.to_json,
           headers: {content_type: "application/json"}}
        end

        def expect_request(body: nil, endpoint: nil)
          body = (body || {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                        platformName: 'windows'}}}).to_json
          endpoint ||= "#{service_manager.uri}/session"
          stub_request(:post, endpoint).with(body: body).to_return(valid_response)
        end

        before do
          allow(Service).to receive_messages(new: service)
        end

        it 'does not require any parameters' do
          expect_request

          expect { Driver.new }.not_to raise_exception
        end

        it 'accepts provided Options as sole parameter' do
          opts = {invalid: 'foobar', args: ['-f']}
          expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                             'se:ieOptions': {invalid: "foobar",
                                                                              nativeEvents: true,
                                                                              'ie.browserCommandLineSwitches': "-f"}}}})

          expect { Driver.new(options: Options.new(**opts)) }.not_to raise_exception
        end

        context 'with :capabilities' do
          it 'accepts value as a Symbol' do
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                               platformName: 'windows'}}})
            expect { Driver.new(capabilities: :ie) }.not_to raise_exception
          end

          it 'accepts Capabilities.ie' do
            capabilities = Remote::Capabilities.ie(invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                               platformName: 'windows',
                                                               invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Snake Case as Symbols' do
            capabilities = Remote::Capabilities.new(browser_name: 'internet explorer', invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Symbols' do
            capabilities = Remote::Capabilities.new(browserName: 'internet explorer', invalid: 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer", invalid: 'foobar'}}})

            expect { Driver.new(capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Strings' do
            capabilities = Remote::Capabilities.new('browserName' => 'internet explorer', 'invalid' => 'foobar')
            expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer", invalid: 'foobar'}}})

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
              browser_opts = {start_page: 'http://selenium.dev'}
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                                 'se:ieOptions': {startPage: 'http://selenium.dev',
                                                                                  nativeEvents: true}}}})

              expect { Driver.new(capabilities: [Options.new(**browser_opts)]) }.not_to raise_exception
            end

            it 'with Capabilities instance' do
              capabilities = Remote::Capabilities.new(browser_name: 'internet explorer', invalid: 'foobar')
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer", invalid: 'foobar'}}})

              expect { Driver.new(capabilities: [capabilities]) }.not_to raise_exception
            end

            it 'with Options instance and an instance of a custom object responding to #as_json' do
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                                 'se:ieOptions': {nativeEvents: true},
                                                                 'company:key': 'value'}}})

              expect { Driver.new(capabilities: [Options.new, as_json_object.new]) }.not_to raise_exception
            end

            it 'with Options instance, Capabilities instance and instance of a custom object responding to #as_json' do
              capabilities = Remote::Capabilities.new(browser_name: 'internet explorer', invalid: 'foobar')
              options = Options.new(start_page: 'http://selenium.dev')
              expect_request(body: {capabilities: {alwaysMatch: {browserName: "internet explorer",
                                                                 invalid: 'foobar',
                                                                 'se:ieOptions': {startPage: 'http://selenium.dev',
                                                                                  nativeEvents: true},
                                                                 'company:key': 'value'}}})

              expect { Driver.new(capabilities: [capabilities, options, as_json_object.new]) }.not_to raise_exception
            end
          end
        end
      end
    end # IE
  end # WebDriver
end # Selenium
