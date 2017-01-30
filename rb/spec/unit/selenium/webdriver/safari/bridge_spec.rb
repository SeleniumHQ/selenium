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
    module Safari
      describe Bridge do
        let(:resp) { {'sessionId' => 'foo', 'value' => @expected_capabilities.as_json} }
        let(:service) { double(Service, start: true, uri: 'http://example.com:1234') }
        let(:http) { double(Remote::Http::Default).as_null_object }
        let(:args) { [:post, "session", {desiredCapabilities: @expected_capabilities}] }

        before do
          allow(Service).to receive(:new).and_return(service)
          @expected_capabilities = Remote::Capabilities.safari
          @capabilities = Remote::Capabilities.safari
        end

        it 'accepts server URL' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'accepts a driver path and port' do
          path = '/foo/bar'
          port = 1234
          expect(Service).to receive(:new).with(path, port).and_return(service)
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http, driver_path: path, port: port)
        end

        it 'uses driver path from class' do
          path = '/foo/bar'
          allow(Platform).to receive(:assert_executable).with(path).and_return(true)
          allow(Platform).to receive(:assert_executable).with(nil).and_return(true)

          Safari.driver_path = path
          expect(Service).to receive(:new).with(path, Service::DEFAULT_PORT).and_return(service)
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http)
          Safari.driver_path = nil
        end

        it 'uses technical preview from class to set driver path' do
          allow(Platform).to receive(:assert_executable).with(Safari.technology_preview).and_return(true)
          Safari.technology_preview = true

          expect(Service).to receive(:new).with(Safari.technology_preview, Service::DEFAULT_PORT)
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http)
        end

        it 'uses the default capabilities' do
          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http)

          expect(bridge.capabilities).to eq @expected_capabilities
        end

        it 'accepts custom capabilities' do
          opts = {browser_name: 'safari',
                  foo: 'bar',
                  'moo' => 'tar',
                  safari_options: {'args' => %w[baz]},
                  javascript_enabled: true,
                  css_selectors_enabled: true}
          opts.each { |k, v| @expected_capabilities[k] = v }
          opts.each { |k, v| @capabilities[k] = v }

          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http, desired_capabilities: @capabilities)

          expect(bridge.capabilities).to eq @expected_capabilities
        end

        it 'raises exception when required capability is not met'

        it 'accepts options' do
          @expected_capabilities.safari_options['foo'] = 'bar'
          @capabilities.safari_options['foo'] = 'bar'

          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http, desired_capabilities: @capabilities)

          expect(bridge.capabilities.safari_options['foo']).to eq 'bar'
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
