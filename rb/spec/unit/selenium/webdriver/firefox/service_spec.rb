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
      describe Service do
        let(:resp) { {'value' => {'sessionId' => 'foo', 'value' => Remote::Capabilities.firefox.as_json}} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps) { Remote::Capabilities.firefox }
        let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:firefox).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired path and port' do
          expect(Service).to receive(:new).with(Firefox.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

          Driver.new(http_client: http)
        end

        it 'accepts a driver path & port' do
          path = '/foo/firefoxdriver'
          port = '1234'
          expect(Service).to receive(:new).with(path, '1234', {}).and_return(service)

          Driver.new(http_client: http, driver_path: path, port: port)
        end

        it 'accepts driver options' do
          driver_opts = {binary: '/path/to/bin',
                         marionette_port: '9721',
                         host: 'localhost',
                         log: '/path/to/log'}

          args = ["--binary=#{driver_opts[:binary]}",
                  "–-log=#{driver_opts[:log]}",
                  "–-marionette-port=#{driver_opts[:marionette_port]}",
                  "–-host=#{driver_opts[:host]}"]

          driver = Driver.new(http_client: http, driver_opts: driver_opts)
          expect(driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'deprecates `service_args`' do
          args = ["--binary=/path/to/bin",
                  "–-log=/path/to/log",
                  "–-marionette-port=9721",
                  "–-host=localhost"]

          message = /\[DEPRECATION\] `:service_args` is deprecated. Pass switches using `driver_opts`/

          expect { @driver = Driver.new(http_client: http, service_args: args) }.to output(message).to_stdout_from_any_process
          expect(@driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

      end
    end # Firefox
  end # WebDriver
end # Selenium
