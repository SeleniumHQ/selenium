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
    module Firefox
      describe Bridge do
        let(:resp) { {'sessionId' => 'foo', 'value' => @expected_capabilities.as_json} }
        let(:launcher) { double(Launcher, launch: nil, quit: nil, url: 'http://localhost:4444/wd/hub') }
        let(:http) { double(Remote::Http::Default).as_null_object }
        let(:args) { [:post, "session", {desiredCapabilities: @expected_capabilities}] }

        before do
          @expected_capabilities = Remote::Capabilities.firefox
          @capabilities = Remote::Capabilities.firefox
          allow(Launcher).to receive(:new).and_return(launcher)
        end

        it 'accepts a launcher port and a profile' do
          profile = Profile.new
          port = 1234
          expect(Launcher).to receive(:new).with(instance_of(Binary), port, profile).and_return(launcher)
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http, port: port, profile: profile)
        end

        it 'uses the default capabilities' do
          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http)

          expect(bridge.capabilities).to eq @expected_capabilities
        end

        it 'accepts custom capabilities' do
          profile = Profile.new
          opts = {browser_name: 'firefox',
                  foo: 'bar',
                  'moo' => 'tar',
                  firefox_provile: profile,
                  javascript_enabled: true,
                  css_selectors_enabled: true}
          opts.each { |k, v| @expected_capabilities[k] = v }
          opts.each { |k, v| @capabilities[k] = v }

          allow(http).to receive(:call).with(*args).and_return(resp)
          bridge = Bridge.new(http_client: http, desired_capabilities: @capabilities)

          expect(bridge.capabilities).to eq @expected_capabilities
        end

        it 'raises exception when required capability is not met'

        it 'accepts profile' do
          profile = Profile.new
          @expected_capabilities.firefox_profile = profile
          @capabilities.firefox_profile = profile

          expect(Launcher).to receive(:new).with(instance_of(Binary), anything, profile).and_return(launcher)
          allow(http).to receive(:call).with(*args).and_return(resp)

          Bridge.new(http_client: http, desired_capabilities: @capabilities)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
