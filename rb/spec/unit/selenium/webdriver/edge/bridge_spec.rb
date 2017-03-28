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
    module Edge
      describe Bridge do
        let(:service) { double(Service, host: 'localhost', start: true, uri: 'http://example.com') }

        before { allow_any_instance_of(Bridge).to receive(:create_session) }

        context 'when URL is provided' do
          it 'does not start Service when URL set' do
            expect(Service).not_to receive(:new)

            Bridge.new(url: 'http://example.com:4321')
          end
        end

        context 'when URL is not provided' do
          before { allow(Service).to receive(:new).and_return(service) }

          it 'starts Service with default path and port when URL not set' do
            expect(Service).to receive(:new).with(Edge.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

            Bridge.new
          end

          it 'passes arguments to Service' do
            driver_path = '/path/to/driver'
            driver_port = 1234
            driver_opts = {foo: 'bar',
                           bar: ['--foo', '--bar']}
            expect(Service).to receive(:new).with(driver_path, driver_port, driver_opts).and_return(service)

            Bridge.new(driver_path: driver_path, port: driver_port, driver_opts: driver_opts)
          end

          it ':service_args are passed in to Service as a deprecated parameter' do
            service_args = ['--foo', '--bar']

            expect(Service).to receive(:new).with(Edge.driver_path, Service::DEFAULT_PORT, args: service_args).and_return(service)

            message = "`:service_args` is deprecated. Pass switches using `driver_opts`"
            expect { Bridge.new(service_args: service_args) }.to output(/#{message}/).to_stdout_from_any_process
          end

          it 'uses default edge capabilities when not set' do
            expect_any_instance_of(Bridge).to receive(:create_session).with(Remote::W3CCapabilities.edge)

            Bridge.new
          end

          it 'uses provided capabilities' do
            capabilities = Remote::W3CCapabilities.edge(version: '47')
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'passes through any value added to capabilities' do
            capabilities = Remote::W3CCapabilities.edge(random: {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'treats capabilities keys with symbols and camel case strings as equivalent' do
            capabilities_in = Remote::W3CCapabilities.edge(foo_bar: {'foo' => 'bar'})
            capabilities_out = Remote::W3CCapabilities.edge('fooBar' => {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities_out)

            Bridge.new(desired_capabilities: capabilities_in)
          end

          it 'raises an ArgumentError if args is not an Array' do
            expect { Bridge.new(args: '--foo=bar') }.to raise_error(ArgumentError)
          end
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
