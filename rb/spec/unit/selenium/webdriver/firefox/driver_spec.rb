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
    module Firefox
      describe Driver do
        let(:service) do
          instance_double(Service, launch: service_manager, executable_path: nil, 'executable_path=': nil,
                                   class: Firefox::Service)
        end
        let(:service_manager) { instance_double(ServiceManager, uri: 'http://example.com') }
        let(:valid_response) do
          {status: 200,
           body: {value: {sessionId: 0, capabilities: {browserName: 'firefox'}}}.to_json,
           headers: {content_type: 'application/json'}}
        end
        let(:finder) { instance_double(DriverFinder, browser_path?: false, driver_path: '/path/to/driver') }

        def expect_request(body: nil, endpoint: nil)
          body = (body || {capabilities: {alwaysMatch: {acceptInsecureCerts: true,
                                                        browserName: 'firefox',
                                                        'moz:firefoxOptions': {prefs: {'remote.active-protocols' => 3}},
                                                        'moz:debuggerAddress': true}}}).to_json
          endpoint ||= "#{service_manager.uri}/session"
          stub_request(:post, endpoint).with(body: body).to_return(valid_response)
        end

        before do
          allow(Service).to receive_messages(new: service, executable_path: nil)
        end

        it 'uses DriverFinder when provided Service without path' do
          allow(DriverFinder).to receive(:new).and_return(finder)
          expect_request
          options = Options.new

          described_class.new(service: service, options: options)
          expect(finder).to have_received(:driver_path)
        end

        it 'does not use DriverFinder when provided Service with path' do
          expect_request
          allow(DriverFinder).to receive(:new).and_return(finder)
          allow(service).to receive(:executable_path).and_return('path')

          described_class.new(service: service)
          expect(finder).not_to have_received(:driver_path)
        end

        it 'does not require any parameters' do
          allow(DriverFinder).to receive(:new).and_return(finder)
          expect_request

          expect { described_class.new }.not_to raise_exception
        end

        it 'accepts provided Options as sole parameter' do
          allow(DriverFinder).to receive(:new).and_return(finder)

          opts = {args: ['-f']}
          expect_request(body: {capabilities: {alwaysMatch: {acceptInsecureCerts: true,
                                                             browserName: 'firefox',
                                                             'moz:firefoxOptions': {
                                                               args: ['-f'],
                                                               prefs: {'remote.active-protocols' => 3}},
                                                             'moz:debuggerAddress': true}}})
          expect { described_class.new(options: Options.new(**opts)) }.not_to raise_exception
        end

        it 'does not accept Options of the wrong class' do
          expect {
            described_class.new(options: Options.chrome)
          }.to raise_exception(ArgumentError, ':options must be an instance of Selenium::WebDriver::Firefox::Options')
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
