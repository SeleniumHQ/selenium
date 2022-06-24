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
        let(:service_path) { "/path/to/#{IE::Service::EXECUTABLE}" }

        before do
          allow(Platform).to receive(:assert_executable).and_return(true)
        end

        it 'uses default path and port' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.ie

          expect(service.executable_path).to include IE::Service::EXECUTABLE
          expected_port = IE::Service::DEFAULT_PORT
          expect(service.port).to eq expected_port
        end

        it 'uses provided path and port' do
          path = 'foo'
          port = 5678

          service = Service.ie(path: path, port: port)

          expect(service.executable_path).to eq path
          expect(service.port).to eq port
          expect(service.host).to eq Platform.localhost
        end

        it 'allows #driver_path= with String value' do
          path = '/path/to/driver'
          IE::Service.driver_path = path

          service = Service.ie

          expect(service.executable_path).to eq path
        end

        it 'allows #driver_path= with Proc value' do
          path = '/path/to/driver'
          proc = proc { path }
          IE::Service.driver_path = proc

          service = Service.ie

          expect(service.executable_path).to eq path
        end

        it 'does not create args by default' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.ie

          expect(service.extra_args).to be_empty
        end

        it 'uses provided args' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.ie(args: ['--foo', '--bar'])

          expect(service.extra_args).to eq ['--foo', '--bar']
        end

        # This is deprecated behavior
        it 'uses args when passed in as a Hash' do
          allow(Platform).to receive(:find_binary).and_return(service_path)

          service = Service.ie(args: {log_file: '/path/to/log',
                                      silent: true})

          expect(service.extra_args).to eq ['--log-file=/path/to/log', '--silent']
        end
      end

      context 'when initializing driver' do
        let(:driver) { IE::Driver }
        let(:service) { instance_double(Service, launch: service_manager) }
        let(:service_manager) { instance_double(ServiceManager, uri: 'http://example.com') }
        let(:bridge) { instance_double(Remote::Bridge, quit: nil, create_session: {}) }

        before do
          allow(Remote::Bridge).to receive(:new).and_return(bridge)
          allow(ServiceManager).to receive(:new).and_return(service_manager)
          allow(bridge).to receive(:browser).and_return(:internet_explorer)
        end

        it 'is not created when :url is provided' do
          expect(ServiceManager).not_to receive(:new)
          expect(Service).not_to receive(:new)

          driver.new(url: 'http://example.com:4321')
        end

        it 'is created when :url is not provided' do
          allow(Service).to receive(:new).and_return(service)

          driver.new
          expect(Service).to have_received(:new).with(no_args)
        end

        it 'accepts :service without creating a new instance' do
          expect(Service).not_to receive(:new)

          driver.new(service: service)
        end
      end
    end
  end # WebDriver
end # Selenium
