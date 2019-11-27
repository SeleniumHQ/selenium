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
        let(:resp) do
          {status: 200,
           body: "{\"value\":{\"sessionId\":\"0\",\"capabilities\":#{Remote::Capabilities.chrome.to_json}}}",
           headers: {"content_type": "application/json"}}
        end

        def stub_response(body: nil, endpoint: nil)
          body = (body || {capabilities: {firstMatch: [browserName: "chrome"]}}).to_json
          endpoint ||= "http://127.0.0.1:4444/wd/hub/session"
          stub_request(:post, endpoint).with(body: body).to_return(resp)
        end

        it 'requires default capabilities' do
          stub_response(body: {capabilities: {firstMatch: [{}]}})

          expect { Driver.new }.not_to raise_exception
        end

        it 'accepts :desired_capabilities value as a symbol' do
          stub_response

          expect { Driver.new(desired_capabilities: :chrome) }.not_to raise_exception
        end

        it 'uses provided URL' do
          server = "http://example.com:4646/wd/hub"
          stub_response(endpoint: "#{server}/session")

          expect { Driver.new(desired_capabilities: :chrome, url: server) }.not_to raise_exception
        end

        it 'does not accept Options without Capabilities' do
          opts = {args: ['-f']}
          stub_response(body: {capabilities: {firstMatch: ["goog:chromeOptions": opts]}})

          expect { Driver.new(options: Chrome::Options.new(opts)) }.not_to raise_exception
        end

        it 'uses provided Options' do
          opts = {args: ['-f']}
          stub_response(body: {capabilities: {firstMatch: [browserName: "chrome", "goog:chromeOptions": opts]}})

          expect {
            Driver.new(desired_capabilities: :chrome, options: Chrome::Options.new(opts))
          }.not_to raise_exception
        end

        it 'uses provided HTTP Client' do
          client = Remote::Http::Default.new
          stub_response

          driver = Driver.new(desired_capabilities: :chrome, http_client: client)
          expect(driver.send(:bridge).http).to eq client
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
