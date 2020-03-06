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
    describe Service do
      describe '#new' do
        let(:service_path) { "/path/to/#{Chrome::Service::EXECUTABLE}" }

        before do
          allow(Platform).to receive(:assert_executable).and_return(true)
        end

        it 'uses default path and port' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.chrome

          expect(service.executable_path).to include Chrome::Service::EXECUTABLE
          expected_port = Chrome::Service::DEFAULT_PORT
          expect(service.uri.to_s).to eq "http://#{Platform.localhost}:#{expected_port}"
        end

        it 'uses provided path and port' do
          path = 'foo'
          port = 5678

          service = Service.chrome(path: path, port: port)

          expect(service.executable_path).to eq path
          expect(service.uri.to_s).to eq "http://#{Platform.localhost}:#{port}"
        end

        it 'allows #driver_path= with String value' do
          path = '/path/to/driver'
          Chrome::Service.driver_path = path

          service = Service.chrome

          expect(service.executable_path).to eq path
        end

        it 'allows #driver_path= with Proc value' do
          path = '/path/to/driver'
          proc = proc { path }
          Chrome::Service.driver_path = proc

          service = Service.chrome

          expect(service.executable_path).to eq path
        end

        it 'accepts Chrome#driver_path= and Chrome#driver_path but throws deprecation notices' do
          path = '/path/to/driver'

          expect {
            Selenium::WebDriver::Chrome.driver_path = path
          }.to have_deprecated(:driver_path)

          expect {
            expect(Selenium::WebDriver::Chrome.driver_path).to eq path
          }.to have_deprecated(:driver_path)

          service = Service.chrome

          expect(service.executable_path).to eq path
        end

        it 'does not create args by default' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.chrome

          expect(service.instance_variable_get('@extra_args')).to be_empty
        end

        it 'uses provided args' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.chrome(args: ['--foo', '--bar'])

          expect(service.instance_variable_get('@extra_args')).to eq ['--foo', '--bar']
        end

        # This is deprecated behavior
        it 'uses args when passed in as a Hash' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.chrome(args: {log_path: '/path/to/log',
                                          verbose: true})

          expect(service.instance_variable_get('@extra_args')).to eq ['--log-path=/path/to/log', '--verbose']
        end
      end

      context 'when initializing driver' do
        let(:driver) { Chrome::Driver }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:bridge) { instance_double(Remote::Bridge, quit: nil, create_session: {}) }

        before { allow(Remote::Bridge).to receive(:new).and_return(bridge) }

        it 'is not created when :url is provided' do
          expect(Service).not_to receive(:new)

          driver.new(url: 'http://example.com:4321')
        end

        it 'is created when :url is not provided' do
          expect(Service).to receive(:new).and_return(service)

          driver.new
        end

        it 'accepts :driver_path but throws deprecation notice' do
          driver_path = '/path/to/driver'

          expect(Service).to receive(:new).with(path: driver_path,
                                                port: nil,
                                                args: nil).and_return(service)

          expect {
            driver.new(driver_path: driver_path)
          }.to have_deprecated(:service_driver_path)
        end

        it 'accepts :port but throws deprecation notice' do
          driver_port = 1234

          expect(Service).to receive(:new).with(path: nil,
                                                port: driver_port,
                                                args: nil).and_return(service)

          expect {
            driver.new(port: driver_port)
          }.to have_deprecated(:service_port)
        end

        it 'accepts :driver_opts but throws deprecation notice' do
          driver_opts = {foo: 'bar',
                         bar: ['--foo', '--bar']}

          expect(Service).to receive(:new).with(path: nil,
                                                port: nil,
                                                args: driver_opts).and_return(service)

          expect {
            driver.new(driver_opts: driver_opts)
          }.to have_deprecated(:service_driver_opts)
        end

        it 'accepts :service without creating a new instance' do
          expect(Service).not_to receive(:new)

          driver.new(service: service)
        end
      end
    end
  end # WebDriver
end # Selenium
