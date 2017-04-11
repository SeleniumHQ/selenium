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
      describe Driver do
        let(:resp)    { {'sessionId' => 'foo', 'value' => Remote::Capabilities.internet_explorer.as_json} }
        let(:service) { instance_double(Service, start: nil, uri: 'http://example.com') }
        let(:caps)    { Remote::Capabilities.internet_explorer }
        let(:http)    { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:internet_explorer).and_return(caps)
          allow(Service).to receive(:binary_path).and_return('/foo')
          allow(Service).to receive(:new).and_return(service)
        end

        it 'raises ArgumentError if passed invalid options' do
          expect { Driver.new(foo: 'bar') }.to raise_error(ArgumentError)
        end

        it 'accepts the :introduce_flakiness_by_ignoring_security_domains option' do
          Driver.new(
            introduce_flakiness_by_ignoring_security_domains: true,
            http_client: http
          )

          expect(caps[:ignore_protected_mode_settings]).to be true
        end

        it 'has native events enabled by default' do
          Driver.new(http_client: http)

          expect(caps[:native_events]).to be true
        end

        it 'can disable native events' do
          Driver.new(
            native_events: false,
            http_client: http
          )

          expect(caps[:native_events]).to be false
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['ignoreProtectedModeSettings'] = true

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities]['ignoreProtectedModeSettings']).to be true
            resp
          end

          Driver.new(http_client: http, desired_capabilities: custom_caps)
        end

        it 'can override desired capabilities through direct arguments' do
          custom_caps = Remote::Capabilities.new
          custom_caps['ignoreProtectedModeSettings'] = false

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities][:ignore_protected_mode_settings]).to be true
            resp
          end

          Driver.new(
            http_client: http,
            desired_capabilities: custom_caps,
            introduce_flakiness_by_ignoring_security_domains: true
          )
        end
      end
    end # IE
  end # WebDriver
end # Selenium
