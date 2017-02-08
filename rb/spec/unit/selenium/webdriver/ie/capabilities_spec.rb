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
    module IE
      describe Bridge do
        let(:resp) { {'sessionId' => 'foo', 'value' => @expected_capabilities.as_json} }
        let(:service) { double(Service, start: nil, uri: 'http://example.com:1234') }
        let(:http) { double(Remote::Http::Default, call: resp).as_null_object }
        let(:args) { [:post, "session", {desiredCapabilities: @expected_capabilities}] }

        before do
          @expected_capabilities = Remote::Capabilities.internet_explorer
          @capabilities = Remote::Capabilities.internet_explorer
          allow(Service).to receive(:new).and_return(service)
        end

        it 'has ignore protected mode setting disabled by default' do
          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http)

          expect(bridge.capabilities.introduce_flakiness_by_ignoring_security_domains).to be false
        end

        it 'enables the ignore protected mode setting' do
          @expected_capabilities[:ignore_protected_mode_settings] = true
          @capabilities.introduce_flakiness_by_ignoring_security_domains = true
          allow(http).to receive(:call).with(*args).and_return(resp)

          bridge = Bridge.new(http_client: http, desired_capabilities: @capabilities)

          expect(bridge.capabilities.introduce_flakiness_by_ignoring_security_domains).to eq true
        end

        it 'has native events enabled by default' do
          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http)

          expect(bridge.capabilities.native_events).to be true
        end

        it 'disables native events' do
          @expected_capabilities.native_events = false
          allow(http).to receive(:call).with(*args).and_return(resp)

          @capabilities.native_events = false
          bridge = Bridge.new(http_client: http, desired_capabilities: @capabilities)

          expect(bridge.capabilities.native_events).to be false
        end
      end
    end # IE
  end # WebDriver
end # Selenium
