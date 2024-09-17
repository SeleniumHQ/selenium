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
    module Edge
      describe Service do
        describe '#new' do
          let(:service_path) { "/path/to/#{Service::EXECUTABLE}" }

          before do
            allow(Platform).to receive(:assert_executable)
            described_class.driver_path = nil
          end

          it 'uses default port and nil path' do
            service = described_class.new

            expect(service.port).to eq Service::DEFAULT_PORT
            expect(service.host).to eq Platform.localhost
            expect(service.executable_path).to be_nil
          end

          it 'uses provided path and port' do
            path = 'foo'
            port = 5678

            service = described_class.new(path: path, port: port)

            expect(service.executable_path).to eq path
            expect(service.port).to eq port
            expect(service.host).to eq Platform.localhost
          end

          it 'does not create args by default' do
            service = described_class.new

            expect(service.extra_args).to be_empty
          end

          it 'uses sets log path to stdout' do
            service = described_class.chrome(log: :stdout)

            expect(service.log).to eq $stdout
          end

          it 'uses sets log path to stderr' do
            service = described_class.chrome(log: :stderr)

            expect(service.log).to eq $stderr
          end

          it 'setting log output as a file converts to argument' do
            service = described_class.chrome(log: '/path/to/log.txt')

            expect(service.log).to be_nil
            expect(service.args).to eq ['--log-path=/path/to/log.txt']
          end

          it 'uses provided args' do
            service = described_class.new(args: ['--foo', '--bar'])

            expect(service.extra_args).to eq ['--foo', '--bar']
          end
        end

        context 'when initializing driver' do
          let(:driver) { Edge::Driver }
          let(:finder) { instance_double(DriverFinder, browser_path?: false, driver_path: '/path/to/driver') }
          let(:service) do
            instance_double(described_class, launch: service_manager, executable_path: nil, 'executable_path=': nil,
                                             class: described_class)
          end
          let(:service_manager) { instance_double(ServiceManager, uri: 'http://example.com') }
          let(:bridge) { instance_double(Remote::Bridge, quit: nil, create_session: {}) }

          before do
            allow(Remote::Bridge).to receive(:new).and_return(bridge)
            allow(bridge).to receive(:browser).and_return(:msedge)
          end

          it 'is not created when :url is provided' do
            allow(described_class).to receive(:new)

            expect {
              driver.new(url: 'http://example.com:4321')
            }.to raise_error(ArgumentError, "Can't initialize Selenium::WebDriver::Edge::Driver with :url")

            expect(described_class).not_to have_received(:new)
          end

          it 'is created when :url is not provided' do
            allow(DriverFinder).to receive(:new).and_return(finder)
            allow(described_class).to receive(:new).and_return(service)

            driver.new
            expect(described_class).to have_received(:new).with(no_args)
          end

          it 'accepts :service without creating a new instance' do
            allow(DriverFinder).to receive(:new).and_return(finder)
            allow(described_class).to receive(:new)

            driver.new(service: service)
            expect(described_class).not_to have_received(:new)
          end

          it 'setting log output as a file converts to argument' do
            service = described_class.chrome(log: '/path/to/log.txt')

            expect(service.log).to be_nil
            expect(service.args).to eq ['--log-path=/path/to/log.txt']
          end

          context 'with a path env variable' do
            let(:service) { described_class.new }
            let(:service_path) { "/path/to/#{Service::EXECUTABLE}" }

            before do
              ENV['SE_EDGEDRIVER'] = service_path
            end

            after { ENV.delete('SE_EDGEDRIVER') }

            it 'uses the path from the environment' do
              expect(service.executable_path).to match(/edgedriver/)
            end

            it 'updates the path after setting the environment variable' do
              ENV['SE_EDGEDRIVER'] = '/foo/bar'
              service.executable_path = service_path

              expect(service.executable_path).to match(/edgedriver/)
            end
          end
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
