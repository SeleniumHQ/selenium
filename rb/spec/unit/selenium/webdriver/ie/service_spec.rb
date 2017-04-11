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
      describe Service do
        let(:resp) { {'sessionId' => 'foo', 'value' => Remote::Capabilities.ie.as_json} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps) { Remote::Capabilities.ie }
        let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:ie).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired path and port' do
          expect(Service).to receive(:new).with(IE.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

          Driver.new(http_client: http)
        end

        it 'accepts a driver path & port' do
          path = '/foo/iedriver'
          port = '1234'
          expect(Service).to receive(:new).with(path, '1234', {}).and_return(service)

          Driver.new(http_client: http, driver_path: path, port: port)
        end

        it 'accepts driver options' do
          driver_opts = {log_level: :debug,
                         log_file: '/foo',
                         implementation: :vendor,
                         host: 'localhost',
                         extract_path: '/bar',
                         silent: true}

          args = ["--log-level=DEBUG",
                  "--log-file=/foo",
                  "--implementation=VENDOR",
                  "--host=localhost",
                  "--extract_path=/bar",
                  "--silent"]

          driver = Driver.new(http_client: http, driver_opts: driver_opts)
          expect(driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'deprecates `service_args`' do
          args = ["--log-level=DEBUG",
                  "--log-file=/foo",
                  "--implementation=VENDOR",
                  "--host=localhost",
                  "--extract_path=/bar",
                  "--silent"]

          message = /\[DEPRECATION\] `:service_args` is deprecated. Pass switches using `driver_opts`/

          expect { @driver = Driver.new(http_client: http, service_args: args) }.to output(message).to_stdout_from_any_process
          expect(@driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end
      end
    end # IE
  end # WebDriver
end # Selenium
