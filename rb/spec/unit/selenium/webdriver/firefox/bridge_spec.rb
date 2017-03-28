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
        let(:launcher) { double(Launcher, launch: true, url: 'http://example.com') }

        before { allow_any_instance_of(Bridge).to receive(:create_session) }

        context 'when URL is provided' do
          it 'does not start Launcher when URL set' do
            expect(Launcher).not_to receive(:new)

            Bridge.new(url: 'http://example.com:4321')
          end
        end

        context 'when URL is not provided' do
          before { allow(Launcher).to receive(:new).and_return(launcher) }

          it 'starts Launcher with default path and port when URL not set' do
            expect(Launcher).to receive(:new).with(instance_of(Binary), Firefox::DEFAULT_PORT, nil).and_return(launcher)

            Bridge.new
          end

          it 'passes arguments to Launcher' do
            driver_port = 1234
            profile = Profile.new
            expect(Launcher).to receive(:new).with(instance_of(Binary), driver_port, profile).and_return(launcher)

            Bridge.new(port: driver_port, profile: profile)
          end

          it 'uses default firefox capabilities when not set' do
            expect_any_instance_of(Bridge).to receive(:create_session).with(Remote::Capabilities.firefox)

            Bridge.new
          end

          it 'uses provided capabilities' do
            capabilities = Remote::Capabilities.firefox(version: '47')
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'passes through any value added to capabilities' do
            capabilities = Remote::Capabilities.firefox(random: {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'treats capabilities keys with symbols and camel case strings as equivalent' do
            capabilities_in = Remote::Capabilities.chrome(foo_bar: {'foo' => 'bar'})
            capabilities_out = Remote::Capabilities.chrome('fooBar' => {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities_out)

            Bridge.new(desired_capabilities: capabilities_in)
          end

          it 'accepts custom path' do
            allow(Platform).to receive(:assert_executable)
            firefox_path = 'path/to/firefox'
            expect(Binary).to receive(:path=).with(firefox_path)

            capabilities = Remote::Capabilities.firefox(firefox_binary: firefox_path)

            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'sets the proxy capability' do
            proxy = Proxy.new(http: 'localhost:1234')

            capabilities = Remote::Capabilities.firefox(proxy: proxy)
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(proxy: proxy)
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
