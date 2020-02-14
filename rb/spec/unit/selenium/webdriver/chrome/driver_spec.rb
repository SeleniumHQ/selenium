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
    module Chrome
      describe Driver do
        let(:service) { instance_double(Service, start: true, uri: 'http://localhost') }
        let(:valid_response) do
          {status: 200,
           body: {value: {sessionId: 0, capabilities: Remote::Capabilities.chrome}}.to_json,
           headers: {"content_type": "application/json"}}
        end

        def expect_request(body: nil, endpoint: nil)
          body = (body || {capabilities: {firstMatch: [browserName: "chrome"]}}).to_json
          endpoint ||= "#{service.uri}/session"
          stub_request(:post, endpoint).with(body: body).to_return(valid_response)
        end

        before do
          allow(Service).to receive(:new).and_return(service)
        end

        it 'does not require any parameters' do
          expect_request

          expect { Driver.new }.not_to raise_exception
        end

        it 'does not accept :desired_capabilities value as a Symbol' do
          # Note: this is not a valid capabilities packet, so it is not accepted
          expect_request(body: {capabilities: {firstMatch: ["chrome"]}})

          expect { Driver.new(desired_capabilities: :chrome) }.not_to raise_exception
        end

        context 'with :desired capabilities' do
          it 'accepts Capabilities.chrome' do
            capabilities = Remote::Capabilities.chrome(invalid: 'foobar')
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Snake Case as Symbols' do
            capabilities = Remote::Capabilities.new(browser_name: 'chrome', invalid: 'foobar')
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Symbols' do
            capabilities = Remote::Capabilities.new(browserName: 'chrome', invalid: 'foobar')
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts constructed Capabilities with Camel Case as Strings' do
            capabilities = Remote::Capabilities.new('browserName' => 'chrome', 'invalid' => 'foobar')
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts Hash with Camel Case keys as Symbols' do
            capabilities = {browserName: 'chrome', invalid: 'foobar'}
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end

          it 'accepts Hash with Camel Case keys as Strings' do
            capabilities = {"browserName" => 'chrome', "invalid" => 'foobar'}
            expect_request(body: {capabilities: {firstMatch: [browserName: "chrome", invalid: 'foobar']}})

            expect { Driver.new(desired_capabilities: capabilities) }.not_to raise_exception
          end
        end

        it 'accepts provided Options as sole parameter' do
          opts = {args: ['-f'], invalid: 'foobar'}
          expect_request(body: {capabilities: {firstMatch: ["browserName": "chrome", "goog:chromeOptions": opts]}})

          expect { Driver.new(options: Options.new(opts)) }.not_to raise_exception
        end

        it 'accepts combination of Options and Capabilities' do
          caps = Remote::Capabilities.chrome(invalid: 'foobar')
          browser_opts = {args: ['-f']}
          expect_request(body: {capabilities: {firstMatch: ["browserName": "chrome",
                                                            "invalid": "foobar",
                                                            "goog:chromeOptions": browser_opts]}})

          expect {
            Driver.new(options: Options.new(browser_opts), desired_capabilities: caps)
          }.not_to raise_exception
        end

        it 'raises an ArgumentError if parameter is not recognized' do
          msg = 'Unable to create a driver with parameters: {:invalid=>"foo"}'
          expect { Driver.new(invalid: 'foo') }.to raise_error(ArgumentError, msg)
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
